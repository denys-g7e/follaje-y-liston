# Follaje & Listón — Decoración de Eventos

Aplicación web para negocio de decoración boutique de eventos. Incluye sitio público con catálogo y agendamiento, más un panel administrativo protegido con autenticación.

## Stack

- **Next.js** (App Router) + TypeScript
- **Convex** — backend en tiempo real (base de datos + funciones)
- **Convex Auth** — autenticación por email/contraseña
- **Tailwind CSS** — estilos

## Requisitos

- Node.js 18+
- npm

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```
CONVEX_DEPLOYMENT=          # Lo asigna npx convex dev
NEXT_PUBLIC_CONVEX_URL=     # Lo asigna npx convex dev
NEXT_PUBLIC_WHATSAPP_NUMBER=521234567890  # Número de WhatsApp del negocio
```

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar Convex (terminal 1)
npx convex dev

# Iniciar Next.js (terminal 2)
npm run dev
```

O en un solo comando (si `convex dev` está configurado con `--start`):

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Crear cuenta de administrador

1. Ve a `/admin`
2. Haz clic en "Crear nueva cuenta"
3. Ingresa email y contraseña
4. Una vez creada, inicia sesión para acceder al dashboard en `/admin/dashboard`

## Despliegue

### Frontend (Vercel)

```bash
npm run build
vercel --prod
```

Configura las variables de entorno en el panel de Vercel.

### Backend (Convex Cloud)

```bash
npx convex deploy
```

## Estructura del proyecto

```
├── convex/
│   ├── auth.ts            # Configuración de Convex Auth
│   ├── auth.config.ts     # Proveedores de auth
│   ├── http.ts            # Rutas HTTP
│   ├── schema.ts          # Esquema de base de datos
│   ├── bookings.ts        # Funciones de citas
│   ├── combos.ts          # Funciones de combos
│   └── seed.ts            # Datos iniciales
├── src/
│   └── app/
│       ├── page.tsx              # Página principal pública
│       ├── layout.tsx            # Layout raíz
│       ├── ConvexClientProvider.tsx
│       ├── globals.css           # Estilos globales y tema
│       ├── admin/
│       │   ├── page.tsx          # Login
│       │   └── dashboard/
│       │       └── page.tsx      # Panel de administración
├── middleware.ts            # Protección de rutas admin
└── .env.local              # Variables de entorno locales
```

## Funcionalidad

### Sitio público (`/`)
- Hero con nombre y frase de marca
- Catálogo de combos con filtro por categoría
- Formulario de agendamiento con validación
- Envío a WhatsApp al agendar
- Sección de contacto

### Panel admin (`/admin/dashboard`)
- Calendario mensual con navegación
- Gestión de citas (cambiar estado, eliminar, filtrar)
- Registro manual de citas
- CRUD de combos (crear, editar, eliminar)
- Notificaciones WhatsApp con un clic
