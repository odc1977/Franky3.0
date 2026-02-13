# FRANKY 3.0 — FOUNDATION (Esqueleto Inicial)

Fecha: 2026-02-13
Estado: FOUNDATION ONLY (docs + extensión mínima funcional)

## 0) Objetivo de este documento

Este documento define la fundación de Franky 3.0: estructura de carpetas, rutas correctas, normas, tecnología/hardware, y los ficheros mínimos que deben existir en la raíz para evitar el caos de "se implementa en una carpeta, F5 carga otra".

IMPORTANTE:

- Aquí NO se implementan features (Txx). Solo se crea el ESQUELETO + documentos base.
- Toda la implementación se hace dentro de **Antigravity Gateway** (primero CLI con Opus 4.6, luego extensión de Kilo dentro de Antigravity).

---

## 1) Rutas absolutas (fuente de verdad)

### 1.1 Raíz del proyecto

- Repo raíz (ÚNICA raíz válida): `J:\FRANKY3.0`

Regla:

- Todos los prompts, auditorías, generación de documentación y ejecución de agentes se hacen con `J:\FRANKY3.0` como raíz.
- No se permiten "workspaces abiertos" en subcarpetas sueltas salvo el caso explícito de Dev Host (ver sección F5).

### 1.2 Qdrant local (vector DB)

- Data dir (host): `J:\QDRANT_DATA`
- Contenedor: `qdrant-kilo` (id: `d5a7f82ffeaf`)
- Imagen: `qdrant/qdrant`
- Mapeo de puertos (según tu docker actual): `localhost:6335 -> container:6333`

Notas:

- Internamente Qdrant escucha en 6333 (HTTP). Tú lo accedes por `http://localhost:6335/`.
- A nivel de config de Franky 3.0, el QDRANT_URL "de desarrollo" será: `http://localhost:6335`.

---

## 2) Idiomas y estilo (restricciones estrictas)

### 2.1 Idiomas permitidos (SOLO DOS)

**ÚNICAMENTE Español (ES) e Inglés (EN)** en:

- UI de la extensión (menús, comandos, mensajes, tooltips).
- Logs y Output Channels.
- Documentación (MASTER PLAN, BIBLE, SPECs, ADRs, README).
- Prompts, Rules (`AGENTS.md`, `.kilocode/rules/`).

**Prohibido**:

- Cualquier otro idioma (chino, francés, alemán, etc.).
- UI/mensajes/prompts en lenguas distintas a ES/EN.

### 2.2 Prohibiciones explícitas (normas del proyecto)

- **No monolitos**: nada de "un agente hace todo".
- **Roles siempre separados**: Architect diseña; Coder implementa; Reviewer/QA valida.
- **No cambios de idea a mitad de implementación** sin ADR formal.
- **No pedir al humano pasos técnicos manuales** para validar (no PROBLEMS, no Output, no ejecutar comandos a mano). Los agentes deben automatizar validaciones.
- **Cambios atómicos y trazables** por Txx, sin refactors masivos "de regalo".

---

## 3) Hardware (detalle completo)

### 3.1 CPU

- **AMD Ryzen 9 3900XT** (12 cores / 24 threads, boost hasta ~4.7 GHz)
    - Uso previsto: compilación rápida de TypeScript, ejecución de tests, indexado masivo paralelo cuando se implemente T100.

### 3.2 RAM

- **64 GB DDR4**
    - Uso previsto:
        - Contextos masivos en agentes (Kilo + modelos locales).
        - Caché de embeddings/vectores en memoria durante indexado.
        - Múltiples instancias de VS Code Dev Host + Antigravity + Qdrant simultáneos sin swap.

### 3.3 Almacenamiento

- **2 x NVMe Sabrent PCIe 4.0**
    - Uso previsto:
        - Disco 1: Sistema operativo + aplicaciones + repo `J:\FRANKY3.0`.
        - Disco 2 (o partición): Data de Qdrant `J:\QDRANT_DATA`, modelos locales (Ollama/LM Studio), caché.
    - Beneficio: I/O ultra-rápido para indexado de repositorios grandes, lectura/escritura de vectores en Qdrant, y carga de modelos LLM pesados.

### 3.4 GPUs disponibles

El sistema tiene **dos GPUs NVIDIA**:

1. **RTX 3060 Ti** (12 GB VRAM)
    - Uso previsto en Franky 3.0:
        - Generación de embeddings (modelos tipo `nomic-embed-text`, `mxbai-embed-large`, etc.).
        - Workloads de inferencia ligera que no necesiten >12 GB.
    - Acceso: local vía Ollama, LM Studio, o servidor de embeddings propio.

2. **RTX 3090** (24 GB VRAM)
    - Uso previsto en Franky 3.0:
        - Modelos grandes (LLMs de 13B-70B cuantizados).
        - Inferencia pesada fuera del editor (tareas batch, análisis de código profundo).
    - Acceso: local vía Ollama, LM Studio, vLLM, o similar.

### 3.5 Stack de software GPU

- Drivers NVIDIA actualizados.
- CUDA toolkit compatible.
- Ollama / LM Studio / vLLM (según se decida en un ADR posterior).
- (En FOUNDATION no se optimiza nada; solo se documenta la disponibilidad y uso previsto.)

### 3.6 Implicaciones para Franky 3.0

Con este hardware:

- **Indexado de repositorios grandes** (100K+ archivos) debe ser fluido gracias a 12c/24t + NVMe.
- **Embeddings masivos** se pueden generar localmente sin depender de APIs externas (ahorro de costes).
- **Modelos locales de hasta 70B** (cuantizados) son viables en la 3090 para tareas críticas sin latencia de red.
- **Contextos ultra-largos** (200K+ tokens con modelos tipo Gemini/Kimi) son manejables en RAM sin problemas de memoria.

---

## 4) Proveedores de modelos (4 iniciales únicamente)

Para **evitar el zoo de proveedores** que hubo en Franky 2.0, Franky 3.0 arranca con **exactamente 4 proveedores**:

### 4.1 OpenRouter

- Endpoint: `https://openrouter.ai/api/v1`
- Uso: acceso a modelos cloud (GPT, Claude, Gemini, etc.) con una sola API key.
- Configuración: API key en `.env` o settings seguras de extensión.

### 4.2 OpenAI-compatible (Proxy Antigravity)

- Endpoint: `http://localhost:YOUR_PORT/v1` (ajustar según tu Antigravity Gateway).
- Uso: proxy local que despacha a distintos backends (cloud, local, embeddings) con interfaz OpenAI-compatible.
- Configuración: URL + headers según tu setup de Antigravity.

### 4.3 Local GPU 1 (RTX 3060 Ti)

- Endpoint: depende del servidor elegido (Ollama: `http://localhost:11434`, LM Studio: `http://localhost:1234`, etc.).
- Uso: embeddings y modelos ligeros (<13B).
- Configuración: URL local + modelo explícito (ej. `nomic-embed-text:latest`).

### 4.4 Local GPU 2 (RTX 3090)

- Endpoint: igual que arriba, pero configurado para apuntar a la 3090 si se usan servidores separados, o se indica GPU_ID en entorno.
- Uso: LLMs grandes (13B-70B).
- Configuración: URL local + modelo explícito (ej. `llama3.3-70b-q4`).

**Regla**: durante FOUNDATION y las primeras Txx, **no se añaden más proveedores**. Cualquier provider adicional (Azure, Anthropic directo, etc.) requiere ADR y justificación explícita.

---

## 5) Stack tecnológico (lo mejor de 2026)

### 5.1 Lenguajes y runtime

- **TypeScript 5.4+** (strict mode, latest features)
- **Node.js 22.x LTS** (native fetch, performance improvements)
- **Bun** (opcional como alternativa ultra-rápida a Node para scripts/tests)

### 5.2 Package manager

- **pnpm 9.x** (no npm)
    - Más rápido, menos espacio en disco, mejor manejo de monorepos.

### 5.3 Build tools y bundling

- **tsup** (wrapper moderno sobre esbuild)
    - Build ultrarrápido de TypeScript para extensiones.
    - Zero-config, tree-shaking automático.
- **Vite 5.x** (si se necesita dev server para webviews)
- **esbuild** bajo el capó (el más rápido en 2026).

### 5.4 Linting y formateo (moderno, todo-en-uno)

- **Biome** (sustituto moderno de ESLint + Prettier)
    - Escrito en Rust, 100x más rápido.
    - Linting + formatting + import sorting en una sola herramienta.
    - Configuración: `biome.json` en raíz.

### 5.5 Testing (moderna stack)

- **Vitest 2.x** (test runner moderno, compatible Vite)
    - Mucho más rápido que Mocha/Jest.
    - Watch mode inteligente, snapshots, coverage nativo.
- **@vscode/test-electron** (para tests de integración VS Code)
- **c8** o **vitest coverage** (code coverage con v8)

### 5.6 Vector database y embeddings

- **Qdrant 1.9+** (última stable, REST + gRPC)
    - Puerto HTTP: 6333 interno, 6335 host.
    - Persistencia: `J:\QDRANT_DATA`.
    - Features: sparse vectors, multi-vector, payload indexing.
- **Embeddings locales (modelos SOTA 2025-2026)**:
    - **nomic-embed-text-v1.5** (143M params, SOTA para retrieval, Apache 2.0)
    - **mxbai-embed-large-v1** (335M params, mejor que OpenAI ada-002)
    - **bge-m3** (multilingüe, última versión de BAAI)
    - **jina-embeddings-v3** (8K context, excelente para código)
    - Servidor: **Ollama** (más fácil) o **TEI (Text Embeddings Inference)** de HuggingFace (más rápido en producción).

### 5.7 AST parsing (lo más moderno)

- **Tree-sitter** (bindings WASM + Node.js)
    - **tree-sitter 0.22+** con new query API.
    - Parsers: `typescript`, `tsx`, `javascript`, `python`, `rust`, `markdown`, `json`.
    - **tree-sitter-graph** (si hace falta análisis de dependencias).

### 5.8 HTTP client

- **Native fetch** (Node 22+ built-in, sin dependencias)
- **ofetch** o **ky** (wrappers modernos sobre fetch si hace falta retry/interceptors)
- NO usar axios (legacy, más lento).

### 5.9 Logging estructurado

- **pino** (el más rápido en Node.js, 5-10x más que winston)
    - JSON structured logging.
    - Low overhead, ideal para producción.
- **pino-pretty** (pretty-print en desarrollo).

### 5.10 Protocolos y estándares

- **MCP (Model Context Protocol)** SDK oficial (TypeScript)
    - Para exponer servicios de Franky a otros agentes/IDEs.
- **LSP (Language Server Protocol)** integration si se necesita.
- **OpenAI-compatible API** (estándar de facto para LLMs).

### 5.11 Type safety y validación

- **Zod** (schema validation, mejor que Joi/Yup)
    - Type-safe, zero dependencies, excelente DX.
- **effect-ts** (opcional, para programación funcional type-safe avanzada).

### 5.12 Monorepo tools (si se necesita)

- **Turborepo** (build orchestration, caching inteligente)
- **nx** (alternativa si se necesita más features de monorepo).

### 5.13 Git hooks y pre-commit

- **Lefthook** (moderno, escrito en Go, más rápido que husky)
    - Pre-commit: Biome check + tests rápidos.

### 5.14 Documentación

- **Markdown** (toda la doc: MASTER PLAN, BIBLE, SPECs, ADRs).
- **Mermaid** (diagramas embebidos).
- **Shiki** (syntax highlighting moderno si se genera docs HTML).
- **TSDoc** (comentarios TypeScript, estándar oficial).

### 5.15 Dev tools

- **tsx** (ejecutar TypeScript directamente sin compilar, reemplazo de ts-node)
- **taze** (actualizar dependencias de forma inteligente).
- **publint** (validar package.json antes de publicar).

### 5.16 Restricciones y decisiones

**SÍ usar (lo mejor de 2026)**:

- pnpm (no npm).
- Biome (no ESLint + Prettier separados).
- Vitest (no Mocha/Jest).
- tsup/esbuild (no webpack/rollup).
- Native fetch (no axios).
- pino (no winston/bunyan).
- Zod (no Joi/class-validator).

**NO usar (legacy o demasiado pesado para esta fase)**:

- npm, yarn classic.
- ESLint + Prettier (usar Biome).
- Mocha, Jest (usar Vitest).
- axios, request (usar fetch nativo).
- winston, bunyan (usar pino).
- React/Vue en webviews en FOUNDATION (si hace falta UI compleja, se decide en ADR después con Lit/Svelte modernos, no frameworks pesados).

---

## 6) Estructura de carpetas (súper clara)

En `J:\FRANKY3.0` crear exactamente esto:

2 Crear .gitignore completo:

text

# Node

node_modules/
dist/
out/
\*.vsix

# TypeScript

\*.tsbuildinfo

# Logs

\*.log
logs/

# IDE

.vscode/.env
.vscode/settings.json
.idea/

# OS

.DS_Store
Thumbs.db

# Secrets

.env
.env.local
_.key
_.pem

# Qdrant data (no commitear data)

# (los datos viven en J:\QDRANT_DATA fuera del repo)

# Build artifacts

\*.vsix
coverage/
.nyc_output/

# Temp

tmp/
temp/
Commit inicial (FOUNDATION):

bash
git add FRANKY_FOUNDATION_3.0.md .gitignore
git commit -m "feat(foundation): initial commit - FOUNDATION document"
11.2 Política de commits
Commits obligatorios en cada fase:

Después de generar docs base (Opus):

text
feat(docs): generate MASTER_PLAN, BIBLE, AGENTS.md via Opus 4.6
Después de crear esqueleto de extensión:

text
feat(extension): create minimal Franky 3.0 (Dev) skeleton
Después de validar F5:

text
test(extension): validate F5 launch and Output Channel
Por cada Txx implementada:

text
feat(T100): implement semantic engine core services
test(T100): add indexing and search tests
docs(T100): update SPEC and integration guide
Formato de commits (Conventional Commits):

feat(scope): descripción - nueva funcionalidad

fix(scope): descripción - corrección de bug

docs(scope): descripción - solo documentación

test(scope): descripción - tests

refactor(scope): descripción - refactor sin cambio funcional

chore(scope): descripción - tareas de mantenimiento

11.3 Flujo de trabajo de 6 pasos (metodología Franky 3.0)
Cada Txx sigue este ciclo obligatorio:

text
┌──────────────────────────────────────────────────────────────┐
│ CICLO DE VIDA DE UNA TAREA (Txx) │
├──────────────────────────────────────────────────────────────┤
│ 1. PLANIFICACIÓN → Orchestrator + Product Owner │
│ 2. ARQUITECTURA → Architect │
│ 3. IMPLEMENTACIÓN → Coder │
│ 4. TESTING → QA / Tester │
│ 5. GUARDADO (Git) → Coder / Orchestrator │
│ 6. DOCUMENTACIÓN → Architect / Tech Writer │
└──────────────────────────────────────────────────────────────┘
Paso 1: PLANIFICACIÓN
Responsable: Orchestrator + Product Owner (humano o agente de priorización)

Skills usados:

project-mentor (consulta de contexto)

spec-auditor (validar que la Txx tiene sentido en el MASTER PLAN)

Entregables:

Brief de la tarea (1 párrafo): qué problema resuelve, por qué ahora, dependencias.

Criterios de aceptación (3-5 puntos concretos).

Estimación de complejidad (S/M/L/XL).

Commit: NO (solo docs en borrador, no se commitea hasta tener SPEC).

Paso 2: ARQUITECTURA
Responsable: Architect

Skills usados:

franky-architect (en Kilo)

spec-auditor (auto-revisión del SPEC antes de aprobarlo)

Entregables:

SPEC completo en specs/Txx_NombreTarea.md:

Contexto y objetivo.

Módulos/servicios a crear o modificar.

Interfaces (firmas TypeScript).

Plan de integración con módulos existentes.

Tests esperados (nombres y qué validan).

Rutas de archivos exactas.

ADR si la tarea introduce decisión arquitectónica importante (ej. T100).

Commit:

bash
git add specs/Txx*\*.md adr/ADR*\*.md
git commit -m "docs(Txx): add SPEC and ADR for [nombre tarea]"
Validación: spec-auditor revisa SPEC antes del commit; si hay huecos, vuelve a Architect.

Paso 3: IMPLEMENTACIÓN
Responsable: Coder

Skills usados:

especialistaencdigodefranky20 (en Roo, o equivalente en Kilo si migramos todo)

Solo puede tocar archivos mencionados en el SPEC; nada más.

Entregables:

Código TypeScript en extensions/franky-vscode/src/... según SPEC.

Tipos, interfaces, servicios, wiring.

NO tests en este paso (los crea QA en paso 4).

Commit: NO hasta que pase tests (paso 4).

Validación interna:

Compilación sin errores TypeScript: pnpm build

Biome check sin errores: pnpm lint

Si falla, Coder corrige antes de pasar a QA.

Paso 4: TESTING
Responsable: QA / Tester

Skills usados:

franky-debug-specialist

refactor-qa (validar que no se rompió nada más)

Entregables:

Tests en extensions/franky-vscode/src/\*_/_.test.ts según lista del SPEC.

Cobertura mínima: 80% de líneas de código nuevo (medido con vitest coverage).

Tests de integración si el SPEC lo requiere (ej. T100 con Qdrant real).

Commit: aún NO (primero validar que pasan).

Validación:

bash
pnpm test # todos los tests deben pasar
pnpm test:coverage # cobertura >= 80%
pnpm build # build final sin errores
Si falla algo:

Si falla test → Coder corrige código.

Si falla cobertura → QA añade tests faltantes.

Si falla build → Coder corrige tipos/imports.

Una vez TODO en verde:

Paso 5: GUARDADO (Git)
Responsable: Coder + Orchestrator

Skills usados:

git-expert (si hace falta resolver conflictos)

Proceso:

Verificar estado limpio:

bash
git status
pnpm lint # Biome check
pnpm test # todos los tests
pnpm build # compilación final
Commit atómico de la implementación:

bash
git add extensions/franky-vscode/src/\*_/_
git commit -m "feat(Txx): implement [nombre feature] - closes #Txx"
Commit separado de tests:

bash
git add extensions/franky-vscode/src/\*_/_.test.ts
git commit -m "test(Txx): add tests for [nombre feature]"
Tag si es hito importante (ej. T100 completo):

bash
git tag -a v0.1.0-T100 -m "T100: Semantic Engine MVP"
Validación: Orchestrator revisa que:

Commits siguen Conventional Commits.

No hay archivos sensibles (.env, API keys).

Mensajes de commit referencian el Txx correcto.

Paso 6: DOCUMENTACIÓN
Responsable: Architect + Tech Writer (puede ser el mismo Architect)

Skills usados:

project-mentor (actualizar guías)

spec-auditor (marcar SPEC como "implemented")

Entregables:

Actualizar SPEC (specs/Txx\_\*.md) con:

Estado: IMPLEMENTED + fecha.

Link al commit(s) que lo implementan.

Notas post-implementación (si hubo desviaciones del diseño original).

Actualizar MASTER_PLAN:

Marcar Txx como ✅ DONE.

Actualizar dependencias de otras tareas si aplica.

Si hubo cambios arquitectónicos no previstos:

Crear ADR retro-activo explicando por qué se desvió del SPEC.

README de usuario si la feature es visible:

Cómo activarla (settings).

Ejemplos de uso.

Commit:

bash
git add specs/Txx\_\*.md FRANKY_MASTER_PLAN_3.0.md README.md
git commit -m "docs(Txx): mark as implemented and update user guide"
11.4 Resumen de roles y skills por paso
Paso Rol Principal Skills Kilo Entregable Commit

1. Planificación Orchestrator project-mentor, spec-auditor Brief + criterios NO
2. Arquitectura Architect franky-architect, spec-auditor SPEC + ADR SÍ (docs)
3. Implementación Coder especialistaencdigodefranky20 Código TS NO (espera tests)
4. Testing QA/Tester franky-debug-specialist, refactor-qa Tests + coverage NO (espera validación)
5. Guardado Coder + Orchestrator git-expert Commits atómicos SÍ (código + tests)
6. Documentación Architect project-mentor, spec-auditor SPEC updated, README SÍ (docs finales)
   11.5 Branches y estrategia Git (opcional, definir en ADR)
   En FOUNDATION NO se define aún estrategia de branches (main vs feature branches), pero se deja abierto para decidir en ADR posterior:

Opción A: trunk-based (todo a main, commits atómicos pequeños).

Opción B: feature branches (feature/T100-semantic-engine → PR → main).

Decisión: en un ADR cuando se implemente la primera Txx grande (probablemente T100).

11.6 Pre-commit hooks (Lefthook)
Configurar desde FOUNDATION:

Archivo .lefthook.yml en raíz:

text
pre-commit:
commands:
lint:
run: pnpm lint
stage_fixed: true

    type-check:
      glob: "*.{ts,tsx}"
      run: pnpm type-check

    test-changed:
      glob: "*.{ts,tsx}"
      run: pnpm test:changed

Instalar:

bash
pnpm add -D lefthook
pnpm lefthook install
Esto garantiza que NUNCA se commitea código que:

No pasa Biome lint.

No pasa type-check.

Rompe tests existentes.

12. Estructura modular de documentación técnica (Biblias por subsistema)
    12.1 Objetivo
    Dado que Franky 3.0 tendrá decenas de tareas (Txx) organizadas en volúmenes, es crítico NO tener un solo documento monolítico, sino biblias técnicas modulares por subsistema que:

Agrupen tareas relacionadas (ej. todas las de memoria, todas las de UI, todas las de seguridad).

Documenten a fondo cada subsistema con:

Contexto y justificación.

Arquitectura del subsistema (diagramas).

Tareas (Txx) que lo componen.

Dependencias entre tareas y con otros subsistemas.

Estadísticas (tiempo estimado, complejidad, beneficio).

Enlaces a docs externas, ADRs, papers.

Rutas de archivos involucrados.

Sirvan como documentación de referencia para que el Architect, al crear un SPEC de una Txx concreta, tenga todo el contexto sin tener que buscar en 50 archivos.

12.2 Taxonomía de subsistemas (propuesta inicial)
Al recibir el MASTER PLAN completo, Opus debe identificar y agrupar las Txx en estos subsistemas (ajustar según contenido real):

ID Subsistema Nombre Descripción breve Txx asociadas (ejemplo)
MOD-CORE Core Engine Motor semántico (T100), memoria (T13), índice de código T13, T100, T102
MOD-UI User Interface Timeline, diffs, checkpoints, HQ, dashboard T20-T29
MOD-MEM Advanced Memory Memoria episódica, semántica, procedimental, H-MEM T30-T39
MOD-AUTO Autonomy & Safety YOLO mode, safety gatekeeper, auto-approve granular T40-T49
MOD-PROTO Protocols & Interop MCP, A2A, policy engine, enterprise guardrails T50-T59
MOD-AGENT Multi-Agent Orchestration Agentes paralelos, delegación, supervisor T60-T69
MOD-TOOLS Tools & Skills Skills registry, tool calling, MCP tools T70-T79
MOD-TEST Testing & QA Test generation, coverage, regression T80-T89
MOD-DEV Developer Experience Dev mode, debugging, profiling, telemetría T90-T99
MOD-INFRA Infrastructure Qdrant ops, GPU management, embeddings pipeline T110-T119
(Opus ajustará esta tabla según el contenido real del MASTER PLAN suministrado.)

12.3 Estructura de cada Biblia de Subsistema
Por cada subsistema, se crea un documento:

Ubicación: J:\FRANKY3.0\docs\modules\MOD-{ID}\_{Nombre}.md

Ejemplo: docs/modules/MOD-CORE_Core_Engine.md

Contenido obligatorio:

text

# MOD-CORE: Core Engine

## 📋 Metadata

- **ID Subsistema**: MOD-CORE
- **Volumen(es) asociado(s)**: VOL10 (CoStrict Enterprise)
- **Prioridad global**: 🔴 CRÍTICA
- **Estado**: [PLANNED | IN PROGRESS | IMPLEMENTED]
- **Owner**: [Architect lead para este módulo]
- **Última actualización**: YYYY-MM-DD

---

## 1. Contexto y Justificación

### 1.1 Problema que resuelve

Descripción extendida (3-5 párrafos) del problema de negocio/técnico que resuelve este subsistema.

**Ejemplo**:

> Franky 2.0 tenía memoria de sesión y código indexado mezclados en T13, generando acoplamiento excesivo.
> La necesidad de búsqueda semántica enterprise (RAG) con soporte AST y reglas jerárquicas
> (AGENT(S).md) requiere un motor dedicado (T100) mientras T13 se especializa solo en sesiones.

### 1.2 Beneficios esperados

- **Para el usuario**: [ej. búsquedas de código 10x más precisas]
- **Para el sistema**: [ej. desacoplamiento, escalabilidad, soporte multi-expert review]
- **Para el negocio**: [ej. permite features enterprise, reduce costes de indexado cloud]

### 1.3 Referencias externas

- [CoStrict Architecture](https://docs.costrict.ai/en/guide/feature/)
- [Paper: Tree-sitter for AST-based chunking](https://...)
- [ADR_001: T100 vs T13](../../adr/ADR_001_T100_vs_T13.md)

---

## 2. Arquitectura del Subsistema

### 2.1 Diagrama de componentes (Mermaid)

```mermaid
graph TB
    T100[T100: Semantic Engine]
    T13[T13: Session Memory Facade]
    Qdrant[(Qdrant Local)]
    GPU[RTX 3060 Ti<br/>Embeddings]

    T100 -->|indexes code| Qdrant
    T100 -->|generates| GPU
    T13 -->|delegates to| T100
    T13 -->|stores sessions| Qdrant

    style T100 fill:#f9f,stroke:#333,stroke-width:4px
    style T13 fill:#bbf,stroke:#333,stroke-width:2px
2.2 Responsabilidades de cada componente
Componente	Responsabilidad	Tecnologías clave
T100 (Semantic Engine)	Indexado AST + búsqueda vectorial de código	Tree-sitter, Qdrant, Ollama embeddings
T13 (Session Memory)	Fachada de memoria de sesión, delega persistencia a T100	TypeScript, interfaces de T100
Qdrant	Vector store único para código + sesiones	Qdrant 1.9+, colecciones por lenguaje
RTX 3060 Ti	Generación de embeddings locales	Ollama, nomic-embed-text-v1.5
2.3 Flujo de datos principal
Usuario ejecuta comando "Franky: Index Workspace"

T100.IndexingService crawlea archivos .ts/.js/.py/.md

AstChunker (Tree-sitter) fragmenta por función/clase

GpuEmbeddingClient (3060 Ti) genera embeddings

QdrantClient inserta vectores + metadata en colección franky_code_ts

T13.SessionMemoryService recupera contexto via T100.SemanticSearchService

3. Tareas (Txx) del Subsistema
3.1 Tabla de tareas
Txx	Nombre	Prioridad	Complejidad	Dependencias	Estado
T100	Semantic Engine Core	🔴 CRÍTICA	Alta	ninguna	PLANNED
T13	Session Memory Refactor	🔴 CRÍTICA	Media	T100	PLANNED
T102	AST Chunker Optimization	🟡 MEDIA	Media	T100	PLANNED
T103	Multi-Expert Code Review	🟢 BAJA	Alta	T100, T102	PLANNED
3.2 Grafo de dependencias
text
graph LR
    T100[T100: Engine]
    T13[T13: Memory]
    T102[T102: AST Opt]
    T103[T103: Review]

    T100 --> T13
    T100 --> T102
    T102 --> T103

    style T100 fill:#f99,stroke:#333,stroke-width:4px
3.3 Descripción extendida de cada Txx
T100: Semantic Engine Core
Descripción: Motor de indexado y búsqueda semántica para todo el repositorio, inspirado en CoStrict.

Componentes a implementar:

IndexingService (orquestación de indexado)

AstChunker (fragmentación inteligente vía Tree-sitter)

SemanticSearchService (búsqueda híbrida: semántica + reglas)

RuleEngine (carga y aplica AGENT(S).md jerárquicos)

QdrantClient (adaptador especializado)

Rutas de archivos:

extensions/franky-vscode/src/core/semantic/indexing-service.ts

extensions/franky-vscode/src/core/semantic/ast-chunker.ts

extensions/franky-vscode/src/core/semantic/semantic-search-service.ts

extensions/franky-vscode/src/core/semantic/rule-engine.ts

extensions/franky-vscode/src/core/semantic/qdrant-client.ts

Interfaces clave (extracto):

typescript
interface IndexingService {
  index(path: string, options?: IndexingOptions): Promise<IndexingResult>;
  remove(path: string): Promise<void>;
  getStatus(path: string): Promise<FileIndexStatus>;
}

interface SemanticSearchService {
  search(query: string, limit: number): Promise<SearchResult[]>;
  queryContext(query: string, currentFile?: string): Promise<ContextBlock>;
}
Tests esperados:

indexing.test.ts - verifica chunking correcto de archivo TS

search_precision.test.ts - Top-3 accuracy en fixture conocido

rule_engine.test.ts - aplicación de AGENT(S).md por directorio

t13_integration.test.ts - T13 funciona como fachada de T100

Tiempo estimado: 3-5 días (Architect 1d, Coder 2d, QA 1-2d)

Beneficio cuantificable:

Precisión de búsqueda: de ~40% (texto plano) a ~85% (AST + semántica)

Tiempo de indexado: ~5min para repo de 50K archivos (con 3060 Ti)

Ahorro de costes: $0 embeddings cloud (todo local)

ADRs relacionados: ADR_001_T100_vs_T13.md

T13: Session Memory Refactor
Descripción: Refactorizar T13 para que actúe como fachada pura que delega indexado/búsqueda a T100.

Componentes a modificar:

extensions/franky-vscode/src/core/memory/session-memory-service.ts

extensions/franky-vscode/src/core/memory/session-memory-initializer.ts

Cambios arquitectónicos:

Eliminar cliente Qdrant directo de T13

Inyectar SemanticSearchService (de T100) en constructor

Delegar saveSessionTurn() → T100.IndexingService.index()

Delegar retrieveContext() → T100.SemanticSearchService.search()

Tests esperados:

session-memory.test.ts - mockea T100, valida que T13 sigue funcionando

session-memory-integration.test.ts - con T100 real, valida persistencia end-to-end

Tiempo estimado: 1-2 días

Beneficio: desacoplamiento total, permite que otros módulos (review, tests) usen T100 sin pasar por T13.

(... y así para T102, T103, etc.)

4. Estadísticas del Subsistema
4.1 Resumen cuantitativo
Métrica	Valor
Número de tareas	4 (T100, T13, T102, T103)
Tiempo total estimado	8-12 días
Líneas de código estimadas	~3000 LOC
Archivos nuevos	8
Archivos modificados	3
Tests mínimos	12
Cobertura objetivo	85%
Dependencias externas nuevas	tree-sitter, @qdrant/js-client-rest
4.2 Impacto en otros subsistemas
MOD-MEM (Advanced Memory): se beneficia de T100 para memoria episódica y semántica

MOD-TOOLS (Skills): puede usar T100 para "find similar code" skills

MOD-TEST (Testing): puede indexar tests con T100 para regression analysis

4.3 Riesgos y mitigaciones
Riesgo	Probabilidad	Impacto	Mitigación
Tree-sitter parsers incompletos para TS/JSX	Media	Alto	Usar parsers oficiales + fallback a texto plano si falla AST
Embeddings lentos en repos >100K archivos	Media	Medio	Indexado incremental + caché, batch processing
Qdrant down causa fallo total de memoria	Baja	Alto	Healthcheck + fallback a memoria volátil (sin persistencia)
5. Roadmap de Implementación
5.1 Fases
text
gantt
    title MOD-CORE Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Foundation
    SPEC T100           :a1, 2026-02-14, 1d
    SPEC T13 refactor   :a2, after a1, 1d
    section Core (T100)
    Implement T100      :b1, after a2, 3d
    Test T100           :b2, after b1, 2d
    section Facade (T13)
    Refactor T13        :c1, after b2, 1d
    Test T13 integration:c2, after c1, 1d
    section Optimization
    T102 AST Chunker    :d1, after c2, 2d
    section Advanced
    T103 Multi-Expert   :e1, after d1, 3d
5.2 Hitos críticos
Hito 1 (día 2): SPEC T100 + T13 aprobados → commit docs(core): approve T100 and T13 specs

Hito 2 (día 5): T100 MVP funcional con Qdrant → commit feat(T100): implement core semantic engine

Hito 3 (día 7): T13 refactorizado, tests passing → commit feat(T13): refactor as T100 facade

Hito 4 (día 14): T102 + T103 done → tag v0.2.0-core-complete

6. Guías de Implementación para el Architect
6.1 Checklist al crear SPEC de una Txx de este módulo
Cuando el Architect vaya a crear el SPEC de, por ejemplo, T102, debe:

 Leer esta biblia completa (MOD-CORE).

 Revisar la sección 3.3 de T102 aquí (descripción extendida).

 Verificar dependencias: T100 debe estar en estado IMPLEMENTED.

 Copiar las rutas de archivos exactas de esta biblia al SPEC.

 Copiar las interfaces TypeScript relevantes.

 Ajustar tests esperados según esta biblia.

 Referenciar ADRs mencionados aquí.

 Usar el diagrama de componentes (sección 2.1) en el SPEC.

6.2 Plantilla de SPEC pre-rellenada (extracto)
Cuando se cree specs/T102_AST_Chunker_Optimization.md, debe incluir:

text
# T102: AST Chunker Optimization - SPEC

## Metadata
- **Subsistema**: MOD-CORE (Core Engine)
- **Prioridad**: 🟡 MEDIA
- **Dependencias**: T100 (estado: IMPLEMENTED)
- **Tiempo estimado**: 2 días
- **Referencias**: [MOD-CORE Bible](../docs/modules/MOD-CORE_Core_Engine.md)

## Contexto
(Copiar de MOD-CORE > 3.3 > T102)

## Arquitectura
(Link a diagrama de MOD-CORE > 2.1, highlighting T102 component)

## Rutas de archivos
(Copiar de MOD-CORE > 3.3 > T102 > Rutas de archivos)

## Interfaces
(Copiar de MOD-CORE > 3.3 > T102 > Interfaces clave)

## Tests
(Copiar de MOD-CORE > 3.3 > T102 > Tests esperados)

(... resto del SPEC según template estándar)
Con esto, el Architect no empieza de cero; copia contexto, rutas, interfaces de la Biblia.

7. Actualización de esta Biblia
Cuando: después de implementar cada Txx del subsistema.

Quién: Architect (paso 6 del flujo de trabajo).

Qué actualizar:

Estado de Txx en tabla 3.1.

Estadísticas reales en sección 4 (si difieren de estimaciones).

Lecciones aprendidas en nueva subsección "7. Post-Mortem" (si hubo desviaciones importantes del diseño).

FIN DE BIBLIA MOD-CORE (EJEMPLO)

text

---

### 12.4 Proceso de generación de Biblias (Opus 4.6)
Cuando se le suministre el `FRANKY_MASTER_PLAN_3.0.md` completo con todas las Txx, Opus debe:

1. **Identificar subsistemas** (clustering de Txx por tema/volumen).
2. **Por cada subsistema**, generar un archivo `docs/modules/MOD-{ID}_{Nombre}.md` siguiendo la estructura de la sección 12.3.
3. Incluir en cada Biblia:
   - Contexto extendido (3-5 párrafos, no bullet points genéricos).
   - Diagramas Mermaid (componentes + dependencias + Gantt).
   - Tablas de tareas con estadísticas (tiempo, complejidad, beneficio).
   - Rutas de archivos exactas.
   - Interfaces TypeScript literales (no pseudocódigo).
   - Tests esperados con nombres reales.
   - Referencias a ADRs, docs externas, papers.
   - Checklist para el Architect.
   - Plantilla de SPEC pre-rellenada.

4. **Índice maestro**: crear `docs/modules/README.md` con:
   - Tabla de todos los subsistemas.
   - Links a cada biblia.
   - Mapa de dependencias entre subsistemas (Mermaid graph).

### 12.5 Validación de Biblias
Antes de considerarlas finales, el `spec-auditor` debe revisar cada biblia y verificar:

- [ ] Sección 1 (Contexto) es sustancial (>500 palabras), no genérica.
- [ ] Diagramas Mermaid son válidos (syntax check).
- [ ] Todas las Txx mencionadas en tabla 3.1 tienen descripción extendida en 3.3.
- [ ] Rutas de archivos siguen la convención del proyecto (`extensions/franky-vscode/src/...`).
- [ ] Interfaces TypeScript compilan (copiar a un `.ts` temporal y ejecutar `tsc`).
- [ ] Estadísticas en sección 4 son realistas (tiempo estimado x complejidad).
- [ ] Roadmap Gantt (sección 5) es coherente con dependencias.

Si falla alguna validación, Opus debe regenerar esa sección de la biblia.

---

**FIN DE FOUNDATION 3.0**

---

## INSTRUCCIONES PARA OPUS 4.6 PLANNING

Ahora que tienes este documento FRANKY_FOUNDATION_3.0.md completo, tu trabajo es:

1. **Generar la documentación base** (Fase 0):
   - `FRANKY_MASTER_PLAN_3.0.md` (roadmap de volúmenes/Txx, solo alto nivel sin SPECs técnicos)
   - `FRANKY_ENGINEERING_BIBLE_3.0.md` (reglas, estándares, arquitectura general)
   - `AGENTS.md` (reglas para Kilo, esqueleto que ya se te proporcionó antes)
   - `.kilocodemodes` (modos custom: spec-auditor, reviewer, policy-supervisor, project-mentor, refactor-qa, parallel-architect)
   - Templates de SPEC/ADR en `specs/templates/`
   - ADRs macro iniciales (ej. "ADR_001_base_Kilo.md" justificando por qué Franky 3.0 se basa en Kilo y no en Roo)
   - READMEs de infra (qdrant, gpu)
   - Estructura `.kilocode/rules/` con archivos iniciales

2. **Cuando recibas el MASTER PLAN completo** con todas las Txx, generar:
   - **Biblias de subsistemas** siguiendo la estructura de la sección 12.3 (MOD-CORE, MOD-UI, etc.)
   - Índice maestro de subsistemas en `docs/modules/README.md`

3. **NO toques código de extensión** en esta fase. Eso lo hará Kilo después.

4. **Respeta estrictamente**:
   - Solo ES/EN en toda la documentación.
   - 4 proveedores únicamente (OpenRouter, Antigravity proxy, 3060 Ti local, 3090 local).
   - Stack tecnológico moderno de 2026 (pnpm, Biome, Vitest, tsup, etc.).
   - Rutas exactas (`J:\FRANKY3.0`, `J:\QDRANT_DATA`).
   - Flujo de 6 pasos (planificación → arquitectura → implementación → testing → guardado → documentación).

5. **Formato de salida**:
   - Cada documento en Markdown limpio.
   - Diagramas en Mermaid.
   - Tablas bien formateadas.
   - Links relativos entre docs.

6. **Validación final**:
   - Antes de considerar FOUNDATION completada, verifica que todos los archivos listados en la sección 6 (Estructura de carpetas) existan y tengan contenido sustancial (no placeholders vacíos).

**INICIO DEL TRABAJO DE OPUS 4.6 PLANNING - GENERA LA DOCUMENTACIÓN BASE AHORA**
```
