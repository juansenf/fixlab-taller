import { clienteRepository, ClienteRepository } from "../repositories/cliente.repository";
import { ClienteInput } from "../validations/cliente.schema";
import { Cliente } from "@prisma/client";

export class ClienteService {
  constructor(private clientRepo: ClienteRepository = clienteRepository) {}

  async listClientes(search?: string): Promise<Cliente[]> {
    return await this.clientRepo.findAll(search);
  }

  async getClienteById(id: string) {
    const cliente = await this.clientRepo.findById(id);
    if (!cliente || !cliente.isActive) {
      throw new Error("El cliente solicitado no existe o fue dado de baja");
    }
    return cliente;
  }

  async createCliente(data: ClienteInput): Promise<Cliente> {
    const existing = await this.clientRepo.findByDni(data.dniCuit);
    if (existing) {
      if (existing.isActive) {
        throw new Error(`Ya existe un cliente registrado con el DNI/CUIT: ${data.dniCuit}`);
      } else {
        // Reactivar cliente si estaba dado de baja lógica
        return await this.clientRepo.update(existing.id, {
          ...data,
        });
      }
    }

    return await this.clientRepo.create(data);
  }

  async updateCliente(id: string, data: Partial<ClienteInput>): Promise<Cliente> {
    const cliente = await this.clientRepo.findById(id);
    if (!cliente || !cliente.isActive) {
      throw new Error("El cliente a modificar no existe o se encuentra inactivo");
    }

    if (data.dniCuit && data.dniCuit !== cliente.dniCuit) {
      const existingWithSameDni = await this.clientRepo.findByDni(data.dniCuit);
      if (existingWithSameDni && existingWithSameDni.id !== id) {
        throw new Error(`El DNI/CUIT ${data.dniCuit} ya pertenece a otro cliente registrado`);
      }
    }

    return await this.clientRepo.update(id, data);
  }

  async deleteCliente(id: string): Promise<Cliente> {
    const cliente = await this.clientRepo.findById(id);
    if (!cliente || !cliente.isActive) {
      throw new Error("El cliente no existe o ya ha sido dado de baja");
    }

    // Baja Lógica (Soft Delete)
    return await this.clientRepo.softDelete(id);
  }
}

export const clienteService = new ClienteService();
