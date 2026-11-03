import { NextRequest, NextResponse } from "next/server";
import { equipoService } from "@/core/services/equipo.service";
import { EquipoSchema } from "@/core/validations/equipo.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipo = await equipoService.getEquipoById(id);

    return NextResponse.json({ success: true, data: equipo });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener equipo";
    return NextResponse.json({ success: false, message }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = EquipoSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de actualización inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await equipoService.updateEquipo(id, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Equipo actualizado correctamente",
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar equipo";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await equipoService.deleteEquipo(id);

    return NextResponse.json({
      success: true,
      message: `Equipo ${deleted.marca} ${deleted.modelo} dado de baja (baja lógica)`,
      data: { id: deleted.id, isActive: deleted.isActive },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar equipo";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
