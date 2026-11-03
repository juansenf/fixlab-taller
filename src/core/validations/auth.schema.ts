import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingrese un email válido")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterUserSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingrese un email válido")
    .trim()
    .toLowerCase(),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["ADMIN", "TECNICO"]).default("TECNICO"),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
