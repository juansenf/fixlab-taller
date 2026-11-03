import bcrypt from "bcryptjs";
import { usuarioRepository, UsuarioRepository } from "../repositories/usuario.repository";
import { RegisterUserInput } from "../validations/auth.schema";
import { RolUsuario } from "@prisma/client";

export class UsuarioService {
  constructor(private userRepo: UsuarioRepository = usuarioRepository) {}

  async listUsuarios() {
    return await this.userRepo.findAllActive();
  }

  async getUsuarioById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user || !user.isActive) {
      throw new Error("El usuario solicitado no existe o se encuentra inactivo");
    }
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async createUsuario(data: RegisterUserInput) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error(`Ya existe una cuenta con el email: ${data.email}`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepo.create({
      email: data.email,
      nombre: data.nombre,
      passwordHash,
      rol: data.rol as RolUsuario,
    });

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async updateUsuario(
    id: string,
    data: { nombre?: string; email?: string; rol?: RolUsuario; password?: string }
  ) {
    const user = await this.userRepo.findById(id);
    if (!user || !user.isActive) {
      throw new Error("El usuario a modificar no existe o está inactivo");
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepo.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error(`El email ${data.email} ya está registrado`);
      }
    }

    let passwordHash: string | undefined = undefined;
    if (data.password && data.password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.userRepo.update(id, {
      ...(data.nombre ? { nombre: data.nombre } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.rol ? { rol: data.rol } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    });

    return {
      id: updated.id,
      email: updated.email,
      nombre: updated.nombre,
      rol: updated.rol,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    };
  }

  async deleteUsuario(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new Error("No puede darse de baja a usted mismo");
    }

    const user = await this.userRepo.findById(id);
    if (!user || !user.isActive) {
      throw new Error("El usuario no existe o ya ha sido dado de baja");
    }

    return await this.userRepo.softDelete(id);
  }
}

export const usuarioService = new UsuarioService();
