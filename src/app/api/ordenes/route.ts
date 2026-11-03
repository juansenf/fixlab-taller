import { NextRequest, NextResponse } from "next/server";
import { ordenService } from "@/core/services/orden.service";
import { CreateOrdenSchema } from "@/core/validations/orden.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const tecnicoId = searchParams.get("tecnicoId") || undefined;

    const ordenes = await ordenService.listOrdenes({ search, estado, tecnicoId });

    return NextResponse.json({
      success: true,
      data: ordenes,
      total: ordenes.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener órdenes";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validación estricta con Zod
    const parsed = CreateOrdenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de la orden de servicio inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const nuevaOrden = await ordenService.createOrden(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: `Orden ${nuevaOrden.numeroOrden} creada exitosamente`,
        data: nuevaOrden,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al crear orden de servicio";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
