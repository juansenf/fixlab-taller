import { clienteService } from "@/core/services/cliente.service";
import ClientesView from "./ClientesView";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const initialClientes = await clienteService.listClientes();

  // Serializar fechas para el cliente
  const serializedClientes = initialClientes.map((c) => ({
    id: c.id,
    dniCuit: c.dniCuit,
    nombre: c.nombre,
    telefono: c.telefono,
    email: c.email,
    direccion: c.direccion,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  }));

  return <ClientesView initialClientes={serializedClientes} />;
}
