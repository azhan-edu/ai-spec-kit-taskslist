# Implementation Plan: Task Manager

**Branch**: `001-task-manager` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-task-manager/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A TypeScript 5.x CLI application for personal task management, supporting add, list, and complete commands with local JSON-file persistence. Architecture follows Feature-Sliced Design with shared utilities, a task entity, three feature use cases, and a CLI entry point.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+  
**Primary Dependencies**: ts-jest, jest, @types/node, @types/jest (no external CLI parsing library — process.argv parsing for 3 simple commands)  
**Storage**: Local `tasks.json` flat file in app directory  
**Testing**: Jest + ts-jest, TDD cycle enforced  
**Target Platform**: Node.js CLI, cross-platform (macOS/Linux/Windows)  
**Project Type**: CLI application  
**Performance Goals**: All task operations complete in < 5 seconds (SC-001)  
**Constraints**: Single-user, no concurrent access, tasks.json co-located with app  
**Scale/Scope**: Personal task manager; expected <10k tasks, ~100KB max file size

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **TypeScript Mandatory** | ✅ PASS | TypeScript 5.x strict mode; no plain JS |
| **Unit Testing First** | ✅ PASS | Jest + ts-jest; TDD cycle; 70% coverage threshold |
| **Feature-Sliced Design** | ✅ PASS | Layers: shared/, entities/, features/, CLI entry |
| **Console Interface** | ✅ PASS | process.argv CLI; stdout for output, stderr for errors |
| **Simplicity** | ✅ PASS | No external CLI library; sync I/O; minimal deps; YAGNI |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-manager/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── cli-commands.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Single-project layout following Feature-Sliced Design:

```text
src/
├── shared/
│   ├── types/
│   │   └── task.ts          # Shared Task and TaskStatus types
│   └── lib/
│       └── storage.ts       # JSON file read/write utilities
├── entities/
│   └── task/
│       ├── model.ts         # Task entity, validation rules
│       └── index.ts
├── features/
│   ├── add-task/
│   │   ├── use-case.ts      # AddTask use case
│   │   └── index.ts
│   ├── list-tasks/
│   │   ├── use-case.ts      # ListTasks use case
│   │   └── index.ts
│   └── complete-task/
│       ├── use-case.ts      # CompleteTask use case
│       └── index.ts
└── index.ts                 # CLI entry point (process.argv dispatch)

tests/
├── unit/
│   ├── entities/
│   │   └── task.test.ts
│   ├── features/
│   │   ├── add-task.test.ts
│   │   ├── list-tasks.test.ts
│   │   └── complete-task.test.ts
│   └── shared/
│       └── storage.test.ts
├── integration/
│   └── cli-flow.test.ts
└── mocks/
    └── storage.mock.ts
```

**Structure Decision**: Single project (Option 1). CLI apps do not benefit from a frontend/backend split. FSD layers map directly: `shared/` → utilities and types; `entities/` → Task model; `features/` → one directory per user story; `index.ts` → CLI dispatcher.

## Complexity Tracking

> **No violations** — Constitution Check passes on all five principles.
