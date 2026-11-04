import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import Navigation from "@/components/Navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await verifyToken(token);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <Navigation user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
