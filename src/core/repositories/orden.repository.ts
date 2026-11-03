import prisma from "@/lib/prisma";
import { EstadoOrden, Prisma } from "@prisma/client";
import { CreateOrdenInput, UpdateOrdenInput } from "../validations/orden.schema";

export class OrdenRepository {
  async getNextOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OT-${year}-`;

    const count = await prisma.ordenServicio.count();
    const nextNumber = String(count + 1).padStart(4, "0");

    return `${prefix}${nextNumber}`;
  }

  async findAll(filters?: { search?: string; estado?: string; tecnicoId?: string }) {
    return await prisma.ordenServicio.findMany({
      where: {
        isActive: true,
        ...(filters?.estado && filters.estado !== "TODAS"
          ? { estado: filters.estado as EstadoOrden }
          : {}),
        ...(filters?.tecnicoId ? { tecnicoAsignadoId: filters.tecnicoId } : {}),
        ...(filters?.search
          ? {
              OR: [
                { numeroOrden: { contains: filters.search, mode: "insensitive" } },
                { problemaReportado: { contains: filters.search, mode: "insensitive" } },
                {
                  equipo: {
                    OR: [
                      { marca: { contains: filters.search, mode: "insensitive" } },
                      { modelo: { contains: filters.search, mode: "insensitive" } },
                      {
                        cliente: {
                          OR: [
                            { nombre: { contains: filters.search, mode: "insensitive" } },
                            { dniCuit: { contains: filters.search, mode: "insensitive" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        equipo: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                dniCuit: true,
                telefono: true,
              },
            },
          },
        },
        tecnicoAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return await prisma.ordenServicio.findUnique({
      where: { id },
      include: {
        equipo: {
          include: {
            cliente: true,
          },
        },
        tecnicoAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });
  }

  async create(data: CreateOrdenInput & { numeroOrden: string }) {
    return await prisma.ordenServicio.create({
      data: {
        numeroOrden: data.numeroOrden,
        equipoId: data.equipoId,
        tecnicoAsignadoId: data.tecnicoAsignadoId || null,
        problemaReportado: data.problemaReportado,
        costoEstimado:
          data.costoEstimado !== undefined && data.costoEstimado !== null
            ? new Prisma.Decimal(data.costoEstimado)
            : null,
      },
      include: {
        equipo: {
          include: {
            cliente: true,
          },
        },
        tecnicoAsignado: true,
      },
    });
  }

  async update(id: string, data: UpdateOrdenInput & { fechaEgreso?: Date | null }) {
    return await prisma.ordenServicio.update({
      where: { id },
      data: {
        ...(data.tecnicoAsignadoId !== undefined
          ? { tecnicoAsignadoId: data.tecnicoAsignadoId || null }
          : {}),
        ...(data.problemaReportado ? { problemaReportado: data.problemaReportado } : {}),
        ...(data.diagnostico !== undefined ? { diagnostico: data.diagnostico || null } : {}),
        ...(data.estado ? { estado: data.estado as EstadoOrden } : {}),
        ...(data.costoEstimado !== undefined
          ? {
              costoEstimado:
                data.costoEstimado !== null ? new Prisma.Decimal(data.costoEstimado) : null,
            }
          : {}),
        ...(data.costoFinal !== undefined
          ? {
              costoFinal:
                data.costoFinal !== null ? new Prisma.Decimal(data.costoFinal) : null,
            }
          : {}),
        ...(data.fechaEgreso !== undefined ? { fechaEgreso: data.fechaEgreso } : {}),
      },
      include: {
        equipo: {
          include: {
            cliente: true,
          },
        },
        tecnicoAsignado: true,
      },
    });
  }

  async softDelete(id: string) {
    return await prisma.ordenServicio.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const ordenRepository = new OrdenRepository();
