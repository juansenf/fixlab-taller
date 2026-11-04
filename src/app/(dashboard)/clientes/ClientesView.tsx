"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

interface Cliente {
  id: string;
  dniCuit: string;
  nombre: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  isActive: boolean;
  createdAt: string;
}

interface ClientesViewProps {
  initialClientes: Cliente[];
}

export default function ClientesView({ initialClientes }: ClientesViewProps) {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    dniCuit: "",
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtrado local reactivo
  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dniCuit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({ dniCuit: "", nombre: "", telefono: "", email: "", direccion: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      dniCuit: cliente.dniCuit,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email || "",
      direccion: cliente.direccion || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validación de frontend (Primera capa de validación)
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.dniCuit.trim()) errors.dniCuit = "El DNI o CUIT es obligatorio";
    else if (formData.dniCuit.trim().length < 7) errors.dniCuit = "Debe tener al menos 7 dígitos";

    if (!formData.nombre.trim()) errors.nombre = "El nombre o razón social es obligatorio";
    else if (formData.nombre.trim().length < 2) errors.nombre = "Debe tener al menos 2 caracteres";

    if (!formData.telefono.trim()) errors.telefono = "El teléfono de contacto es obligatorio";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El correo electrónico no tiene un formato válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingCliente ? `/api/clientes/${editingCliente.id}` : "/api/clientes";
      const method = editingCliente ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al procesar la solicitud");
      }

      if (editingCliente) {
        setClientes((prev) => prev.map((c) => (c.id === editingCliente.id ? data.data : c)));
        showToast("Cliente actualizado correctamente", "success");
      } else {
        setClientes((prev) => [data.data, ...prev]);
        showToast("Cliente registrado exitosamente", "success");
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar y ejecutar Baja Lógica
  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/clientes/${clienteToDelete.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al dar de baja el cliente");
      }

      setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      showToast(`Cliente ${clienteToDelete.nombre} dado de baja (baja lógica)`, "success");
      setIsDeleteModalOpen(false);
      setClienteToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl text-sm font-medium transition-all animate-in slide-in-from-bottom-5 ${
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

      {/* Encabezado y Barra de Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Gestión de Clientes</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Listado maestro de clientes registrados con operaciones de alta, edición y baja lógica
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-sm font-medium text-white shadow-lg shadow-cyan-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Estadísticas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI o teléfono..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="text-xs font-medium text-slate-400 self-end sm:self-auto">
          Mostrando <span className="text-cyan-400 font-bold">{filteredClientes.length}</span> clientes activos
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">DNI / CUIT</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5">Dirección</th>
                <th className="px-5 py-3.5">Fecha Alta</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-base font-medium text-slate-400">No se encontraron clientes</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm ? "Pruebe con otro término de búsqueda" : "Comience registrando un nuevo cliente"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-medium text-white">{cliente.nombre}</td>
                    <td className="px-5 py-4 font-mono text-cyan-400 text-xs">{cliente.dniCuit}</td>
                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{cliente.telefono}</span>
                      </div>
                      {cliente.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cliente.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {cliente.direccion ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{cliente.direccion}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">No especificada</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {new Date(cliente.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(cliente)}
                          title="Editar cliente"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-800/60 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setClienteToDelete(cliente);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Dar de baja (Baja Lógica)"
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

      {/* Modal de Crear / Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{editingCliente ? "Editar Cliente" : "Registrar Nuevo Cliente"}</span>
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
                  DNI o CUIT *
                </label>
                <input
                  type="text"
                  value={formData.dniCuit}
                  onChange={(e) => setFormData({ ...formData, dniCuit: e.target.value })}
                  placeholder="ej: 30123456"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.dniCuit
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-cyan-500"
                  }`}
                />
                {formErrors.dniCuit && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.dniCuit}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej: Juan Pérez"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.nombre
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-cyan-500"
                  }`}
                />
                {formErrors.nombre && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.nombre}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="ej: +54 9 11 2345-6789"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.telefono
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-cyan-500"
                    }`}
                  />
                  {formErrors.telefono && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.telefono}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-cyan-500"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="ej: Av. San Martín 450"
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
                    <span>{editingCliente ? "Guardar Cambios" : "Crear Cliente"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Baja Lógica */}
      {isDeleteModalOpen && clienteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-900/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/50">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirmar Baja Lógica</h3>
            </div>

            <p className="text-sm text-slate-300">
              ¿Está seguro de que desea dar de baja al cliente{" "}
              <strong className="text-white">{clienteToDelete.nombre}</strong> (DNI:{" "}
              {clienteToDelete.dniCuit})?
            </p>

            <p className="text-xs text-slate-400 mt-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              ℹ️ Se aplicará <strong>baja lógica</strong>: el registro se inactivará (
              <code className="text-cyan-400">isActive = false</code>) preservando el historial de órdenes y la integridad referencial.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setClienteToDelete(null);
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
