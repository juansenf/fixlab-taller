import { NextRequest, NextResponse } from "next/server";
import { usuarioService } from "@/core/services/usuario.service";
import { RegisterUserSchema } from "@/core/validations/auth.schema";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

// Helper de seguridad: Validar que el solicitante sea Administrador
async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user || user.rol !== "ADMIN") return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Acceso no autorizado. Se requieren permisos de Administrador." },
        { status: 403 }
      );
    }

    const usuarios = await usuarioService.listUsuarios();
    return NextResponse.json({ success: true, data: usuarios });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener usuarios";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Acceso no autorizado. Se requieren permisos de Administrador." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = RegisterUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de usuario inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const nuevoUsuario = await usuarioService.createUsuario(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: `Usuario ${nuevoUsuario.nombre} (${nuevoUsuario.rol}) creado exitosamente`,
        data: nuevoUsuario,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al crear usuario";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
