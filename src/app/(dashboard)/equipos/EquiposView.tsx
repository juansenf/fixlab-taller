"use client";

import { useState } from "react";
import {
  Laptop,
  Plus,
  Search,
  User,
  Barcode,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  PackagePlus,
} from "lucide-react";

interface ClienteSimple {
  id: string;
  nombre: string;
  dniCuit: string;
}

interface Equipo {
  id: string;
  clienteId: string;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string | null;
  accesorios: string | null;
  isActive: boolean;
  createdAt: string;
  cliente: ClienteSimple;
}

interface EquiposViewProps {
  initialEquipos: Equipo[];
  clientes: ClienteSimple[];
}

const TIPOS_EQUIPO = [
  "Notebook",
  "Celular / Smartphone",
  "PC de Escritorio",
  "Tablet",
  "Consola de Videojuegos",
  "Impresora",
  "Monitor / Pantalla",
  "Otro Dispositivo",
];

export default function EquiposView({ initialEquipos, clientes }: EquiposViewProps) {
  const [equipos, setEquipos] = useState<Equipo[]>(initialEquipos);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    clienteId: clientes[0]?.id || "",
    tipo: TIPOS_EQUIPO[0],
    marca: "",
    modelo: "",
    numeroSerie: "",
    accesorios: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredEquipos = equipos.filter(
    (eq) =>
      eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.numeroSerie && eq.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase())) ||
      eq.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.cliente.dniCuit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingEquipo(null);
    setFormData({
      clienteId: clientes[0]?.id || "",
      tipo: TIPOS_EQUIPO[0],
      marca: "",
      modelo: "",
      numeroSerie: "",
      accesorios: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (eq: Equipo) => {
    setEditingEquipo(eq);
    setFormData({
      clienteId: eq.clienteId,
      tipo: eq.tipo,
      marca: eq.marca,
      modelo: eq.modelo,
      numeroSerie: eq.numeroSerie || "",
      accesorios: eq.accesorios || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.clienteId) errors.clienteId = "Debe asociar el equipo a un cliente";
    if (!formData.tipo.trim()) errors.tipo = "El tipo de equipo es obligatorio";
    if (!formData.marca.trim()) errors.marca = "La marca es obligatoria";
    if (!formData.modelo.trim()) errors.modelo = "El modelo es obligatorio";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingEquipo ? `/api/equipos/${editingEquipo.id}` : "/api/equipos";
      const method = editingEquipo ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al guardar el equipo");
      }

      // Re-asociar los datos del cliente para la vista
      const selectedCliente = clientes.find((c) => c.id === formData.clienteId);
      const equipoUpdated: Equipo = {
        ...data.data,
        cliente: selectedCliente || {
          id: formData.clienteId,
          nombre: "Cliente asignado",
          dniCuit: "",
        },
      };

      if (editingEquipo) {
        setEquipos((prev) => prev.map((eq) => (eq.id === editingEquipo.id ? equipoUpdated : eq)));
        showToast("Equipo actualizado correctamente", "success");
      } else {
        setEquipos((prev) => [equipoUpdated, ...prev]);
        showToast("Equipo registrado exitosamente", "success");
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!equipoToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/equipos/${equipoToDelete.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al dar de baja el equipo");
      }

      setEquipos((prev) => prev.filter((eq) => eq.id !== equipoToDelete.id));
      showToast(`Equipo ${equipoToDelete.marca} dado de baja (baja lógica)`, "success");
      setIsDeleteModalOpen(false);
      setEquipoToDelete(null);
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
            <Laptop className="w-6 h-6 text-cyan-400" />
            <span>Gestión de Equipos</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro de dispositivos, especificaciones técnicas y asociación con clientes
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={clientes.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-sm font-medium text-white shadow-lg shadow-cyan-600/30 transition-all self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PackagePlus className="w-4 h-4" />
          <span>Registrar Equipo</span>
        </button>
      </div>

      {clientes.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Para registrar un equipo, primero debe existir al menos un cliente en el sistema.
          </span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tipo, marca, modelo, serie o cliente..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="text-xs font-medium text-slate-400 self-end sm:self-auto">
          Mostrando <span className="text-cyan-400 font-bold">{filteredEquipos.length}</span> equipos
        </div>
      </div>

      {/* Tabla de Equipos */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Dispositivo</th>
                <th className="px-5 py-3.5">Cliente (Propietario)</th>
                <th className="px-5 py-3.5">N° Serie</th>
                <th className="px-5 py-3.5">Accesorios Ingresados</th>
                <th className="px-5 py-3.5">Fecha Registro</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEquipos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Laptop className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-base font-medium text-slate-400">No hay equipos encontrados</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? "Intente con otros términos de búsqueda"
                        : "Comience registrando el primer equipo"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEquipos.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">
                        {eq.marca} {eq.modelo}
                      </div>
                      <span className="inline-block text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 mt-1">
                        {eq.tipo}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{eq.cliente.nombre}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        DNI: {eq.cliente.dniCuit}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">
                      {eq.numeroSerie ? (
                        <div className="flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-slate-500" />
                          <span>{eq.numeroSerie}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">S/N</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 max-w-[200px] truncate">
                      {eq.accesorios || <span className="text-slate-600 italic">Ninguno</span>}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {new Date(eq.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(eq)}
                          title="Editar equipo"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-800/60 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEquipoToDelete(eq);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Dar de baja equipo (Baja Lógica)"
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

      {/* Modal Alta / Edición de Equipo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <span>{editingEquipo ? "Editar Equipo" : "Registrar Nuevo Dispositivo"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Cliente Propietario *
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (DNI: {c.dniCuit})
                    </option>
                  ))}
                </select>
                {formErrors.clienteId && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.clienteId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Tipo de Dispositivo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  {TIPOS_EQUIPO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="ej: Lenovo, Samsung, HP"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.marca
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-cyan-500"
                    }`}
                  />
                  {formErrors.marca && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.marca}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="ej: ThinkPad T14, Galaxy A54"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.modelo
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-cyan-500"
                    }`}
                  />
                  {formErrors.modelo && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.modelo}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Número de Serie (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                  placeholder="ej: S/N: PF-4A8890"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Accesorios Recibidos (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.accesorios}
                  onChange={(e) => setFormData({ ...formData, accesorios: e.target.value })}
                  placeholder="ej: Con cargador, funda protectora, cable HDMI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-all"
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
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingEquipo ? "Guardar Cambios" : "Registrar Equipo"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Baja Lógica */}
      {isDeleteModalOpen && equipoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-900/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/50">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirmar Baja Lógica de Equipo</h3>
            </div>

            <p className="text-sm text-slate-300">
              ¿Está seguro de que desea dar de baja el equipo{" "}
              <strong className="text-white">
                {equipoToDelete.tipo} {equipoToDelete.marca} {equipoToDelete.modelo}
              </strong>{" "}
              perteneciente a{" "}
              <strong className="text-white">{equipoToDelete.cliente.nombre}</strong>?
            </p>

            <p className="text-xs text-slate-400 mt-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              ℹ️ Se aplicará <strong>baja lógica</strong> (<code className="text-cyan-400">isActive = false</code>) para preservar las órdenes asociadas y el historial técnico.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEquipoToDelete(null);
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
