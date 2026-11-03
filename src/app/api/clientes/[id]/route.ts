import { NextRequest, NextResponse } from "next/server";
import { clienteService } from "@/core/services/cliente.service";
import { ClienteSchema } from "@/core/validations/cliente.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cliente = await clienteService.getClienteById(id);

    return NextResponse.json({ success: true, data: cliente });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener cliente";
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

    const parsed = ClienteSchema.partial().safeParse(body);
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

    const updated = await clienteService.updateCliente(id, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar cliente";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await clienteService.deleteCliente(id);

    return NextResponse.json({
      success: true,
      message: `Cliente ${deleted.nombre} dado de baja correctamente (baja lógica)`,
      data: { id: deleted.id, isActive: deleted.isActive },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar cliente";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
