import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { usuarioService } from "@/core/services/usuario.service";
import UsuariosView from "./UsuariosView";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = await verifyToken(token);
  if (!currentUser || currentUser.rol !== "ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }

  const usuarios = await usuarioService.listUsuarios();

  const serializedUsuarios = usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol as "ADMIN" | "TECNICO",
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    _count: {
      ordenesAsignadas: u._count?.ordenesAsignadas ?? 0,
    },
  }));

  return <UsuariosView initialUsuarios={serializedUsuarios} currentUser={currentUser} />;
}
