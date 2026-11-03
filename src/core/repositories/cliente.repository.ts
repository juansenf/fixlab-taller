import prisma from "@/lib/prisma";
import { Cliente } from "@prisma/client";
import { ClienteInput } from "../validations/cliente.schema";

export class ClienteRepository {
  async findAll(search?: string): Promise<Cliente[]> {
    return await prisma.cliente.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { nombre: { contains: search, mode: "insensitive" } },
                { dniCuit: { contains: search, mode: "insensitive" } },
                { telefono: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return await prisma.cliente.findUnique({
      where: { id },
      include: {
        equipos: {
          where: { isActive: true },
          include: {
            ordenes: {
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
  }

  async findByDni(dniCuit: string): Promise<Cliente | null> {
    return await prisma.cliente.findUnique({
      where: { dniCuit },
    });
  }

  async create(data: ClienteInput): Promise<Cliente> {
    return await prisma.cliente.create({
      data: {
        dniCuit: data.dniCuit,
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
      },
    });
  }

  async update(id: string, data: Partial<ClienteInput>): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: {
        ...(data.dniCuit ? { dniCuit: data.dniCuit } : {}),
        ...(data.nombre ? { nombre: data.nombre } : {}),
        ...(data.telefono ? { telefono: data.telefono } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
        ...(data.direccion !== undefined ? { direccion: data.direccion || null } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const clienteRepository = new ClienteRepository();
