# Research: Extended Task Statuses with Color Coding

**Feature**: 002-add-task-statuses  
**Date**: 2026-05-03  
**Phase**: Phase 0 - Research

---

## Decision 1: ANSI Color Implementation Strategy

**Decision**: Implement a thin, zero-dependency ANSI color utility in `src/shared/ui/colors.ts` using raw escape codes.

**Rationale**: The project has no runtime dependencies (only devDependencies). Adding `chalk` or `kleur` would introduce the first runtime dependency, conflicting with the constitution's Simplicity principle. Raw ANSI escape codes (`[Xm`) are universally supported across macOS and Linux terminals. A 10-line utility achieves 100% of the needed functionality without dependency overhead.

**Alternatives considered**:
- `chalk` v5 (ESM-only, incompatible with the project's `"type": "commonjs"` package.json)
- `chalk` v4 (CJS-compatible but adds an npm dependency for trivial functionality)
- `kleur` (CJS-compatible, minimal — acceptable alternative but still an external dependency)
- Inline color codes directly in `src/index.ts` (rejected: not reusable, harder to test)

**Implementation notes**:
- Check `process.stdout.isTTY` at call time — if `false` (piped output), return plain text
- `NO_COLOR` env var conventionally disables color output (no-color.org standard); support it
- Color codes used: green = `32`, yellow = `33`, red = `31`, reset = `0`

---

## Decision 2: Status Transition Guard Placement

**Decision**: Enforce transition rules in `TaskStore` methods (`cancelTask`, `failTask`) rather than in use-case layer or a separate state machine.

**Rationale**: `TaskStore` is the aggregate root — it owns all mutation rules for the `Task` entity. Adding `cancelTask(id)` and `failTask(id)` methods parallel to the existing `completeTask(id)` pattern keeps the code consistent and the guard logic co-located with the state it protects. A separate state-machine class would be over-engineering for a 4-state model (YAGNI).

**Alternatives considered**:
- State machine class (`TaskStateMachine`) — rejected: overkill for 4 states with a simple graph
- Guard in use-case layer — rejected: business rules belong in the entity, not the use case
- Single `changeStatus(id, newStatus)` method — rejected: less expressive, harder to add per-transition logic later

**Error message pattern** (consistent with existing `completeTask`):
- Task not found: `Task not found with ID: {id}`
- Invalid transition: `Cannot {action} task {id}: task is already {currentStatus}`

---

## Decision 3: New CLI Commands vs. Extending Existing Command

**Decision**: Add two new top-level CLI commands: `cancel <id>` and `fail <id>`, following the exact pattern of the existing `complete <id>` command.

**Rationale**: `cancel` and `fail` are semantically distinct operations. Overloading `complete` with flags (e.g., `complete --status canceled`) would change the public contract of an existing command and require argument parsing complexity. Two new commands are more discoverable and consistent with the project's pattern (one command = one intent).

**Alternatives considered**:
- `complete <id> --as canceled` — rejected: changes existing command contract, adds flag parsing
- `status <id> <new-status>` — rejected: less intuitive, puts burden on user to remember valid statuses
- `update <id> --status canceled` — rejected: introduces a generic update command beyond scope

---

## Decision 4: Color Application Scope in `list` Output

**Decision**: Apply color only to the status text in the list output, not the entire row. Pad with raw string first, then wrap in color codes.

**Rationale**: Applying color to the padded status string (e.g., `colorize('pending     ')`) is simpler than padding after colorization. Since ANSI escape codes are invisible characters, applying `padEnd` to an already-colorized string would produce incorrect column alignment. The correct order is: `colorize(rawStatus.padEnd(12))`.

**Implementation**:
```
`${String(t.id).padEnd(4)}${colorStatus(t.status.padEnd(12))}${t.title}`
```
Where `colorStatus` applies the correct ANSI code for the given status.

---

## Decision 5: Backwards Compatibility of tasks.json

**Decision**: No migration required. The existing `tasks.json` format natively supports new status values as the `status` field is a plain string.

**Rationale**: The `readTasks` function already reads status as a string and stores it in the `Task` interface. Adding `'canceled'` and `'failed'` to the `TaskStatus` union type in TypeScript is a source-only change. Existing `tasks.json` files with `"status": "pending"` or `"status": "done"` continue to load correctly. No version bump to the file format is needed.
