<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Directrices para agentes de IA y colaboradores

Este documento define las reglas arquitectónicas, de testing y operativas del frontend de CV Aligner AI. Es de cumplimiento obligatorio para cualquier cambio realizado por personas o agentes automatizados.

## Misión del proyecto y contexto operativo

`cv-aligner-ai-frontend` es la interfaz de usuario para la optimización de CVs y el seguimiento de postulaciones. Consume la API REST de `cv-aligner-ai-backend`, un servicio FastAPI que orquesta agentes con LangGraph.

Responsabilidades del frontend:

- Capturar y validar CVs, descripciones de vacantes y URLs de ofertas.
- Solicitar análisis y optimizaciones al backend.
- Visualizar scores ATS, diferencias entre versiones del CV y el estado de las postulaciones.
- Gestionar el estado del servidor, la autenticación y la experiencia de usuario.

El frontend no implementa lógica de agentes ni de inteligencia artificial. Toda decisión de dominio relacionada con el análisis debe residir en el backend.

## Reglas estrictas de Feature-Sliced Design

### Jerarquía unidireccional

La dependencia permitida es:

```text
app -> views -> widgets -> features -> entities -> shared
```

| Capa | Puede importar de |
| --- | --- |
| `app` | `views`, `widgets`, `features`, `entities`, `shared` |
| `views` | `widgets`, `features`, `entities`, `shared` |
| `widgets` | `features`, `entities`, `shared` |
| `features` | `entities`, `shared` |
| `entities` | `shared` |
| `shared` | `shared` |

Reglas obligatorias:

- Está prohibido importar de capas superiores.
- Está prohibido realizar importaciones cruzadas directas entre slices de la misma capa. Por ejemplo, `features/upload-cv` no puede importar `features/edit-cv`; la composición debe ocurrir en `widgets`, `views` o `app`.
- `shared/` no puede contener lógica de negocio, llamadas a endpoints concretos ni conocimiento de entidades del dominio.
- `app/` no puede contener lógica de negocio, componentes monolíticos ni fetching de datos de dominio. Solo importa y ensambla vistas, widgets, providers y estilos globales.

### Capa de vistas y App Router

- La capa FSD de vistas se ubica en `src/views/`.
- No se debe crear `src/pages/`: Next.js lo reserva para el Pages Router y entraría en conflicto con `src/app/`.
- `src/app/` es la única capa de enrutamiento. Sus archivos `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` y `route.ts` solo deben componer, envolver o configurar.
- Una ruta de `app/` debe delegar la vista completa a `views/` cuando la complejidad lo justifique. No se permiten páginas monolíticas.
- Los providers globales, incluido `QueryProvider`, viven en `src/app/providers/` y se inyectan desde el layout raíz.

### Public API e imports

Cada slice de `views/`, `widgets/`, `features/`, `entities/` y `shared/` debe exponer su funcionalidad pública únicamente a través de su archivo `index.ts`.

```text
features/upload-cv/
├── api/
├── model/
├── ui/
└── index.ts
```

Importación correcta:

```ts
import { UploadCvForm } from "@/features/upload-cv";
```

Importaciones prohibidas:

```ts
// Import profundo a un submódulo interno
import { UploadCvForm } from "@/features/upload-cv/ui/upload-cv-form";

// Import cruzado entre slices de la misma capa
import { EditCvForm } from "@/features/edit-cv";
```

Los imports deben usar el alias `@/*` configurado en `tsconfig.json`.

### Estructura interna de un slice

Cuando el slice lo requiera, usa la siguiente estructura:

```text
features/<slice>/
├── api/       # queries y mutaciones de TanStack Query
├── model/     # esquemas Zod, tipos, selectores y lógica pura
├── ui/        # componentes de interfaz del slice
├── lib/       # utilidades internas del slice
└── index.ts   # Public API
```

No es obligatorio crear todas las carpetas si el slice no las necesita. No crees carpetas vacías ni abstracciones prematuras.

## Delimitación Server vs Client Components

- Los componentes son Server Components por defecto.
- Usa `'use client'` únicamente cuando se requiera estado, efectos, event handlers, APIs del navegador, hooks personalizados o consumo de TanStack Query.
- Mantén los Server Components en `app/`, `views/` y `widgets/` siempre que sea viable. Empuja la frontera de cliente hacia las hojas interactivas.
- No añadas `'use client'` de forma indiscriminada a layouts, vistas o providers que no lo necesiten; el directive convierte todo el subárbol importado en cliente.
- No uses hooks de React ni APIs del navegador en archivos sin `'use client'`.
- Los Server Components asíncronos no son compatibles con Jest. Si necesitas probarlos, usa pruebas E2E.
- Antes de implementar APIs o convenciones de Next.js, consulta la documentación instalada en `node_modules/next/dist/docs/` para la versión `16.4.3`. No asumas APIs de versiones anteriores.

## Directrices de testing obligatorias

### Ubicación y co-location

Cada slice debe contener sus propias pruebas junto al código que prueban.

```text
features/upload-cv/
├── model/
│   ├── validate-file.ts
│   └── validate-file.test.ts
└── ui/
    ├── dropzone.tsx
    └── dropzone.test.tsx
```

Nombres esperados:

- Lógica pura: `<archivo>.test.ts` dentro de `model/`.
- Componentes: `<archivo>.test.tsx` dentro de `ui/`.
- Utilidades: `<archivo>.test.ts` junto a la utilidad.

### Enfoque por capa

- `model/`: pruebas unitarias puras para esquemas Zod, formateadores, mapeos, validaciones y cálculos de score ATS. Sin renderizado ni DOM.
- `ui/`: pruebas de integración con React Testing Library y `@testing-library/user-event`. Simula interacciones reales del usuario y valida el comportamiento observable, no detalles de implementación internos.
- `api/`: prueba el mapeo de request/response y el manejo de errores. Las llamadas de red deben mockearse.
- `shared/`: prueba utilidades y componentes base cuando su comportamiento no sea trivial.

### Mocking

- Aísla las llamadas de red mockeando los clientes de `shared/api/` o los handlers de Next.js.
- No realices peticiones HTTP reales durante las pruebas.
- No mockees componentes internos del mismo slice salvo que exista una razón justificada; prioriza probar el comportamiento integrado.
- Evita snapshots como sustituto de pruebas de comportamiento.

### Estado actual del tooling

Jest, React Testing Library, `jest-environment-jsdom` y los scripts `test:*` aún no están instalados. No afirmes que `pnpm test` funciona hasta que el tooling esté configurado.

La configuración objetivo usa `next/jest` y las siguientes dependencias de desarrollo:

```bash
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event ts-node @types/jest
```

Mientras el tooling no exista, todo slice nuevo debe incluir sus tests escritos y, si no es posible ejecutarlos, dejar constancia explícita del bloqueo. Un slice no se considera terminado sin pruebas.

## Convenciones de código y estado

- Cero tolerancia a `any`. Usa tipos explícitos, genéricos, `unknown` con validación o `satisfies`.
- Todos los contratos de datos deben residir en `entities/**/model/types.ts` o en `shared/types/`.
- Valida todos los inputs de usuario y payloads de API mediante esquemas Zod. Deriva los tipos con `z.infer` cuando corresponda.
- Las queries y mutaciones de TanStack Query se encapsulan exclusivamente dentro de `features/**/api/` o `entities/**/api/`.
- No realices `fetch` directamente desde componentes de UI. Usa los clientes de `shared/api/`.
- Centraliza el manejo de errores HTTP y la serialización en `shared/api/`.
- Los estilos se escriben con Tailwind CSS. Combina clases condicionales con `cn()` (`clsx` + `tailwind-merge`).
- Usa los componentes de `shared/ui/` como base visual. No dupliques primitivas de shadcn.
- Nombra carpetas y archivos en kebab-case y componentes en PascalCase.
- Usa Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`.
- No introduzcas dependencias nuevas sin justificar su necesidad y sin verificar que el proyecto no tenga ya una solución equivalente.

## Mapa de historias de usuario y alcance FSD

### Autenticación

- `features/auth-by-email`: formulario, validación Zod, login y manejo de sesión.
- `entities/user`: tipo de usuario, mapeos y presentación básica del perfil.

### Ingesta de CV y vacante

- `features/upload-cv`: carga de archivos PDF/DOCX, validación de tipo y tamaño, y envío al backend.
- `features/upload-job-text`: carga de descripciones de vacante en TXT.
- `features/extract-job-url`: extracción de contenido desde una URL de oferta.
- `entities/cv`: modelo, estados y componentes presentacionales del CV.
- `entities/job-vacancy`: modelo y componentes de la vacante.

### Optimización y métricas

- `widgets/ats-score-dashboard`: visualización del score ATS y desglose de métricas.
- `widgets/cv-diff-viewer`: comparación entre versiones del CV.
- `features/edit-cv`: edición y aceptación de cambios sugeridos.
- `views/cv-optimization`: composición de la vista de análisis y optimización.

### Gestión de postulaciones

- `widgets/applications-kanban`: tablero de postulaciones por estado.
- `features/update-application-status`: cambio de estado de una postulación.
- `entities/application`: modelo, tipos y componentes de la postulación.
- `views/applications`: vista de seguimiento de postulaciones.

## Guardrails y restricciones

- Todo slice funcional nuevo debe incluir tests unitarios y/o de integración antes de darse por completado.
- No crear componentes monolíticos en `app/`. `app/` solo importa y ensambla vistas, widgets, providers y estilos.
- No crear `src/pages/`; la capa de vistas es `src/views/`.
- No importar capas superiores ni realizar imports cruzados entre slices de la misma capa.
- No importar submódulos internos de otro slice; usa siempre su `index.ts`.
- No usar `any`.
- No saltarse la validación con Zod para inputs de usuario o payloads de API.
- No incluir secretos, tokens ni claves en el repositorio. Las variables `NEXT_PUBLIC_*` son públicas.
- No afirmar que una funcionalidad, dependencia o script existe si no está implementado.
- No modificar el bloque gestionado de Next.js en este archivo; Next.js lo actualiza automáticamente.

## Definition of Done

Un cambio se considera terminado cuando:

1. Respeta la jerarquía FSD y las Public APIs.
2. Incluye tests co-localizados y estos pasan cuando el tooling está disponible.
3. No introduce `any` ni omite la validación Zod.
4. Pasa `pnpm lint` y `pnpm exec tsc --noEmit`.
5. Mantiene `pnpm build` funcional.
6. Actualiza la documentación relevante si cambia la arquitectura, los scripts o las variables de entorno.
