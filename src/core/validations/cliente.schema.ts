import { z } from "zod";

export const ClienteSchema = z.object({
  dniCuit: z
    .string()
    .min(7, "El DNI o CUIT debe tener al menos 7 dígitos")
    .max(15, "El DNI o CUIT no puede exceder 15 caracteres")
    .trim(),
  nombre: z
    .string()
    .min(2, "El nombre o razón social debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  telefono: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 dígitos")
    .max(30, "El teléfono no puede exceder 30 caracteres")
    .trim(),
  email: z
    .string()
    .email("Ingrese un correo electrónico válido")
    .trim()
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  direccion: z
    .string()
    .max(150, "La dirección no puede exceder 150 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ClienteInput = z.infer<typeof ClienteSchema>;
