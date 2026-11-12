# CV Aligner AI — Frontend

Interfaz web para la optimización de CVs y el seguimiento de postulaciones mediante un sistema multiagente. Este cliente consume la API REST de `cv-aligner-ai-backend` (FastAPI + LangGraph), donde se orquestan los agentes responsables del análisis ATS, la alineación del CV con una vacante, la generación de diferencias y el seguimiento del proceso de postulación.

El frontend no contiene lógica de inteligencia artificial. Su responsabilidad es la composición de la experiencia de usuario, la captura y validación de entradas, la visualización de resultados y la gestión del estado del servidor.

## Estado del proyecto

La base actual contiene el bootstrap de Next.js, Tailwind CSS v4 y componentes de shadcn/ui. La arquitectura Feature-Sliced Design (FSD) descrita en este documento ya está aplicada en `src/`.

| Área | Estado |
| --- | --- |
| Next.js App Router, TypeScript y Tailwind CSS v4 | Implementado |
| Componentes shadcn/ui (Base UI + Lucide) | Implementado en `src/shared/ui/` |
| Capas FSD (`views`, `widgets`, `features`, `entities`, `shared`) | Implementado |
| Integración con la API REST | Implementada sobre `/api/v1`: autenticación, postulaciones y flujo de CV |
| Jest + React Testing Library | Configurado (`jest.config.ts` + `jest.setup.tsx`) |
| Variable `NEXT_PUBLIC_BACKEND_URL` | Implementada en `src/shared/api/http.ts` |

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
| [jsPDF](https://github.com/parallax/jsPDF) | `4.2.1` | Exportación del CV optimizado a PDF en el cliente |
| [ESLint](https://eslint.org/) | `9.39.5` | Linting con `eslint-config-next` |
| Jest + React Testing Library | `30.5.2` / `16.3.3` | Pruebas unitarias y de componentes |

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
| `views/` | `auth`, `document-upload`, `cv-optimization`, `cv-editor`, `applications` |
| `widgets/` | `upload-panel`, `optimization-result`, `cv-diff-viewer`, `ats-score-dashboard`, `applications-table` |
| `features/` | `auth-by-email`, `upload-cv`, `upload-job-text`, `extract-job-url`, `edit-cv`, `create-application`, `update-application-status`, `delete-application` |
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

> **Estado actual:** Jest y React Testing Library están configurados (`jest.config.ts`, `jest.setup.tsx` y los scripts `test:*` de `package.json`). La suite se ejecuta con `pnpm test` y las llamadas de red se mockean sobre `globalThis.fetch`. Ten en cuenta que Jest no soporta Server Components asíncronos; para esos casos se recomienda una prueba E2E.

## Variables de entorno

| Variable | Requerida | Ámbito | Ejemplo | Estado |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Sí | Cliente y servidor | `http://127.0.0.1:8000` | Implementada |

Crea un archivo `.env` en la raíz del repositorio:

```bash
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

El cliente centraliza el origen y el prefijo en `src/shared/api/http.ts` (`API_ORIGIN` + `API_PREFIX = "/api/v1"`). Todas las rutas relativas se resuelven contra `http://127.0.0.1:8000/api/v1` por defecto. Para añadir un endpoint usa rutas relativas (`/cvs`, `/applications`); no incluyas `/api/v1` en cada llamada.

Los archivos `.env*` están ignorados por Git. No incluyas secretos en variables con prefijo `NEXT_PUBLIC_`, ya que su valor se incorpora al bundle del navegador.

## Integración con la API

El cliente HTTP vive en `src/shared/api/query-client.ts` y expone `useApiQuery`, `useApiMutation`, `buildUrl` y `ApiError`. Todas las respuestas se validan con Zod antes de entrar a la aplicación, y el token se lee de `sessionStorage.getItem("access_token")` y se envía como `Authorization: Bearer <token>`.

### Postulaciones

| Hook | Endpoint | Uso |
| --- | --- | --- |
| `useApplicationsQuery` (`entities/application/api`) | `GET /applications` | Lista las postulaciones del usuario autenticado y mapea el payload `snake_case` a `camelCase`. |
| `useCreateApplicationMutation` (`features/create-application/api`) | `POST /applications` | Envía `{ "job_title", "company" }`, invalida `["applications"]` y confirma con un toast. |
| `useUpdateApplicationStatusMutation` (`features/update-application-status/api`) | `PATCH /applications/{id}/status` | Envía `{ "status": "..." }`, invalida la query `["applications"]` y confirma con un toast. |
| `useDeleteApplicationMutation` (`features/delete-application/api`) | `DELETE /applications/{id}` | Elimina la postulación (respuesta `204`), invalida `["applications"]` y confirma con un toast. |

La ruta `/applications` compone `views/applications` → `widgets/applications-table`, que muestra la tabla de postulaciones con filtros por puesto, empresa, estado y fecha, paginación, y las acciones de crear, ver, cambiar estado y eliminar. Incluye estados de carga, sesión no iniciada (`401`), lista vacía y errores de mutación.

Los estados válidos son `pending`, `under-review`, `accepted` y `rejected`. Un estado desconocido en la respuesta se normaliza a `pending` para no romper la tabla.

### Flujo de CV y editor

El flujo de optimización es asíncrono:

| Paso | Endpoint | Uso |
| --- | --- | --- |
| Subida | `POST /cvs` (multipart `cv_file`) | Devuelve `202` con el `id` y `action_required`. |
| Parseo | `GET /cvs/{id}` | Polling hasta `status = PARSED` (o error / `REUPLOAD_CV`). |
| Optimización | `POST /cvs/{id}/optimize` (`{ "job_description": "..." }`) | Devuelve `optimized_content`, `optimized_body`, `personal_info` y las métricas ATS. |
| Contenido original | `GET /cvs/{id}/content?include_structured=true` | Alimenta el panel de solo lectura del editor. |

La ruta `/analysis` muestra las métricas y enlaza a `/analysis/editor`. La vista `views/cv-editor` compone `widgets/cv-diff-viewer`, que usa la feature `edit-cv` para parsear secciones, comparar con el CV original, guardar borradores en `sessionStorage` y exportar el resultado a PDF con `jsPDF` (import dinámico en el cliente).

## Scripts disponibles

| Comando | Descripción | Estado |
| --- | --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo con Turbopack. | Disponible |
| `pnpm build` | Genera el build de producción. | Disponible |
| `pnpm start` | Sirve el build de producción. | Disponible |
| `pnpm lint` | Ejecuta ESLint. | Disponible |
| `pnpm test` | Ejecuta la suite de pruebas una vez. | Disponible |
| `pnpm test:watch` | Ejecuta las pruebas en modo watch. | Disponible |
| `pnpm test:coverage` | Ejecuta las pruebas con reporte de cobertura. | No configurado |

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

Para conectar el frontend con el backend, crea `.env` con `NEXT_PUBLIC_BACKEND_URL` apuntando a la API REST de `cv-aligner-ai-backend`.

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
