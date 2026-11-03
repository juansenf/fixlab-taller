import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Laptop,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";


export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Consultas optimizadas en paralelo
  const [
    totalClientes,
    totalEquipos,
    ordenesActivas,
    ordenesListas,
    ultimasOrdenes,
  ] = await Promise.all([
    prisma.cliente.count({ where: { isActive: true } }),
    prisma.equipo.count({ where: { isActive: true } }),
    prisma.ordenServicio.count({
      where: {
        isActive: true,
        estado: { in: ["PENDIENTE", "EN_DIAGNOSTICO", "EN_REPARACION"] },
      },
    }),
    prisma.ordenServicio.count({
      where: { isActive: true, estado: "LISTO_ENTREGA" },
    }),
    prisma.ordenServicio.findMany({
      where: { isActive: true },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        equipo: {
          include: {
            cliente: true,
          },
        },
        tecnicoAsignado: {
          select: { nombre: true },
        },
      },
    }),
  ]);

  const estadoBadgeClass: Record<string, string> = {
    PENDIENTE: "bg-amber-950/70 text-amber-300 border-amber-800",
    EN_DIAGNOSTICO: "bg-blue-950/70 text-blue-300 border-blue-800",
    EN_REPARACION: "bg-purple-950/70 text-purple-300 border-purple-800",
    LISTO_ENTREGA: "bg-emerald-950/70 text-emerald-300 border-emerald-800",
    ENTREGADO: "bg-slate-800 text-slate-300 border-slate-700",
    CANCELADO: "bg-red-950/70 text-red-300 border-red-800",
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Panel de Control</h1>
          <p className="text-sm text-slate-400 mt-1">
            Resumen operativo y estado actual del taller
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/clientes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Gestionar Clientes</span>
          </Link>
          <Link
            href="/ordenes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-medium text-white shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ver Órdenes</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              En Reparación / Curso
            </p>
            <p className="text-3xl font-bold text-white mt-2">{ordenesActivas}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Listas para Entrega
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{ordenesListas}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Equipos Registrados
            </p>
            <p className="text-3xl font-bold text-white mt-2">{totalEquipos}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400">
            <Laptop className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Clientes Activos
            </p>
            <p className="text-3xl font-bold text-white mt-2">{totalClientes}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes Recientes */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Últimas Órdenes Registradas</h2>
          </div>
          <Link
            href="/ordenes"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">N° Orden</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Dispositivo</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Técnico</th>
                <th className="px-5 py-3.5 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ultimasOrdenes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No hay órdenes de servicio registradas aún.
                  </td>
                </tr>
              ) : (
                ultimasOrdenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">
                      {orden.numeroOrden}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      {orden.equipo.cliente.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {orden.equipo.tipo} {orden.equipo.marca} {orden.equipo.modelo}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          estadoBadgeClass[orden.estado] || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {orden.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {orden.tecnicoAsignado?.nombre || "Sin asignar"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-slate-400 font-mono">
                      {new Date(orden.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
