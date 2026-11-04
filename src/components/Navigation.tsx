"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  Users,
  Laptop,
  ClipboardList,
  UserCog,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { AuthUser } from "@/lib/jwt";

interface NavigationProps {
  user: AuthUser;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
    { href: "/ordenes", label: "Órdenes de Servicio", icon: ClipboardList },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/equipos", label: "Equipos", icon: Laptop },
    ...(user.rol === "ADMIN"
      ? [{ href: "/usuarios", label: "Usuarios / Técnicos", icon: UserCog }]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-9 w-9 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">FixLab</span>
            <span className="text-[10px] text-cyan-400 font-semibold block uppercase tracking-wider">
              Taller Pro
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
            <span
              className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                user.rol === "ADMIN"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
              }`}
            >
              {user.rol}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/50 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
