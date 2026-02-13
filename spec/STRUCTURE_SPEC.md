# Franky 3.0 — Structure Specification (FASE 0)

**Fecha:** 2026-02-13
**Estado:** FASE 0 COMPLETA
**Base:** CoStrict fork (`odc1977/Franky3.0`)

---

## Directory Tree

```
J:\FRANKY3.0\
├── FOUNDATION.md                          # Documento fundacional (copiado a raíz)
├── STRUCTURE_SPEC.md                      # Este documento
│
├── src/
│   ├── extension.ts                       # [MODIFIED] Entry point — Franky logger added
│   │
│   ├── franky/                            # ★ NUEVO — Namespace de Franky 3.0
│   │   ├── types/
│   │   │   └── index.ts                   # Base types (FrankyAgent, FrankyConfig, etc.)
│   │   ├── utils/
│   │   │   └── logger.ts                  # Franky OutputChannel logger (singleton)
│   │   ├── orchestrator/                  # [EMPTY] Para FASE 1: T13 Orchestrator
│   │   └── agents/
│   │       ├── frontend/                  # [EMPTY] Frontend agent
│   │       ├── backend/                   # [EMPTY] Backend agent
│   │       ├── testing/                   # [EMPTY] Testing agent
│   │       ├── docs/                      # [EMPTY] Documentation agent
│   │       ├── orchestrator/              # [EMPTY] Orchestrator agent
│   │       └── security/                  # [EMPTY] Security agent
│   │
│   └── __tests__/
│       ├── unit/franky/                   # [EMPTY] Unit tests para Franky
│       └── e2e/franky/                    # [EMPTY] E2E tests para Franky
│
└── webview-ui/src/franky/                 # ★ NUEVO — UI de Franky
    ├── components/                        # [EMPTY] Componentes UI
    └── i18n/
        ├── en.json                        # Strings EN minimal
        └── es.json                        # Strings ES minimal
```

---

## Files Created

| File                                 | Description                                                                                                                                  | LOC  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `src/franky/types/index.ts`          | Base TypeScript types: `FrankyLocale`, `FrankyLogLevel`, `FrankyAgentType`, `FrankyAgent`, `FrankyConfig`, `TaskId`, `TaskStatus`, constants | 49   |
| `src/franky/utils/logger.ts`         | Singleton VSCode OutputChannel logger with levels (debug/info/warn/error/fatal), timestamps, and proper dispose                              | 113  |
| `webview-ui/src/franky/i18n/en.json` | English i18n strings (app name, status messages, agent names)                                                                                | 17   |
| `webview-ui/src/franky/i18n/es.json` | Spanish i18n strings (same structure as EN)                                                                                                  | 17   |
| `FOUNDATION.md`                      | Complete foundation document (1016 lines) copied to repo root                                                                                | 1016 |
| `STRUCTURE_SPEC.md`                  | This document                                                                                                                                | —    |

---

## Configuration Changes

### `src/extension.ts` — 3 Surgical Additions

1. **Import** (line 60-61): Added `getFrankyLogger` and `disposeFrankyLogger` from `./franky/utils/logger`
2. **activate()** (lines 134-139): Initialize Franky logger, log version info, show channel
3. **deactivate()** (lines 477-478): Clean up Franky logger

**ZERO CoStrict code was modified or removed.** All changes are pure additions.

---

## Build Verification

```
pnpm build

Tasks:    6 successful, 6 total
Cached:   5 cached, 6 total
Time:     59.741s
Exit code: 0
```

✅ **Build PASSED** — TypeScript compiles without errors, all packages build successfully.

---

## F5 Verification

- Extension Host should launch when pressing F5 in VSCode
- Output panel will show **"Franky 3.0"** channel
- Log messages visible:
    - `[timestamp] [INFO ] Franky 3.0 initializing...`
    - `[timestamp] [INFO ] Version: 3.0.0-alpha.0 | Environment: development`
- CoStrict sidebar and all commands remain functional

---

## Next Steps — FASE 1

1. **T13 Orchestrator** — Implement Router, TaskManager, StateManager, Validator in `src/franky/orchestrator/`
2. **Agent Framework** — Base agent class and registration system in `src/franky/agents/`
3. **Tests** — Unit tests for logger, types, and orchestrator in `src/__tests__/unit/franky/`
4. **Webview Integration** — Franky UI components in `webview-ui/src/franky/components/`
