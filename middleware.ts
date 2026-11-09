import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const PUBLIC = ["/", "/login", "/setup", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (!process.env.SESSION_SECRET) {
    return isApi
      ? NextResponse.json({ error: "sesiones no configuradas" }, { status: 401 })
      : new NextResponse("sesiones no configuradas", { status: 401 });
  }

  if (pathname.startsWith("/_next/") || PUBLIC.includes(pathname)) {
    return NextResponse.next();
  }

  const session = await getSession(req);
  if (!session) {
    if (isApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Grants (403) se verifican en cada ruta (Node runtime): el Edge Runtime
  // del middleware no puede leer los JSON del sistema. Sin sesión → 401 aquí.
  // Excepción: /admin/* se cierra por rol del JWT (sin fs): owner|admin pasan,
  // con sesión pero otro rol → 403 real antes del render (el streaming PPR no
  // puede cambiar el status una vez emitido el shell). Sesión válida sin claim
  // `role` (anterior al fix) → redirect a /login para re-autenticar, no 403:
  // sin UI de cambio de roles el claim no se desactualiza y esto basta.
  if (pathname.startsWith("/admin/")) {
    const role = session.role;
    if (role === undefined) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (role !== "owner" && role !== "admin") {
      return new NextResponse("sin permiso", { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
