import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { getSession, signSession } from "./session";

process.env.SESSION_SECRET ??= "test-secret-con-32-caracteres-minimo";

function fakeReq(token: string | null): Request {
  return new Request("http://localhost/", {
    headers: token ? { cookie: `onix_session=${token}` } : {},
  });
}

describe("session", () => {
  it("firma y verifica sesiones JWT", async () => {
    const t = await signSession("u1");
    assert((await getSession(fakeReq(t)))?.userId === "u1");
    assert((await getSession(fakeReq(t + "x"))) === null);
    assert((await getSession(fakeReq(null))) === null);
  });
});
