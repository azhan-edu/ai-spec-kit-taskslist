# Implementation Plan: Extended Task Statuses with Color Coding

**Branch**: `002-add-task-statuses` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/002-add-task-statuses/spec.md`

## Summary

Add two new terminal task statuses (`canceled`, `failed`) that can only be set from `pending`, and apply ANSI color coding to the `list` command output (pending: plain, done: green, canceled: yellow, failed: red). Implemented via two new FSD features (`cancel-task`, `fail-task`), a new shared UI color utility, and minimal changes to the existing entity and CLI entry point. No new runtime dependencies.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)  
**Primary Dependencies**: Node.js 18+ built-ins only (no new runtime deps)  
**Storage**: Local `tasks.json` (no format change required)  
**Testing**: Jest 30 + ts-jest (TDD approach)  
**Target Platform**: macOS/Linux terminal (ANSI escape codes; graceful fallback for non-TTY)  
**Project Type**: Console CLI application  
**Performance Goals**: Single-shot CLI invocation; I/O performance unchanged  
**Constraints**: No new runtime dependencies; backwards-compatible with existing `tasks.json`  
**Scale/Scope**: Extends existing 3-command CLI with 2 new commands and color output

## Constitution Check

- **TypeScript Mandatory**: ✅ All new and modified files are `.ts`; strict mode enforced
- **Unit Testing First**: ✅ TDD — tests written before each implementation step
- **Feature-Sliced Design**: ✅ New features in `src/features/cancel-task/` and `src/features/fail-task/`; color utility in `src/shared/ui/`
- **Console Interface**: ✅ Two new CLI commands added; no GUI or web interface
- **Simplicity**: ✅ No new dependencies; ~80 lines of new source code; YAGNI — no generic state machine

*All constitution gates pass. No violations to justify.*

## Project Structure

### Documentation (this feature)

```text
specs/002-add-task-statuses/
├── plan.md              ← this file
├── spec.md              ← feature specification
├── research.md          ← Phase 0 research decisions
├── data-model.md        ← Phase 1 data model
├── quickstart.md        ← Phase 1 developer guide
├── contracts/
│   └── cli-commands.md  ← Phase 1 CLI contracts
├── checklists/
│   └── requirements.md  ← specification quality checklist
└── tasks.md             ← Phase 2 output (created by /speckit-tasks)
```

### Source Code Changes

```text
src/
├── entities/task/
│   ├── model.ts          ← MODIFY: add cancelTask(), failTask(), transition guard
│   └── index.ts          (unchanged)
├── features/
│   ├── add-task/         (unchanged)
│   ├── complete-task/    (unchanged)
│   ├── list-tasks/       (unchanged)
│   ├── cancel-task/      ← NEW
│   │   ├── use-case.ts
│   │   └── index.ts
│   └── fail-task/        ← NEW
│       ├── use-case.ts
│       └── index.ts
├── shared/
│   ├── lib/              (unchanged)
│   ├── types/
│   │   └── task.ts       ← MODIFY: extend TaskStatus union
│   └── ui/               ← NEW
│       ├── colors.ts
│       └── index.ts
└── index.ts              ← MODIFY: add cancel/fail handlers; colorize list output

tests/
├── unit/
│   ├── entities/
│   │   └── task.test.ts           ← MODIFY: add cancelTask/failTask/guard tests
│   ├── features/
│   │   ├── add-task.test.ts       (unchanged)
│   │   ├── complete-task.test.ts  (unchanged)
│   │   ├── list-tasks.test.ts     (unchanged)
│   │   ├── cancel-task.test.ts    ← NEW
│   │   └── fail-task.test.ts      ← NEW
│   └── shared/
│       ├── storage.test.ts        (unchanged)
│       └── colors.test.ts         ← NEW
└── integration/
    └── cli-flow.test.ts           ← MODIFY: add cancel/fail command scenarios
```

**Structure Decision**: Single-project layout (Option 1) — existing structure extended. No new top-level directories needed beyond `src/shared/ui/`.

## Complexity Tracking

*No constitution violations — this section is left empty per instructions.*
