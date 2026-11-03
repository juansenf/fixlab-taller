import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrdenService } from "@/core/services/orden.service";
import { OrdenRepository } from "@/core/repositories/orden.repository";
import { EquipoRepository } from "@/core/repositories/equipo.repository";
import { UsuarioRepository } from "@/core/repositories/usuario.repository";

describe("OrdenService (Reglas de Negocio)", () => {
  let ordenService: OrdenService;
  let mockOrdenRepo: Partial<OrdenRepository>;
  let mockEquipoRepo: Partial<EquipoRepository>;
  let mockUsuarioRepo: Partial<UsuarioRepository>;

  beforeEach(() => {
    mockOrdenRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      getNextOrderNumber: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    mockEquipoRepo = {
      findById: vi.fn(),
    };
    mockUsuarioRepo = {
      findById: vi.fn(),
    };

    ordenService = new OrdenService(
      mockOrdenRepo as OrdenRepository,
      mockEquipoRepo as EquipoRepository,
      mockUsuarioRepo as UsuarioRepository
    );
  });

  it("debe autogenerar el número de orden correlativo y crear la orden", async () => {
    (mockEquipoRepo.findById as any).mockResolvedValue({
      id: "eq-100",
      marca: "HP",
      isActive: true,
    });

    (mockOrdenRepo.getNextOrderNumber as any).mockResolvedValue("OT-2026-0005");

    (mockOrdenRepo.create as any).mockResolvedValue({
      id: "ord-1",
      numeroOrden: "OT-2026-0005",
      equipoId: "eq-100",
      estado: "PENDIENTE",
      problemaReportado: "No da imagen",
    });

    const result = await ordenService.createOrden({
      equipoId: "eq-100",
      problemaReportado: "No da imagen",
    });

    expect(mockOrdenRepo.getNextOrderNumber).toHaveBeenCalled();
    expect(result.numeroOrden).toBe("OT-2026-0005");
  });

  it("debe rechazar la creación de una orden si el equipo no está activo", async () => {
    (mockEquipoRepo.findById as any).mockResolvedValue({
      id: "eq-100",
      isActive: false, // Inactivo
    });

    await expect(
      ordenService.createOrden({
        equipoId: "eq-100",
        problemaReportado: "No enciende",
      })
    ).rejects.toThrow("El equipo seleccionado no existe o se encuentra inactivo");
  });

  it("debe registrar automáticamente la fecha de egreso cuando el estado pasa a ENTREGADO", async () => {
    (mockOrdenRepo.findById as any).mockResolvedValue({
      id: "ord-1",
      estado: "LISTO_ENTREGA",
      isActive: true,
    });

    (mockOrdenRepo.update as any).mockImplementation((_id: string, data: any) => Promise.resolve(data));

    const result = await ordenService.updateOrden("ord-1", {
      estado: "ENTREGADO",
    });

    expect(result.fechaEgreso).toBeInstanceOf(Date);
  });

  it("debe limpiar la fecha de egreso si una orden entregada se reabre a EN_REPARACION", async () => {
    (mockOrdenRepo.findById as any).mockResolvedValue({
      id: "ord-1",
      estado: "ENTREGADO",
      isActive: true,
    });

    (mockOrdenRepo.update as any).mockImplementation((_id: string, data: any) => Promise.resolve(data));

    const result = await ordenService.updateOrden("ord-1", {
      estado: "EN_REPARACION",
    });

    expect(result.fechaEgreso).toBeNull();
  });
});
