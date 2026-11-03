import { NextRequest, NextResponse } from "next/server";
import { ordenService } from "@/core/services/orden.service";
import { UpdateOrdenSchema } from "@/core/validations/orden.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orden = await ordenService.getOrdenById(id);

    return NextResponse.json({ success: true, data: orden });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener orden";
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

    const parsed = UpdateOrdenSchema.safeParse(body);
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

    const updated = await ordenService.updateOrden(id, parsed.data);

    return NextResponse.json({
      success: true,
      message: `Orden ${updated.numeroOrden} actualizada correctamente`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar orden";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await ordenService.deleteOrden(id);

    return NextResponse.json({
      success: true,
      message: `Orden ${deleted.numeroOrden} dada de baja (baja lógica)`,
      data: { id: deleted.id, isActive: deleted.isActive },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar orden";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
