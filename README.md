# CV Aligner AI — Frontend

Interfaz web para la optimización de CVs y el seguimiento de postulaciones mediante un sistema multiagente. Este cliente consume la API REST de `cv-aligner-ai-backend` (FastAPI + LangGraph), donde se orquestan los agentes responsables del análisis ATS, la alineación del CV con una vacante, la generación de diferencias y el seguimiento del proceso de postulación.

El frontend no contiene lógica de inteligencia artificial. Su responsabilidad es la composición de la experiencia de usuario, la captura y validación de entradas, la visualización de resultados y la gestión del estado del servidor.

## Estado del proyecto

La base actual contiene el bootstrap de Next.js, Tailwind CSS v4 y componentes de shadcn/ui. La arquitectura Feature-Sliced Design (FSD) descrita en este documento es el **objetivo arquitectónico** hacia el que debe migrar el código. Las piezas marcadas como pendientes todavía no están implementadas en el repositorio.

| Área | Estado |
| --- | --- |
| Next.js App Router, TypeScript y Tailwind CSS v4 | Implementado |
| Componentes shadcn/ui (Base UI + Lucide) | Implementado en `src/components/ui/` |
| Capas FSD (`views`, `widgets`, `features`, `entities`, `shared`) | Pendiente de migración |
| Integración con la API REST | Pendiente |
| Jest + React Testing Library | Pendiente de instalación y configuración |
| Variable `NEXT_PUBLIC_API_URL` | Pendiente de incorporación |

## Inicio rápido

```bash
pnpm install
pnpm dev
```

El servidor de desarrollo estará disponible en [http://localhost:3000](http://localhost:3000).

## Stack tecnológico

Versiones verificadas en el entorno de desarrollo actual.

| Tecnología | Versión | Uso |
| --- | --- | --- |
| [Next.js](https://nextjs.org/) | `16.4.3` | App Router, enrutamiento, Server Components y build |
| [React](https://react.dev/) / React DOM | `19.3.0` | Biblioteca de interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org/) | `5.9.3` | Tipado estático en modo `strict` |
| [pnpm](https://pnpm.io/) | `11.15.1` | Gestor de paquetes (`packageManager`) |
| [Tailwind CSS](https://tailwindcss.com/) | `4.3.3` | Estilos atómicos con configuración CSS-first |
| [shadcn/ui](https://ui.shadcn.com/) | `4.23.0` | Sistema de componentes, estilo `base-nova` |
| [Base UI](https://base-ui.com/) | `1.9.0` | Primitivas accesibles de los componentes shadcn |
| [Lucide React](https://lucide.dev/) | `1.62.0` | Iconografía |
| [TanStack Query](https://tanstack.com/query) | `5.105.0` | Gestión de estado del servidor |
| [Zod](https://zod.dev/) | `4.6.7` | Validación de esquemas y contratos |
| [React Dropzone](https://react-dropzone.js.org/) | `20.1.4` | Carga de archivos PDF/DOCX |
| [ESLint](https://eslint.org/) | `9.39.5` | Linting con `eslint-config-next` |
| Jest + React Testing Library | Pendiente | Pruebas unitarias y de componentes |

> **Nota sobre shadcn/ui:** este proyecto usa la variante `base-nova` de shadcn con primitivas de **Base UI**, no Radix UI. La utilidad `cn()` se importa desde el paquete `cn` (construido sobre `clsx` y `tailwind-merge`) y hoy se re-exporta en `src/lib/utils.ts`.

### Configuración de estilos

- Tailwind CSS v4 se configura desde `src/app/globals.css` mediante `@import "tailwindcss"` y variables CSS. No existe `tailwind.config.*` ni `postcss.config.*`.
- Los estilos globales, tokens de color, radios y variantes oscuras viven en `src/app/globals.css`.
- `next.config.ts` habilita `cacheComponents`, `partialPrefetching` y las reglas de Turbopack para procesar CSS.
- La combinación condicional de clases debe realizarse siempre con `cn()`.

## Arquitectura Feature-Sliced Design

La aplicación sigue una jerarquía unidireccional de capas. Cada capa solo puede importar de las capas inferiores.

```text
src/
├── app/          # Next.js App Router: rutas, layouts, providers y estilos base
├── views/        # Vistas completas compuestas y montables desde app/
├── widgets/      # Bloques de interfaz complejos y autónomos
├── features/     # Interacciones de usuario con valor de negocio
├── entities/     # Modelos de dominio y UI presentacional atómica
└── shared/       # Código transversal agnóstico al negocio
    ├── api/
    ├── hooks/
    ├── lib/
    ├── types/
    └── ui/
```

> **Importante:** la capa de vistas se denomina `views/` y no `pages/`. Next.js reserva `src/pages/` para el Pages Router, por lo que usar ese nombre introduciría un conflicto con el App Router. `src/app/` sigue siendo la única capa de enrutamiento.

### Responsabilidades por capa

| Capa | Responsabilidad | Puede importar de |
| --- | --- | --- |
| `app/` | Enrutamiento, layouts, metadata, providers globales y `globals.css`. Solo compone e inyecta dependencias. | `views`, `widgets`, `features`, `entities`, `shared` |
| `views/` | Vistas completas listas para montarse en una ruta de `app/`. Componen widgets, features y entidades. | `widgets`, `features`, `entities`, `shared` |
| `widgets/` | Bloques autónomos de interfaz con una responsabilidad de negocio amplia. | `features`, `entities`, `shared` |
| `features/` | Acciones de usuario con valor de negocio y sus mutaciones/queries. | `entities`, `shared` |
| `entities/` | Modelos de dominio, tipos, mapeos y componentes presentacionales atómicos. | `shared` |
| `shared/` | UI base, clientes HTTP, hooks, utilidades y tipos agnósticos al negocio. | `shared` |

### Public API de los slices

Cada slice de `views/`, `widgets/`, `features/`, `entities/` y `shared/` debe exponer su superficie pública a través de un `index.ts`.

```text
features/upload-cv/
├── api/
├── model/
├── ui/
└── index.ts
```

Los consumidores deben importar desde la Public API:

```ts
import { UploadCvForm } from "@/features/upload-cv";
```

Se prohíben los imports profundos:

```ts
// Incorrecto
import { UploadCvForm } from "@/features/upload-cv/ui/upload-cv-form";
```

### Slices previstos

| Capa | Slices |
| --- | --- |
| `views/` | `login`, `dashboard`, `cv-optimization`, `applications` |
| `widgets/` | `cv-diff-viewer`, `ats-score-dashboard`, `applications-kanban` |
| `features/` | `auth-by-email`, `upload-cv`, `upload-job-text`, `extract-job-url`, `edit-cv`, `update-application-status` |
| `entities/` | `cv`, `job-vacancy`, `application`, `user` |
| `shared/` | `ui`, `api`, `hooks`, `lib`, `types` |

### Migración desde la estructura actual

| Ruta actual | Destino FSD |
| --- | --- |
| `src/components/ui/*` | `src/shared/ui/*` |
| `src/lib/utils.ts` | `src/shared/lib/utils.ts` |
| `src/app/page.tsx` (contenido de ejemplo) | Reemplazar por composición de una vista |
| `src/app/layout.tsx` | Mantener en `app/` y añadir providers globales |

## Estrategia de testing

El proyecto adoptará una estrategia de pruebas en dos niveles:

1. **Pruebas unitarias de `model/`:** esquemas Zod, formateadores, mapeos y cálculos puros, como el score ATS o la validación de archivos.
2. **Pruebas de integración de `ui/`:** renderizado de componentes con React Testing Library y simulación de interacciones con `@testing-library/user-event`. Se valida el comportamiento observable por el usuario, no los detalles internos de implementación.

Las pruebas se colocan junto al código que prueban (co-location):

```text
features/upload-cv/
├── model/
│   ├── validate-file.ts
│   └── validate-file.test.ts
└── ui/
    ├── dropzone.tsx
    └── dropzone.test.tsx
```

Las llamadas de red deben aislarse mockeando los clientes de `shared/api/` o los handlers de Next.js. No se deben realizar peticiones reales durante las pruebas.

> **Estado actual:** Jest, React Testing Library ni los scripts `test:*` están instalados. Mientras no se incorpore el tooling, `pnpm test` no existe. La configuración objetivo es `next/jest` con `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom` y `@testing-library/user-event`. Ten en cuenta que Jest no soporta Server Components asíncronos; para esos casos se recomienda una prueba E2E.

## Variables de entorno

| Variable | Requerida | Ámbito | Ejemplo | Estado |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Sí, al integrar la API | Cliente y servidor | `http://localhost:8000` | Pendiente; aún no se referencia en el código |

Crea un archivo `.env.local` en la raíz del repositorio:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Los archivos `.env*` están ignorados por Git. No incluyas secretos en variables con prefijo `NEXT_PUBLIC_`, ya que su valor se incorpora al bundle del navegador.

## Scripts disponibles

| Comando | Descripción | Estado |
| --- | --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo con Turbopack. | Disponible |
| `pnpm build` | Genera el build de producción. | Disponible |
| `pnpm start` | Sirve el build de producción. | Disponible |
| `pnpm lint` | Ejecuta ESLint. | Disponible |
| `pnpm test` | Ejecuta la suite de pruebas una vez. | Pendiente |
| `pnpm test:watch` | Ejecuta las pruebas en modo watch. | Pendiente |
| `pnpm test:coverage` | Ejecuta las pruebas con reporte de cobertura. | Pendiente |

Mientras no exista un script dedicado de type-check, se puede validar TypeScript con:

```bash
pnpm exec tsc --noEmit
```

## Puesta en marcha

### Requisitos

- Node.js 22 (verificado con `22.22.2`).
- pnpm `11.15.1` (definido en `packageManager`).

### Instalación y ejecución

```bash
git clone <url-del-repositorio>
cd cv-aligner-ai-frontend
pnpm install
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

Para conectar el frontend con el backend, crea `.env.local` con `NEXT_PUBLIC_API_URL` apuntando a la API REST de `cv-aligner-ai-backend`.

### Verificación

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Convenciones de contribución

- Usa Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`.
- No introduzcas `any`; los contratos de datos deben vivir en `entities/**/model/types.ts` o `shared/types/`.
- Valida entradas y payloads con Zod.
- Mantén las queries y mutaciones de TanStack Query dentro de `features/**/api/` o `entities/**/api/`.
- Respeta la jerarquía FSD y las Public APIs de cada slice.

Las reglas arquitectónicas y operativas completas para agentes de IA y colaboradores están en [`AGENTS.md`](./AGENTS.md).
