import { PrismaClient, RolUsuario, EstadoOrden } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando carga de datos iniciales (Seed)...");

  // 1. Crear Administrador
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@fixlab.com" },
    update: {},
    create: {
      email: "admin@fixlab.com",
      nombre: "Administrador General",
      passwordHash: adminPassword,
      rol: RolUsuario.ADMIN,
    },
  });
  console.log(`✅ Usuario Admin creado: ${admin.email}`);

  // 2. Crear Técnico
  const tecnicoPassword = await bcrypt.hash("Tecnico123!", 10);
  const tecnico = await prisma.usuario.upsert({
    where: { email: "tecnico@fixlab.com" },
    update: {},
    create: {
      email: "tecnico@fixlab.com",
      nombre: "Carlos Técnico",
      passwordHash: tecnicoPassword,
      rol: RolUsuario.TECNICO,
    },
  });
  console.log(`✅ Usuario Técnico creado: ${tecnico.email}`);

  // 3. Crear Cliente de prueba
  const cliente = await prisma.cliente.upsert({
    where: { dniCuit: "30123456" },
    update: {},
    create: {
      dniCuit: "30123456",
      nombre: "Martín Gómez",
      telefono: "+54 9 11 4455-6677",
      email: "martin.gomez@email.com",
      direccion: "Av. Corrientes 1234, CABA",
    },
  });
  console.log(`✅ Cliente creado: ${cliente.nombre}`);

  // 4. Crear Equipo asociado al cliente
  let equipo = await prisma.equipo.findFirst({
    where: { clienteId: cliente.id, numeroSerie: "SN-DEL-9988" },
  });

  if (!equipo) {
    equipo = await prisma.equipo.create({
      data: {
        clienteId: cliente.id,
        tipo: "Notebook",
        marca: "Dell",
        modelo: "Inspiron 15 3000",
        numeroSerie: "SN-DEL-9988",
        accesorios: "Cargador original y funda negra",
      },
    });
    console.log(`✅ Equipo creado: ${equipo.marca} ${equipo.modelo}`);
  }

  // 5. Crear Orden de Servicio inicial
  const orden = await prisma.ordenServicio.upsert({
    where: { numeroOrden: "OT-2026-0001" },
    update: {},
    create: {
      numeroOrden: "OT-2026-0001",
      equipoId: equipo.id,
      tecnicoAsignadoId: tecnico.id,
      problemaReportado: "No enciende después de un corte de luz. Calienta cerca del conector.",
      diagnostico: "Corto en línea principal de 19V. Requiere reemplazo de mosfet de entrada.",
      estado: EstadoOrden.EN_REPARACION,
      costoEstimado: 45000.0,
      costoFinal: null,
    },
  });
  console.log(`✅ Orden de servicio creada: ${orden.numeroOrden} (${orden.estado})`);

  console.log("🚀 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
