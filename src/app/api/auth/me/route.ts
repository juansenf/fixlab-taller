import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { usuarioRepository } from "@/core/repositories/usuario.repository";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const user = await usuarioRepository.findById(payload.id);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Usuario inactivo o no encontrado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener perfil";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
