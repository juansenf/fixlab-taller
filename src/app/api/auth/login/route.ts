import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/core/services/auth.service";
import { LoginSchema } from "@/core/validations/auth.schema";
import { AUTH_COOKIE_NAME } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validación en Backend con Zod
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de formulario inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Ejecutar servicio de autenticación
    const { token, user } = await authService.login(parsed.data);

    // 3. Crear respuesta con Cookie HttpOnly segura
    const response = NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 401 }
    );
  }
}
