import { NextRequest, NextResponse } from "next/server";
import { usuarioService } from "@/core/services/usuario.service";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user || user.rol !== "ADMIN") return null;
  return user;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Acceso no autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const user = await usuarioService.getUsuarioById(id);

    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener usuario";
    return NextResponse.json({ success: false, message }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Acceso no autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await usuarioService.updateUsuario(id, body);

    return NextResponse.json({
      success: true,
      message: `Usuario ${updated.nombre} actualizado correctamente`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar usuario";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Acceso no autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await usuarioService.deleteUsuario(id, admin.id);

    return NextResponse.json({
      success: true,
      message: `Usuario ${deleted.nombre} dado de baja correctamente (baja lógica)`,
      data: { id: deleted.id, isActive: deleted.isActive },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al dar de baja usuario";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
