"use client";

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  User,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  Eye,
  X,
  Loader2,
  DollarSign,
  Calendar,
  Wrench,
} from "lucide-react";

interface ClienteBrief {
  id: string;
  nombre: string;
  dniCuit: string;
  telefono: string;
}

interface EquipoBrief {
  id: string;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string | null;
  accesorios: string | null;
  cliente: ClienteBrief;
}

interface TecnicoBrief {
  id: string;
  nombre: string;
  email: string;
}

interface OrdenServicio {
  id: string;
  numeroOrden: string;
  equipoId: string;
  tecnicoAsignadoId: string | null;
  problemaReportado: string;
  diagnostico: string | null;
  estado: "PENDIENTE" | "EN_DIAGNOSTICO" | "EN_REPARACION" | "LISTO_ENTREGA" | "ENTREGADO" | "CANCELADO";
  costoEstimado: number | null;
  costoFinal: number | null;
  fechaIngreso: string;
  fechaEgreso: string | null;
  isActive: boolean;
  createdAt: string;
  equipo: EquipoBrief;
  tecnicoAsignado: TecnicoBrief | null;
}

interface OrdenesViewProps {
  initialOrdenes: OrdenServicio[];
  equipos: EquipoBrief[];
  tecnicos: TecnicoBrief[];
}

const ESTADOS = [
  { value: "TODAS", label: "Todas las Órdenes" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "EN_DIAGNOSTICO", label: "En Diagnóstico" },
  { value: "EN_REPARACION", label: "En Reparación" },
  { value: "LISTO_ENTREGA", label: "Listas para Entrega" },
  { value: "ENTREGADO", label: "Entregadas" },
  { value: "CANCELADO", label: "Canceladas" },
];

const estadoBadgeClass: Record<string, string> = {
  PENDIENTE: "bg-amber-950/70 text-amber-300 border-amber-800",
  EN_DIAGNOSTICO: "bg-blue-950/70 text-blue-300 border-blue-800",
  EN_REPARACION: "bg-purple-950/70 text-purple-300 border-purple-800",
  LISTO_ENTREGA: "bg-emerald-950/70 text-emerald-300 border-emerald-800",
  ENTREGADO: "bg-slate-800 text-slate-300 border-slate-700",
  CANCELADO: "bg-red-950/70 text-red-300 border-red-800",
};

export default function OrdenesView({ initialOrdenes, equipos, tecnicos }: OrdenesViewProps) {
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>(initialOrdenes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("TODAS");

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeOrden, setActiveOrden] = useState<OrdenServicio | null>(null);

  // Form states
  const [createData, setCreateData] = useState({
    equipoId: equipos[0]?.id || "",
    tecnicoAsignadoId: "",
    problemaReportado: "",
    costoEstimado: "",
  });

  const [updateData, setUpdateData] = useState({
    estado: "PENDIENTE",
    tecnicoAsignadoId: "",
    diagnostico: "",
    costoEstimado: "",
    costoFinal: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredOrdenes = ordenes.filter((ord) => {
    const matchesEstado = selectedEstado === "TODAS" || ord.estado === selectedEstado;
    const matchesSearch =
      ord.numeroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.problemaReportado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.equipo.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEstado && matchesSearch;
  });

  const openCreateModal = () => {
    setCreateData({
      equipoId: equipos[0]?.id || "",
      tecnicoAsignadoId: "",
      problemaReportado: "",
      costoEstimado: "",
    });
    setIsCreateModalOpen(true);
  };

  const openUpdateModal = (ord: OrdenServicio) => {
    setActiveOrden(ord);
    setUpdateData({
      estado: ord.estado,
      tecnicoAsignadoId: ord.tecnicoAsignadoId || "",
      diagnostico: ord.diagnostico || "",
      costoEstimado: ord.costoEstimado ? String(ord.costoEstimado) : "",
      costoFinal: ord.costoFinal ? String(ord.costoFinal) : "",
    });
    setIsUpdateModalOpen(true);
  };

  const openDetailModal = (ord: OrdenServicio) => {
    setActiveOrden(ord);
    setIsDetailModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.equipoId) return showToast("Seleccione un equipo", "error");
    if (!createData.problemaReportado.trim())
      return showToast("Describa el problema reportado", "error");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipoId: createData.equipoId,
          tecnicoAsignadoId: createData.tecnicoAsignadoId || null,
          problemaReportado: createData.problemaReportado,
          costoEstimado: createData.costoEstimado ? Number(createData.costoEstimado) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al crear orden");
      }

      setOrdenes((prev) => [data.data, ...prev]);
      showToast(`Orden ${data.data.numeroOrden} creada exitosamente`, "success");
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrden) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ordenes/${activeOrden.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: updateData.estado,
          tecnicoAsignadoId: updateData.tecnicoAsignadoId || null,
          diagnostico: updateData.diagnostico || null,
          costoEstimado: updateData.costoEstimado ? Number(updateData.costoEstimado) : null,
          costoFinal: updateData.costoFinal ? Number(updateData.costoFinal) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al actualizar orden");
      }

      setOrdenes((prev) => prev.map((ord) => (ord.id === activeOrden.id ? data.data : ord)));
      showToast(`Orden ${activeOrden.numeroOrden} actualizada`, "success");
      setIsUpdateModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeOrden) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ordenes/${activeOrden.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al dar de baja orden");
      }

      setOrdenes((prev) => prev.filter((ord) => ord.id !== activeOrden.id));
      showToast(`Orden ${activeOrden.numeroOrden} dada de baja (baja lógica)`, "success");
      setIsDeleteModalOpen(false);
      setActiveOrden(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl text-sm font-medium animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-600/50 text-emerald-200"
              : "bg-red-950/90 border-red-600/50 text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-cyan-400" />
            <span>Órdenes de Servicio Técnico</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control integral del ciclo de trabajo, diagnóstico, técnicos asignados y presupuestos
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={equipos.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-sm font-medium text-white shadow-lg shadow-cyan-600/30 transition-all self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Trabajo</span>
        </button>
      </div>

      {equipos.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Para emitir una orden, primero debe existir al menos un equipo registrado.</span>
        </div>
      )}

      {/* Tabs de Filtro de Estados */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {ESTADOS.map((st) => (
          <button
            key={st.value}
            onClick={() => setSelectedEstado(st.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedEstado === st.value
                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por N° Orden, cliente, dispositivo o falla..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        <div className="text-xs font-medium text-slate-400 self-end sm:self-auto">
          Mostrando <span className="text-cyan-400 font-bold">{filteredOrdenes.length}</span> órdenes activas
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">N° Orden</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Dispositivo</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Técnico</th>
                <th className="px-5 py-3.5">Presupuesto</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrdenes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <ClipboardList className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-base font-medium text-slate-400">No se encontraron órdenes</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm ? "Pruebe con otros filtros" : "Comience registrando una orden"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrdenes.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-cyan-400">
                      {ord.numeroOrden}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{ord.equipo.cliente.nombre}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Tel: {ord.equipo.cliente.telefono}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200">
                        {ord.equipo.marca} {ord.equipo.modelo}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                        Falla: {ord.problemaReportado}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          estadoBadgeClass[ord.estado] || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ord.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {ord.tecnicoAsignado ? (
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{ord.tecnicoAsignado.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono">
                      {ord.costoFinal !== null ? (
                        <span className="text-emerald-400 font-bold">
                          ${ord.costoFinal.toLocaleString("es-AR")}
                        </span>
                      ) : ord.costoEstimado !== null ? (
                        <span className="text-slate-400">
                          Est: ${ord.costoEstimado.toLocaleString("es-AR")}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Pendiente</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openDetailModal(ord)}
                          title="Ver Comprobante / Detalle"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-800/60 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openUpdateModal(ord)}
                          title="Actualizar Estado / Diagnóstico"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-950/40 border border-transparent hover:border-purple-800/60 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveOrden(ord);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Dar de baja orden (Baja Lógica)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Orden */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-cyan-400" />
                <span>Emitir Orden de Servicio</span>
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Dispositivo / Equipo *
                </label>
                <select
                  value={createData.equipoId}
                  onChange={(e) => setCreateData({ ...createData, equipoId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  {equipos.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.tipo} {eq.marca} {eq.modelo} — Propietario: {eq.cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Técnico Asignado (Opcional)
                </label>
                <select
                  value={createData.tecnicoAsignadoId}
                  onChange={(e) =>
                    setCreateData({ ...createData, tecnicoAsignadoId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Sin asignar (Ingreso a taller)</option>
                  {tecnicos.map((tec) => (
                    <option key={tec.id} value={tec.id}>
                      {tec.nombre} ({tec.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Falla / Problema Reportado por el Cliente *
                </label>
                <textarea
                  rows={3}
                  required
                  value={createData.problemaReportado}
                  onChange={(e) =>
                    setCreateData({ ...createData, problemaReportado: e.target.value })
                  }
                  placeholder="ej: El equipo no da video. Se apaga a los 10 minutos de uso continuo."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Costo Estimado Inicial (Opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createData.costoEstimado}
                    onChange={(e) =>
                      setCreateData({ ...createData, costoEstimado: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-medium text-white shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Emitiendo...</span>
                    </>
                  ) : (
                    <span>Generar Orden</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Actualizar Estado / Diagnóstico */}
      {isUpdateModalOpen && activeOrden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-400" />
                  <span>Actualizar Orden {activeOrden.numeroOrden}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeOrden.equipo.marca} {activeOrden.equipo.modelo} — {activeOrden.equipo.cliente.nombre}
                </p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Estado del Servicio *
                </label>
                <select
                  value={updateData.estado}
                  onChange={(e) => setUpdateData({ ...updateData, estado: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-semibold"
                >
                  {ESTADOS.filter((e) => e.value !== "TODAS").map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Técnico Responsable
                </label>
                <select
                  value={updateData.tecnicoAsignadoId}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, tecnicoAsignadoId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Sin asignar</option>
                  {tecnicos.map((tec) => (
                    <option key={tec.id} value={tec.id}>
                      {tec.nombre} ({tec.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Diagnóstico Técnico y Reparación Realizada
                </label>
                <textarea
                  rows={3}
                  value={updateData.diagnostico}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, diagnostico: e.target.value })
                  }
                  placeholder="Detalle la falla detectada, componentes reemplazados o pruebas realizadas..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Costo Estimado ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={updateData.costoEstimado}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, costoEstimado: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Costo Final Cobrado ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={updateData.costoFinal}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, costoFinal: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Actualizar Orden</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Comprobante / Detalle */}
      {isDetailModalOpen && activeOrden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            {/* Header Comprobante */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                  Comprobante de Servicio
                </span>
                <h2 className="text-2xl font-bold font-mono text-white mt-0.5">
                  {activeOrden.numeroOrden}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
                      estadoBadgeClass[activeOrden.estado] || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Estado: {activeOrden.estado.replace("_", " ")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Cliente y Equipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-sm">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Datos del Cliente</span>
                </div>
                <p className="font-semibold text-white">{activeOrden.equipo.cliente.nombre}</p>
                <p className="text-xs text-slate-400 font-mono">
                  DNI: {activeOrden.equipo.cliente.dniCuit}
                </p>
                <p className="text-xs text-slate-400">Tel: {activeOrden.equipo.cliente.telefono}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Equipo en Servicio</span>
                </div>
                <p className="font-semibold text-white">
                  {activeOrden.equipo.tipo} {activeOrden.equipo.marca} {activeOrden.equipo.modelo}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Serie: {activeOrden.equipo.numeroSerie || "N/A"}
                </p>
                <p className="text-xs text-slate-400">
                  Accesorios: {activeOrden.equipo.accesorios || "Ninguno"}
                </p>
              </div>
            </div>

            {/* Diagnóstico y Falla */}
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Problema Reportado
                </span>
                <p className="text-slate-200">{activeOrden.problemaReportado}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Diagnóstico Técnico Realizado
                </span>
                <p className="text-slate-200">
                  {activeOrden.diagnostico || (
                    <span className="text-slate-500 italic">Aún no registrado por el técnico.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Footer con Fechas y Costos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Fecha Ingreso</span>
                <span className="font-mono text-slate-300">
                  {new Date(activeOrden.fechaIngreso).toLocaleDateString("es-AR")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Fecha Egreso</span>
                <span className="font-mono text-slate-300">
                  {activeOrden.fechaEgreso
                    ? new Date(activeOrden.fechaEgreso).toLocaleDateString("es-AR")
                    : "En taller"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Costo Estimado</span>
                <span className="font-mono text-slate-300">
                  {activeOrden.costoEstimado
                    ? `$${activeOrden.costoEstimado.toLocaleString("es-AR")}`
                    : "S/D"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Costo Final</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {activeOrden.costoFinal
                    ? `$${activeOrden.costoFinal.toLocaleString("es-AR")}`
                    : "Pendiente"}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación Baja Lógica */}
      {isDeleteModalOpen && activeOrden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-900/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/50">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirmar Baja Lógica de Orden</h3>
            </div>

            <p className="text-sm text-slate-300">
              ¿Está seguro de que desea anular/dar de baja la orden{" "}
              <strong className="text-white font-mono">{activeOrden.numeroOrden}</strong>?
            </p>

            <p className="text-xs text-slate-400 mt-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              ℹ️ Se aplicará <strong>baja lógica</strong> (<code className="text-cyan-400">isActive = false</code>) preservando la trazabilidad de la orden en la base de datos para auditorías.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setActiveOrden(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Inactivando...</span>
                  </>
                ) : (
                  <span>Confirmar Baja</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
