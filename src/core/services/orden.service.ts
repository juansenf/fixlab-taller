import { ordenRepository, OrdenRepository } from "../repositories/orden.repository";
import { equipoRepository, EquipoRepository } from "../repositories/equipo.repository";
import { usuarioRepository, UsuarioRepository } from "../repositories/usuario.repository";
import { CreateOrdenInput, UpdateOrdenInput } from "../validations/orden.schema";

export class OrdenService {
  constructor(
    private ordRepo: OrdenRepository = ordenRepository,
    private equipRepo: EquipoRepository = equipoRepository,
    private userRepo: UsuarioRepository = usuarioRepository
  ) {}

  async listOrdenes(filters?: { search?: string; estado?: string; tecnicoId?: string }) {
    return await this.ordRepo.findAll(filters);
  }

  async getOrdenById(id: string) {
    const orden = await this.ordRepo.findById(id);
    if (!orden || !orden.isActive) {
      throw new Error("La orden de servicio solicitada no existe o fue dada de baja");
    }
    return orden;
  }

  async createOrden(data: CreateOrdenInput) {
    // 1. Validar que el equipo exista y esté activo
    const equipo = await this.equipRepo.findById(data.equipoId);
    if (!equipo || !equipo.isActive) {
      throw new Error("El equipo seleccionado no existe o se encuentra inactivo");
    }

    // 2. Validar técnico si fue asignado
    if (data.tecnicoAsignadoId) {
      const tecnico = await this.userRepo.findById(data.tecnicoAsignadoId);
      if (!tecnico || !tecnico.isActive) {
        throw new Error("El técnico asignado no existe o se encuentra inactivo");
      }
    }

    // 3. Generar número de orden correlativo
    const numeroOrden = await this.ordRepo.getNextOrderNumber();

    return await this.ordRepo.create({
      ...data,
      numeroOrden,
    });
  }

  async updateOrden(id: string, data: UpdateOrdenInput) {
    const orden = await this.ordRepo.findById(id);
    if (!orden || !orden.isActive) {
      throw new Error("La orden a modificar no existe o está inactiva");
    }

    // Validar técnico si cambió
    if (data.tecnicoAsignadoId && data.tecnicoAsignadoId !== orden.tecnicoAsignadoId) {
      const tecnico = await this.userRepo.findById(data.tecnicoAsignadoId);
      if (!tecnico || !tecnico.isActive) {
        throw new Error("El nuevo técnico asignado no existe o está inactivo");
      }
    }

    // Regla de Negocio: Si el estado pasa a ENTREGADO, registrar fecha de egreso
    let fechaEgreso: Date | null | undefined = undefined;
    if (data.estado === "ENTREGADO") {
      fechaEgreso = new Date();
    } else if (data.estado && orden.estado === "ENTREGADO") {
      fechaEgreso = null; // Reabrir orden si se cambió el estado
    }

    return await this.ordRepo.update(id, {
      ...data,
      fechaEgreso,
    });
  }

  async deleteOrden(id: string) {
    const orden = await this.ordRepo.findById(id);
    if (!orden || !orden.isActive) {
      throw new Error("La orden de servicio no existe o ya ha sido dada de baja");
    }

    return await this.ordRepo.softDelete(id);
  }
}

export const ordenService = new OrdenService();
