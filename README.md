# FixLab · Sistema de Gestión de Taller Técnico

> **Prácticas Profesionalizantes II — Tecnicatura Superior en Desarrollo de Software (2026)**  
> **Proyecto Integrador de Software — MVP de Gestión Integral**

---

## 1. Descripción del Proyecto

**FixLab** es una solución integral desarrollada para la digitalización y gestión operativa del ciclo de vida de reparaciones en talleres de servicio técnico y soporte electrónico. Permite la trazabilidad completa desde la recepción del cliente y registro de los equipos hasta el diagnóstico técnico, presupuestación y entrega, garantizando control de acceso basado en roles (RBAC) y aseguramiento de la integridad de los datos mediante bajas lógicas.

---

## 2. Arquitectura de Software

La aplicación implementa una **Arquitectura en Capas desacoplada** con estricto apego a los principios **SOLID** y **DRY**:

```mermaid
graph TD
    subgraph Capa de Presentacion [Capa de Presentación / UI]
        A1[Next.js App Router]
        A2[Componentes React / Tailwind CSS]
        A3[Validación de Formularios en Cliente]
    end

    subgraph Capa de Controladores [Controladores / API REST]
        B1[Route Handlers /api/*]
        B2[Middleware de RBAC y Protección JWT]
        B3[Validación en Backend con Zod]
    end

    subgraph Capa de Negocio [Lógica de Negocio / Servicios]
        C1[AuthService]
        C2[ClienteService]
        C3[EquipoService]
        C4[OrdenService]
        C5[UsuarioService]
    end

    subgraph Capa de Datos [Acceso a Datos / Repositorios]
        D1[Prisma ORM Client Singleton]
        D2[ClienteRepository]
        D3[EquipoRepository]
        D4[OrdenRepository]
        D5[UsuarioRepository]
    end

    subgraph Base de Datos [Persistencia Relacional]
        E1[(PostgreSQL en Supabase)]
    end

    Capa de Presentacion --> Capa de Controladores
    Capa de Controladores --> Capa de Negocio
    Capa de Negocio --> Capa de Datos
    Capa de Datos --> Base de Datos
```

---

## 3. Modelo de Datos Relacional (DER)

Base de datos relacional normalizada en **PostgreSQL** administrada con **Prisma ORM** y migraciones versionadas:

```mermaid
erDiagram
    USUARIO ||--o{ ORDEN_SERVICIO : "atiende / registra"
    CLIENTE ||--o{ EQUIPO : "posee"
    EQUIPO ||--o{ ORDEN_SERVICIO : "recibe"

    USUARIO {
        string id PK
        string email UK
        string passwordHash
        string nombre
        enum rol "ADMIN | TECNICO"
        boolean isActive "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }

    CLIENTE {
        string id PK
        string dniCuit UK
        string nombre
        string telefono
        string email
        string direccion
        boolean isActive "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }

    EQUIPO {
        string id PK
        string clienteId FK
        string tipo "Notebook, Celular, etc."
        string marca
        string modelo
        string numeroSerie
        string accesorios
        boolean isActive "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }

    ORDEN_SERVICIO {
        string id PK
        string numeroOrden UK "OT-YYYY-XXXX"
        string equipoId FK
        string tecnicoAsignadoId FK
        string problemaReportado
        string diagnostico
        enum estado "PENDIENTE | EN_DIAGNOSTICO | EN_REPARACION | LISTO_ENTREGA | ENTREGADO | CANCELADO"
        decimal costoEstimado
        decimal costoFinal
        datetime fechaIngreso
        datetime fechaEgreso
        boolean isActive "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }
```

> **Estrategia de Baja Lógica (Soft Delete):** Ninguna entidad es eliminada físicamente de la base de datos (`isActive = false`). Esto evita pérdida de auditoría y garantiza la integridad referencial en relaciones con órdenes históricas.

---

## 4. Matriz de Roles y Permisos (RBAC)

El acceso al sistema y a los endpoints está regulado por tokens **JWT firmados con algoritmo HS256** transportados en cookies `HttpOnly` seguras:

| Operación / Recurso | Administrador | Técnico / Operador |
| :--- | :---: | :---: |
| Autenticación (Login, Logout, /me) | ✅ | ✅ |
| Gestión de Usuarios y Roles (`/usuarios`) | ✅ (CRUD completo) | ❌ (Bloqueo 403 Forbidden) |
| Gestión de Clientes (`/clientes`) | ✅ (CRUD completo) | ✅ (CRUD clientes activos) |
| Gestión de Equipos (`/equipos`) | ✅ (CRUD completo) | ✅ (Alta, edición y consulta) |
| Emisión de Órdenes de Trabajo (`/ordenes`) | ✅ | ✅ |
| Actualización Técnica (Diagnóstico y Estados) | ✅ | ✅ |
| Baja Lógica de Órdenes | ✅ | ✅ |
| Métricas y Estadísticas (`/dashboard`) | ✅ | ✅ |

---

## 5. Credenciales de Demostración (Seed)

Para facilitar la evaluación y corrección del proyecto, la base de datos incluye cuentas precargadas:

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@fixlab.com` | `Admin123!` | Acceso total + Administración de Usuarios |
| **Técnico** | `tecnico@fixlab.com` | `Tecnico123!` | Operación técnica de clientes, equipos y órdenes |

---

## 6. Prerrequisitos de Entorno

- **Node.js:** Versión 20.x o superior (desarrollado y testeado en Node v24).
- **npm:** Versión 10.x o superior.
- **Base de Datos:** Instancia de PostgreSQL (en la nube mediante Supabase / Neon o local).

---

## 7. Instalación y Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/juansenf/fixlab-taller.git
cd fixlab-taller
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` tomando como base `.env.example`:
```env
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="fixlab_super_secret_jwt_key_2026_minimum_32_chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Ejecutar migraciones versionadas y datos iniciales (Seed)
```bash
# Aplicar migraciones en PostgreSQL
npx prisma migrate dev

# Cargar usuarios y registros de prueba
npm run db:seed
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 8. Pruebas Automatizadas (QA)

El proyecto cuenta con una suite de pruebas unitarias implementadas con **Vitest** que validan las reglas críticas de negocio:

```bash
# Ejecutar todas las pruebas unitarias
npm test

# Modo interactivo en tiempo real (watch)
npm run test:watch
```

**Cobertura de pruebas:**
- `tests/unit/auth.service.test.ts`: Validación de hashes bcrypt, contraseñas incorrectas y bloqueo de cuentas inactivas.
- `tests/unit/cliente.service.test.ts`: Control de unicidad de DNI/CUIT, reactivación de clientes dados de baja y soft delete.
- `tests/unit/orden.service.test.ts`: Autogeneración de código correlativo (`OT-2026-XXXX`), validación de equipos activos y asignación automática de `fechaEgreso` al entregar.

---

## 9. Documentación de API y Colección Postman

- **Especificación OpenAPI 3.0:** Disponible en el endpoint `GET /api/docs` o en el archivo [`docs/openapi.json`](docs/openapi.json).
- **Colección Postman / Thunder Client:** Archivo importable listo para consumir en [`docs/fixlab-postman-collection.json`](docs/fixlab-postman-collection.json) con todos los endpoints tipados y variables de entorno.

---

## 10. Metodología de Desarrollo y Control de Versiones

Se aplicó estrictamente el flujo de trabajo profesional exigido por la cátedra:
- **Prohibición de commits directos en `main`:** Todas las funcionalidades fueron desarrolladas en ramas independientes (`feature/*`).
- **Integración por Pull Requests (PR):** Cada rama fue integrada a `main` mediante PRs descriptivos con trazabilidad de cambios.
- **Conventional Commits:** Mensajes semánticos estandarizados (`feat:`, `test:`, `docs:`, `chore:`).
