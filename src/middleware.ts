import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

// Rutas protegidas que requieren autenticación
const PROTECTED_PREFIXES = ["/dashboard", "/clientes", "/equipos", "/ordenes", "/usuarios"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 1. Si intenta ingresar a una ruta protegida sin sesión válida -> Redirigir al Login
  if (isProtected && !user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Control de Acceso Basado en Roles (RBAC): La ruta /usuarios solo la puede ver el Administrador
  if (pathname.startsWith("/usuarios") && user?.rol !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
  }

  // 3. Si ya está autenticado e intenta ir a /login -> Redirigir al Dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clientes/:path*",
    "/equipos/:path*",
    "/ordenes/:path*",
    "/usuarios/:path*",
    "/login",
  ],
};
