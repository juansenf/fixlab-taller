"use client";

import { useState } from "react";
import {
  UserCog,
  UserPlus,
  Shield,
  Wrench,
  Mail,
  Calendar,
  ClipboardList,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import { AuthUser } from "@/lib/jwt";

interface UsuarioItem {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "TECNICO";
  isActive: boolean;
  createdAt: string;
  _count?: {
    ordenesAsignadas: number;
  };
}

interface UsuariosViewProps {
  initialUsuarios: UsuarioItem[];
  currentUser: AuthUser;
}

export default function UsuariosView({ initialUsuarios, currentUser }: UsuariosViewProps) {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(initialUsuarios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsuarioItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "TECNICO" as "ADMIN" | "TECNICO",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ nombre: "", email: "", password: "", rol: "TECNICO" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (u: UsuarioItem) => {
    setEditingUser(u);
    setFormData({ nombre: u.nombre, email: u.email, password: "", rol: u.rol });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Ingrese un correo electrónico válido";
    }
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    if (editingUser && formData.password && formData.password.length < 6) {
      errors.password = "Si desea cambiar la contraseña, debe tener al menos 6 caracteres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : "/api/usuarios";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al procesar usuario");
      }

      if (editingUser) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...data.data } : u))
        );
        showToast("Usuario actualizado correctamente", "success");
      } else {
        setUsuarios((prev) => [...prev, data.data]);
        showToast("Usuario registrado exitosamente", "success");
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
    if (!userToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/usuarios/${userToDelete.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al dar de baja usuario");
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showToast(`Usuario ${userToDelete.nombre} dado de baja (baja lógica)`, "success");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
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
            <UserCog className="w-6 h-6 text-cyan-400" />
            <span>Gestión de Usuarios y Roles (RBAC)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Administración de cuentas con control de acceso por perfiles (Administrador y Técnico)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-sm font-medium text-white shadow-lg shadow-cyan-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {usuarios.map((u) => {
          const isMe = u.id === currentUser.id;

          return (
            <div
              key={u.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center border ${
                        u.rol === "ADMIN"
                          ? "bg-cyan-600/10 border-cyan-500/20 text-cyan-400"
                          : "bg-emerald-600/10 border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {u.rol === "ADMIN" ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <Wrench className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <span>{u.nombre}</span>
                        {isMe && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            Tú
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[170px]">{u.email}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      u.rol === "ADMIN"
                        ? "bg-cyan-950 text-cyan-300 border-cyan-800"
                        : "bg-emerald-950 text-emerald-300 border-emerald-800"
                    }`}
                  >
                    {u.rol}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Órdenes asignadas:</span>
                  </div>
                  <span className="font-bold text-white">
                    {u._count?.ordenesAsignadas ?? 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(u)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Editar</span>
                </button>

                {!isMe && (
                  <button
                    onClick={() => {
                      setUserToDelete(u);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Inactivar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-cyan-400" />
                <span>{editingUser ? "Modificar Usuario" : "Crear Nueva Cuenta"}</span>
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
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej: Lucas Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
                {formErrors.nombre && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ej: tecnico2@fixlab.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Rol de Acceso (RBAC) *
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value as "ADMIN" | "TECNICO" })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-semibold"
                >
                  <option value="TECNICO">Técnico / Operador (Atención de órdenes)</option>
                  <option value="ADMIN">Administrador (Control total del sistema)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  {editingUser
                    ? "Nueva Contraseña (dejar en blanco para no modificar)"
                    : "Contraseña Inicial *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
                {formErrors.password && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingUser ? "Guardar Cambios" : "Crear Usuario"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baja Lógica */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-900/50 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/50">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Inactivar Usuario</h3>
            </div>

            <p className="text-sm text-slate-300">
              ¿Está seguro de que desea dar de baja al usuario{" "}
              <strong className="text-white">{userToDelete.nombre}</strong> ({userToDelete.email})?
            </p>

            <p className="text-xs text-slate-400 mt-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              ℹ️ Se aplicará <strong>baja lógica</strong> (<code className="text-cyan-400">isActive = false</code>) impidiendo su inicio de sesión pero conservando el historial de órdenes técnicas asociadas.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
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
                  <span>Confirmar Inactivación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
