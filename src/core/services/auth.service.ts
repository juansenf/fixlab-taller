import bcrypt from "bcryptjs";
import { usuarioRepository, UsuarioRepository } from "../repositories/usuario.repository";
import { LoginInput, RegisterUserInput } from "../validations/auth.schema";
import { signToken, AuthUser } from "@/lib/jwt";
import { RolUsuario } from "@prisma/client";

export class AuthService {
  constructor(private userRepo: UsuarioRepository = usuarioRepository) {}

  async login(credentials: LoginInput): Promise<{ token: string; user: AuthUser }> {
    const user = await this.userRepo.findByEmail(credentials.email);

    if (!user) {
      throw new Error("Credenciales inválidas. Verifique el email o la contraseña.");
    }

    if (!user.isActive) {
      throw new Error("La cuenta se encuentra inactiva. Contacte al administrador.");
    }

    const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Credenciales inválidas. Verifique el email o la contraseña.");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };

    const token = await signToken(authUser);

    return { token, user: authUser };
  }

  async register(data: RegisterUserInput): Promise<AuthUser> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error("Ya existe un usuario registrado con ese correo electrónico.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = await this.userRepo.create({
      email: data.email,
      nombre: data.nombre,
      passwordHash,
      rol: data.rol as RolUsuario,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      rol: newUser.rol,
    };
  }
}

export const authService = new AuthService();
