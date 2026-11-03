import { ordenService } from "@/core/services/orden.service";
import { equipoService } from "@/core/services/equipo.service";
import { usuarioRepository } from "@/core/repositories/usuario.repository";
import OrdenesView from "./OrdenesView";

export const dynamic = "force-dynamic";

export default async function OrdenesPage() {
  const [ordenes, equipos, usuarios] = await Promise.all([
    ordenService.listOrdenes(),
    equipoService.listEquipos(),
    usuarioRepository.findAllActive(),
  ]);

  const serializedOrdenes = ordenes.map((ord) => ({
    id: ord.id,
    numeroOrden: ord.numeroOrden,
    equipoId: ord.equipoId,
    tecnicoAsignadoId: ord.tecnicoAsignadoId,
    problemaReportado: ord.problemaReportado,
    diagnostico: ord.diagnostico,
    estado: ord.estado as
      | "PENDIENTE"
      | "EN_DIAGNOSTICO"
      | "EN_REPARACION"
      | "LISTO_ENTREGA"
      | "ENTREGADO"
      | "CANCELADO",
    costoEstimado: ord.costoEstimado ? Number(ord.costoEstimado) : null,
    costoFinal: ord.costoFinal ? Number(ord.costoFinal) : null,
    fechaIngreso: ord.fechaIngreso.toISOString(),
    fechaEgreso: ord.fechaEgreso ? ord.fechaEgreso.toISOString() : null,
    isActive: ord.isActive,
    createdAt: ord.createdAt.toISOString(),
    equipo: {
      id: ord.equipo.id,
      tipo: ord.equipo.tipo,
      marca: ord.equipo.marca,
      modelo: ord.equipo.modelo,
      numeroSerie: ord.equipo.numeroSerie,
      accesorios: ord.equipo.accesorios,
      cliente: {
        id: ord.equipo.cliente.id,
        nombre: ord.equipo.cliente.nombre,
        dniCuit: ord.equipo.cliente.dniCuit,
        telefono: ord.equipo.cliente.telefono,
      },
    },
    tecnicoAsignado: ord.tecnicoAsignado
      ? {
          id: ord.tecnicoAsignado.id,
          nombre: ord.tecnicoAsignado.nombre,
          email: ord.tecnicoAsignado.email,
        }
      : null,
  }));

  const simpleEquipos = equipos.map((eq) => ({
    id: eq.id,
    tipo: eq.tipo,
    marca: eq.marca,
    modelo: eq.modelo,
    numeroSerie: eq.numeroSerie,
    accesorios: eq.accesorios,
    cliente: {
      id: eq.cliente.id,
      nombre: eq.cliente.nombre,
      dniCuit: eq.cliente.dniCuit,
      telefono: eq.cliente.telefono,
    },
  }));

  const simpleTecnicos = usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
  }));

  return (
    <OrdenesView
      initialOrdenes={serializedOrdenes}
      equipos={simpleEquipos}
      tecnicos={simpleTecnicos}
    />
  );
}
