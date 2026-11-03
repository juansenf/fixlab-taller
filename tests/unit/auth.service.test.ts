import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/core/services/auth.service";
import { UsuarioRepository } from "@/core/repositories/usuario.repository";
import bcrypt from "bcryptjs";

describe("AuthService (Seguridad y Autenticación)", () => {
  let authService: AuthService;
  let mockUserRepo: Partial<UsuarioRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    authService = new AuthService(mockUserRepo as UsuarioRepository);
  });

  it("debe autenticar exitosamente y retornar token si las credenciales son correctas", async () => {
    const passwordHash = await bcrypt.hash("Password123!", 10);

    (mockUserRepo.findByEmail as any).mockResolvedValue({
      id: "usr-1",
      email: "tecnico@fixlab.com",
      nombre: "Juan Técnico",
      passwordHash,
      rol: "TECNICO",
      isActive: true,
    });

    const result = await authService.login({
      email: "tecnico@fixlab.com",
      password: "Password123!",
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe("tecnico@fixlab.com");
    expect(result.user.rol).toBe("TECNICO");
  });

  it("debe rechazar el login si la contraseña no coincide", async () => {
    const passwordHash = await bcrypt.hash("PasswordCorrecta!", 10);

    (mockUserRepo.findByEmail as any).mockResolvedValue({
      id: "usr-1",
      email: "tecnico@fixlab.com",
      passwordHash,
      isActive: true,
    });

    await expect(
      authService.login({
        email: "tecnico@fixlab.com",
        password: "PasswordEquivocada",
      })
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("debe rechazar el acceso si la cuenta se encuentra dada de baja lógica (isActive: false)", async () => {
    const passwordHash = await bcrypt.hash("Password123!", 10);

    (mockUserRepo.findByEmail as any).mockResolvedValue({
      id: "usr-1",
      email: "inactivo@fixlab.com",
      passwordHash,
      isActive: false, // Baja lógica
    });

    await expect(
      authService.login({
        email: "inactivo@fixlab.com",
        password: "Password123!",
      })
    ).rejects.toThrow("La cuenta se encuentra inactiva");
  });
});
