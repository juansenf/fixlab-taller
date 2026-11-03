import { NextRequest, NextResponse } from "next/server";
import { clienteService } from "@/core/services/cliente.service";
import { ClienteSchema } from "@/core/validations/cliente.schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || undefined;

    const clientes = await clienteService.listClientes(search);
    return NextResponse.json({
      success: true,
      data: clientes,
      total: clientes.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener clientes";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validación exhaustiva en Backend (Segunda capa)
    const parsed = ClienteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de cliente inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Ejecución de lógica de negocio
    const cliente = await clienteService.createCliente(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Cliente registrado exitosamente",
        data: cliente,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al registrar cliente";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
