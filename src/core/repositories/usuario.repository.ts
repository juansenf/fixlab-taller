import prisma from "@/lib/prisma";
import { RolUsuario, Usuario } from "@prisma/client";

export class UsuarioRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    return await prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Usuario | null> {
    return await prisma.usuario.findUnique({
      where: { id },
    });
  }

  async findAllActive(): Promise<Omit<Usuario, "passwordHash">[]> {
    return await prisma.usuario.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nombre: "asc" },
    });
  }

  async create(data: {
    email: string;
    nombre: string;
    passwordHash: string;
    rol: RolUsuario;
  }): Promise<Usuario> {
    return await prisma.usuario.create({
      data,
    });
  }

  async softDelete(id: string): Promise<Usuario> {
    return await prisma.usuario.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const usuarioRepository = new UsuarioRepository();
