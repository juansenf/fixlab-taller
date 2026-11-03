import { z } from "zod";

export const ESTADOS_ORDEN = [
  "PENDIENTE",
  "EN_DIAGNOSTICO",
  "EN_REPARACION",
  "LISTO_ENTREGA",
  "ENTREGADO",
  "CANCELADO",
] as const;

export const CreateOrdenSchema = z.object({
  equipoId: z
    .string()
    .min(1, "Debe seleccionar un equipo para la orden"),
  tecnicoAsignadoId: z
    .string()
    .optional()
    .nullable(),
  problemaReportado: z
    .string()
    .min(5, "El problema reportado debe tener al menos 5 caracteres")
    .max(500, "El problema reportado no puede exceder 500 caracteres")
    .trim(),
  costoEstimado: z
    .coerce
    .number()
    .min(0, "El costo estimado no puede ser negativo")
    .optional()
    .nullable(),
});

export type CreateOrdenInput = z.infer<typeof CreateOrdenSchema>;

export const UpdateOrdenSchema = z.object({
  tecnicoAsignadoId: z
    .string()
    .optional()
    .nullable(),
  problemaReportado: z
    .string()
    .min(5, "El problema reportado debe tener al menos 5 caracteres")
    .max(500, "El problema reportado no puede exceder 500 caracteres")
    .trim()
    .optional(),
  diagnostico: z
    .string()
    .max(500, "El diagnóstico técnico no puede exceder 500 caracteres")
    .trim()
    .optional()
    .nullable(),
  estado: z.enum(ESTADOS_ORDEN).optional(),
  costoEstimado: z
    .coerce
    .number()
    .min(0, "El costo estimado no puede ser negativo")
    .optional()
    .nullable(),
  costoFinal: z
    .coerce
    .number()
    .min(0, "El costo final no puede ser negativo")
    .optional()
    .nullable(),
});

export type UpdateOrdenInput = z.infer<typeof UpdateOrdenSchema>;
