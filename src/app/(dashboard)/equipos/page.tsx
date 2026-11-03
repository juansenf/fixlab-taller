import { equipoService } from "@/core/services/equipo.service";
import { clienteService } from "@/core/services/cliente.service";
import EquiposView from "./EquiposView";

export const dynamic = "force-dynamic";

export default async function EquiposPage() {
  const [equipos, clientes] = await Promise.all([
    equipoService.listEquipos(),
    clienteService.listClientes(),
  ]);

  const serializedEquipos = equipos.map((eq) => ({
    id: eq.id,
    clienteId: eq.clienteId,
    tipo: eq.tipo,
    marca: eq.marca,
    modelo: eq.modelo,
    numeroSerie: eq.numeroSerie,
    accesorios: eq.accesorios,
    isActive: eq.isActive,
    createdAt: eq.createdAt.toISOString(),
    cliente: {
      id: eq.cliente.id,
      nombre: eq.cliente.nombre,
      dniCuit: eq.cliente.dniCuit,
    },
  }));

  const simpleClientes = clientes.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    dniCuit: c.dniCuit,
  }));

  return <EquiposView initialEquipos={serializedEquipos} clientes={simpleClientes} />;
}
