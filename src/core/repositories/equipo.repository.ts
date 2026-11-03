import prisma from "@/lib/prisma";
import { Equipo } from "@prisma/client";
import { EquipoInput } from "../validations/equipo.schema";

export class EquipoRepository {
  async findAll(filters?: { search?: string; clienteId?: string }) {
    return await prisma.equipo.findMany({
      where: {
        isActive: true,
        ...(filters?.clienteId ? { clienteId: filters.clienteId } : {}),
        ...(filters?.search
          ? {
              OR: [
                { tipo: { contains: filters.search, mode: "insensitive" } },
                { marca: { contains: filters.search, mode: "insensitive" } },
                { modelo: { contains: filters.search, mode: "insensitive" } },
                { numeroSerie: { contains: filters.search, mode: "insensitive" } },
                { cliente: { nombre: { contains: filters.search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
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
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return await prisma.equipo.findUnique({
      where: { id },
      include: {
        cliente: true,
        ordenes: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async create(data: EquipoInput): Promise<Equipo> {
    return await prisma.equipo.create({
      data: {
        clienteId: data.clienteId,
        tipo: data.tipo,
        marca: data.marca,
        modelo: data.modelo,
        numeroSerie: data.numeroSerie || null,
        accesorios: data.accesorios || null,
      },
    });
  }

  async update(id: string, data: Partial<EquipoInput>): Promise<Equipo> {
    return await prisma.equipo.update({
      where: { id },
      data: {
        ...(data.clienteId ? { clienteId: data.clienteId } : {}),
        ...(data.tipo ? { tipo: data.tipo } : {}),
        ...(data.marca ? { marca: data.marca } : {}),
        ...(data.modelo ? { modelo: data.modelo } : {}),
        ...(data.numeroSerie !== undefined ? { numeroSerie: data.numeroSerie || null } : {}),
        ...(data.accesorios !== undefined ? { accesorios: data.accesorios || null } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<Equipo> {
    return await prisma.equipo.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const equipoRepository = new EquipoRepository();
