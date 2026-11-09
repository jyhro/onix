import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { compare, hash } from "bcryptjs";

export type Role = "owner" | "admin" | "user";
export type Perm = "read" | "write";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Grant {
  userId: string;
  wsId: string;
  perms: Perm[];
}

interface StoredUser extends User {
  passwordHash: string;
}

function systemDir(): string {
  return path.join(process.env.DATA_ROOT ?? "./data", "system");
}

function filePath(name: string): string {
  return path.join(path.resolve(systemDir()), name);
}

function readJsonSync<T>(name: string): T[] {
  try {
    return JSON.parse(readFileSync(filePath(name), "utf8")) as T[];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw e;
  }
}

async function readJson<T>(name: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(filePath(name), "utf8")) as T[];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw e;
  }
}

// Escritura atómica: tmp + rename.
async function writeJson(name: string, rows: unknown[]): Promise<void> {
  const dest = filePath(name);
  await mkdir(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await rename(tmp, dest);
}

function cleanName(name: string): string {
  const clean = (name ?? "").trim();
  if (!clean) throw Object.assign(new Error("nombre vacío"), { status: 400 });
  return clean;
}

function publicUser(u: StoredUser): User {
  return { id: u.id, name: u.name, role: u.role };
}

export async function createUser(input: {
  name: string;
  password: string;
  role: Role;
}): Promise<User> {
  const name = cleanName(input.name);
  if (!input.password) throw Object.assign(new Error("password vacío"), { status: 400 });
  if (input.role !== "owner" && input.role !== "admin" && input.role !== "user") {
    throw Object.assign(new Error(`rol inválido: ${input.role}`), { status: 400 });
  }
  const users = await readJson<StoredUser>("users.json");
  if (users.some((u) => u.name === name)) {
    throw Object.assign(new Error(`usuario duplicado: ${name}`), { status: 409 });
  }
  const user: StoredUser = {
    id: randomUUID(),
    name,
    role: input.role,
    passwordHash: await hash(input.password, 10),
  };
  await writeJson("users.json", [...users, user]);
  return publicUser(user);
}

export async function verifyUser(name: string, password: string): Promise<User | null> {
  if (typeof password !== "string" || !password) return null;
  const users = await readJson<StoredUser>("users.json");
  const found = users.find((u) => u.name === (name ?? "").trim());
  if (!found) return null;
  if (!(await compare(password, found.passwordHash))) return null;
  return publicUser(found);
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const ws: Workspace = { id: randomUUID(), name: cleanName(name) };
  const all = await readJson<Workspace>("workspaces.json");
  await writeJson("workspaces.json", [...all, ws]);
  return ws;
}

export async function grant(
  userId: string,
  wsId: string,
  perms: Perm | Perm[],
): Promise<Grant> {
  const list = Array.isArray(perms) ? perms : [perms];
  for (const p of list) {
    if (p !== "read" && p !== "write") {
      throw Object.assign(new Error(`permiso inválido: ${p}`), { status: 400 });
    }
  }
  const grants = await readJson<Grant>("grants.json");
  const found = grants.find((g) => g.userId === userId && g.wsId === wsId);
  if (found) {
    found.perms = [...new Set([...found.perms, ...list])];
    await writeJson("grants.json", grants);
    return found;
  }
  const created: Grant = { userId, wsId, perms: [...new Set(list)] };
  await writeJson("grants.json", [...grants, created]);
  return created;
}

// Síncrono a propósito: el chequeo de permisos no hace hash ni escribe.
export function can(userId: string, wsId: string, perm: Perm): boolean {
  const users = readJsonSync<StoredUser>("users.json");
  // owner/admin bypassan los grants.
  const role = users.find((u) => u.id === userId)?.role;
  if (role === "owner" || role === "admin") return true;
  const g = readJsonSync<Grant>("grants.json").find(
    (x) => x.userId === userId && x.wsId === wsId,
  );
  if (!g) return false;
  // write implica read.
  if (perm === "read" && g.perms.includes("write")) return true;
  return g.perms.includes(perm);
}
