# Research: Extended Task Statuses with Color Coding

**Feature**: 002-add-task-statuses  
**Date**: 2026-05-03  
**Phase**: Phase 0 - Research

---

## Decision 1: ANSI Color Implementation Strategy

**Decision**: Implement a thin, zero-dependency formatting utility in `src/shared/ui/status-format.ts` using raw ANSI escape codes.

**Rationale**: The project has no runtime dependencies (only devDependencies). Adding `chalk` or `kleur` would introduce the first runtime dependency, conflicting with the constitution's Simplicity principle. Raw ANSI escape codes (`[Xm`) are universally supported across macOS and Linux terminals. A ~20-line utility achieves 100% of the needed functionality without dependency overhead.

**Alternatives considered**:
- `chalk` v5 (ESM-only, incompatible with the project's `"type": "commonjs"` package.json)
- `chalk` v4 (CJS-compatible but adds an npm dependency for trivial functionality)
- `kleur` (CJS-compatible, minimal — acceptable alternative but still an external dependency)
- Inline color codes directly in `src/index.ts` (rejected: not reusable, harder to test)

**Implementation notes**:
- Check `process.stdout.isTTY` at call time — if `false` (piped output), skip ANSI codes
- `NO_COLOR` env var conventionally disables color output (no-color.org standard); support it
- Color codes used: green = `32`, yellow = `33`, red = `31`, reset = `0`
- Emoji circles are Unicode and do NOT require TTY — they render in all contexts including piped output

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

**Rationale**: `cancel` and `fail` are semantically distinct operations. Overloading `complete` with flags would change the public contract of an existing command and require argument parsing complexity. Two new commands are more discoverable and consistent with the project's pattern (one command = one intent).

**Alternatives considered**:
- `complete <id> --as canceled` — rejected: changes existing command contract, adds flag parsing
- `status <id> <new-status>` — rejected: less intuitive, puts burden on user to remember valid statuses
- `update <id> --status canceled` — rejected: introduces a generic update command beyond scope

---

## Decision 4: Emoji + Color Relationship

**Decision**: Emoji circles appear alongside ANSI color (not replacing it). Format: `{emoji} {rawStatus}` with the entire string wrapped in ANSI color codes.

**Rationale**: User explicitly confirmed emojis are additive — they sit alongside the existing color layer. This preserves all previously spec'd color requirements (FR-007 to FR-010) while adding the emoji dimension. The combined format (`🟢 done` in green) provides redundant visual cues useful for accessibility (color-blind users still see the distinct emoji circles).

**Alternatives considered**:
- Emoji only, no ANSI color — rejected: user chose to keep both
- Emoji only in non-TTY fallback — rejected: emojis are Unicode and always available regardless of TTY

---

## Decision 5: Emoji Set and Placement

**Decision**: Use colored circle emoji (🔵🟢🟡🔴) as a prefix before the status label, separated by a space.

**Rationale**: User selected Option B (colored circles) over text-style emoji and Option A (prefix placement). Colored circles semantically reinforce the ANSI color coding (green circle = green text, yellow circle = yellow text, etc.), creating a doubly-reinforced visual signal. Prefix placement follows left-to-right scan convention.

**Emoji mapping**:
- `pending` → 🔵 (blue circle)
- `done` → 🟢 (green circle)
- `canceled` → 🟡 (yellow circle)
- `failed` → 🔴 (red circle)

**Display format**: `{emoji} {rawStatus}` e.g. `🟢 done`, `🔴 failed`

---

## Decision 6: Column Alignment with Emoji Width

**Decision**: Apply `padEnd` to the raw status string before prepending the emoji, keeping padding calculations based on ASCII length only.

**Rationale**: Emoji circles are typically 2 display columns wide in terminals. If padding is applied after prepending the emoji, JavaScript's `String.padEnd` counts the emoji as 2 code points (via surrogate pairs or single code point) but terminal display width differs. Padding the raw status text first, then prepending the emoji avoids misalignment.

**Implementation**:
```
`${String(t.id).padEnd(4)}${formatStatus(t.status, t.status.padEnd(10))}${t.title}`
```
Where `formatStatus(status, paddedLabel)` prepends the emoji to the already-padded label and wraps in ANSI color.

**Alternatives considered**:
- Pad after emoji prepend — rejected: ANSI codes and emoji byte length cause `padEnd` to miscalculate display width
- Fixed total column width with explicit spaces — acceptable but more fragile

---

## Decision 7: Backwards Compatibility of tasks.json

**Decision**: No migration required. The existing `tasks.json` format natively supports new status values as the `status` field is a plain string.

**Rationale**: The `readTasks` function already reads status as a string. Adding `'canceled'` and `'failed'` to the `TaskStatus` union is a source-only change. Existing files continue to load correctly with no version bump needed.
