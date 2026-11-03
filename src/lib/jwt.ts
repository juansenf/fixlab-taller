import { SignJWT, jwtVerify } from "jose";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: "ADMIN" | "TECNICO";
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fixlab_default_jwt_secret_key_32_characters_minimum"
);

export const AUTH_COOKIE_NAME = "fixlab_session";

export async function signToken(payload: AuthUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      email: payload.email as string,
      nombre: payload.nombre as string,
      rol: payload.rol as "ADMIN" | "TECNICO",
    };
  } catch {
    return null;
  }
}
