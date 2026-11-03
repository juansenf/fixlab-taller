import { NextRequest, NextResponse } from "next/server";
import { equipoService } from "@/core/services/equipo.service";
import { EquipoSchema } from "@/core/validations/equipo.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || undefined;
    const clienteId = searchParams.get("clienteId") || undefined;

    const equipos = await equipoService.listEquipos({ search, clienteId });

    return NextResponse.json({
      success: true,
      data: equipos,
      total: equipos.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener equipos";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validación estricta en Backend con Zod
    const parsed = EquipoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de equipo inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Ejecución del servicio
    const equipo = await equipoService.createEquipo(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Equipo registrado exitosamente",
        data: equipo,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al registrar equipo";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
