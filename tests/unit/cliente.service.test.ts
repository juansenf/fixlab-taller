import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClienteService } from "@/core/services/cliente.service";
import { ClienteRepository } from "@/core/repositories/cliente.repository";

describe("ClienteService (Reglas de Negocio)", () => {
  let clienteService: ClienteService;
  let mockRepo: Partial<ClienteRepository>;

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByDni: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    clienteService = new ClienteService(mockRepo as ClienteRepository);
  });

  it("debe crear un cliente correctamente si el DNI no está registrado", async () => {
    const input = {
      dniCuit: "40123456",
      nombre: "Ana Martínez",
      telefono: "1155667788",
      email: "ana@email.com",
      direccion: "Calle Falsa 123",
    };

    (mockRepo.findByDni as any).mockResolvedValue(null);
    (mockRepo.create as any).mockResolvedValue({
      id: "cli-123",
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await clienteService.createCliente(input);

    expect(mockRepo.findByDni).toHaveBeenCalledWith("40123456");
    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result.id).toBe("cli-123");
    expect(result.nombre).toBe("Ana Martínez");
  });

  it("debe rechazar la creación si ya existe un cliente activo con el mismo DNI", async () => {
    const input = {
      dniCuit: "40123456",
      nombre: "Ana Martínez",
      telefono: "1155667788",
    };

    (mockRepo.findByDni as any).mockResolvedValue({
      id: "existing-id",
      dniCuit: "40123456",
      nombre: "Otro Cliente",
      isActive: true,
    });

    await expect(clienteService.createCliente(input)).rejects.toThrow(
      "Ya existe un cliente registrado con el DNI/CUIT: 40123456"
    );
  });

  it("debe reactivar el cliente si el DNI existía pero estaba en baja lógica (isActive: false)", async () => {
    const input = {
      dniCuit: "40123456",
      nombre: "Ana Martínez",
      telefono: "1155667788",
    };

    (mockRepo.findByDni as any).mockResolvedValue({
      id: "inactive-id",
      dniCuit: "40123456",
      isActive: false,
    });

    (mockRepo.update as any).mockResolvedValue({
      id: "inactive-id",
      ...input,
      isActive: true,
    });

    const result = await clienteService.createCliente(input);

    expect(mockRepo.update).toHaveBeenCalledWith("inactive-id", {
      ...input,
    });
    expect(result.id).toBe("inactive-id");
  });

  it("debe ejecutar la baja lógica (soft delete) correctamente", async () => {
    (mockRepo.findById as any).mockResolvedValue({
      id: "cli-1",
      nombre: "Cliente a eliminar",
      isActive: true,
    });

    (mockRepo.softDelete as any).mockResolvedValue({
      id: "cli-1",
      isActive: false,
    });

    const result = await clienteService.deleteCliente("cli-1");

    expect(mockRepo.softDelete).toHaveBeenCalledWith("cli-1");
    expect(result.isActive).toBe(false);
  });
});
