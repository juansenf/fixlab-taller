import { z } from "zod";

export const EquipoSchema = z.object({
  clienteId: z
    .string()
    .min(1, "Debe seleccionar un cliente"),
  tipo: z
    .string()
    .min(2, "El tipo de equipo debe tener al menos 2 caracteres")
    .max(50, "El tipo de equipo no puede exceder 50 caracteres")
    .trim(),
  marca: z
    .string()
    .min(2, "La marca debe tener al menos 2 caracteres")
    .max(50, "La marca no puede exceder 50 caracteres")
    .trim(),
  modelo: z
    .string()
    .min(1, "El modelo es obligatorio")
    .max(80, "El modelo no puede exceder 80 caracteres")
    .trim(),
  numeroSerie: z
    .string()
    .max(80, "El número de serie no puede exceder 80 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  accesorios: z
    .string()
    .max(150, "Los accesorios no pueden exceder 150 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type EquipoInput = z.infer<typeof EquipoSchema>;
