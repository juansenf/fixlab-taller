import { equipoRepository, EquipoRepository } from "../repositories/equipo.repository";
import { clienteRepository, ClienteRepository } from "../repositories/cliente.repository";
import { EquipoInput } from "../validations/equipo.schema";
import { Equipo } from "@prisma/client";

export class EquipoService {
  constructor(
    private equipRepo: EquipoRepository = equipoRepository,
    private clientRepo: ClienteRepository = clienteRepository
  ) {}

  async listEquipos(filters?: { search?: string; clienteId?: string }) {
    return await this.equipRepo.findAll(filters);
  }

  async getEquipoById(id: string) {
    const equipo = await this.equipRepo.findById(id);
    if (!equipo || !equipo.isActive) {
      throw new Error("El equipo solicitado no existe o se encuentra inactivo");
    }
    return equipo;
  }

  async createEquipo(data: EquipoInput): Promise<Equipo> {
    const cliente = await this.clientRepo.findById(data.clienteId);
    if (!cliente || !cliente.isActive) {
      throw new Error("El cliente seleccionado no existe o se encuentra dado de baja");
    }

    return await this.equipRepo.create(data);
  }

  async updateEquipo(id: string, data: Partial<EquipoInput>): Promise<Equipo> {
    const equipo = await this.equipRepo.findById(id);
    if (!equipo || !equipo.isActive) {
      throw new Error("El equipo a modificar no existe o se encuentra inactivo");
    }

    if (data.clienteId && data.clienteId !== equipo.clienteId) {
      const nuevoCliente = await this.clientRepo.findById(data.clienteId);
      if (!nuevoCliente || !nuevoCliente.isActive) {
        throw new Error("El nuevo cliente seleccionado no existe o está inactivo");
      }
    }

    return await this.equipRepo.update(id, data);
  }

  async deleteEquipo(id: string): Promise<Equipo> {
    const equipo = await this.equipRepo.findById(id);
    if (!equipo || !equipo.isActive) {
      throw new Error("El equipo no existe o ya ha sido dado de baja");
    }

    // Baja lógica (Soft Delete)
    return await this.equipRepo.softDelete(id);
  }
}

export const equipoService = new EquipoService();
