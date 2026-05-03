# Tasks: Extended Task Statuses with Color Coding

**Input**: Design documents from `specs/002-add-task-statuses/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Included — TDD is mandated by the project constitution (Unit Testing First).

**Organization**: Grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no unresolved dependencies
- **[Story]**: User story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Confirm baseline and extend the shared type that all user stories depend on.

- [ ] T001 Verify project compiles cleanly before starting: run `npx tsc --noEmit` from repo root and confirm zero errors
- [ ] T002 Extend `TaskStatus` union in `src/shared/types/task.ts` from `'pending' | 'done'` to `'pending' | 'done' | 'canceled' | 'failed'`; run `npx tsc --noEmit` to confirm type change propagates without errors

**Checkpoint**: Type is extended — all user story work can now begin.

---

## Phase 2: User Story 1 — Cancel a Pending Task (Priority: P1) 🎯 MVP

**Goal**: Users can mark a pending task as canceled via `cancel <id>`; transition guard rejects invalid state changes.

**Independent Test**: Run `node dist/index.js add "Task"` → `node dist/index.js cancel 1` → verify status is `canceled` in `tasks.json` and exit code is `0`. Then run `node dist/index.js cancel 1` again and verify the "already canceled" notice on stdout with exit code `0`. Run `node dist/index.js cancel 999` and verify error on stderr with exit code `1`.

### Tests for User Story 1

> **Write these tests FIRST — confirm they FAIL before implementing.**

- [ ] T003 [P] [US1] Add `describe('cancelTask', ...)` block to `tests/unit/entities/task.test.ts` with 5 tests: (1) pending→canceled succeeds, (2) throws on unknown ID, (3) throws when already done, (4) throws when already canceled, (5) throws when already failed — use exact error messages from `contracts/cli-commands.md` and `quickstart.md §Step 3`
- [ ] T004 [P] [US1] Create `tests/unit/features/cancel-task.test.ts` with 3 tests for `CancelTaskUseCase`: (1) cancels pending task, (2) throws on non-pending task, (3) throws on unknown ID — see `quickstart.md §Step 4` for exact test bodies

### Implementation for User Story 1

- [ ] T005 [P] [US1] Add `cancelTask(id: number): Task` method to `src/entities/task/model.ts` with guard: throw `Task not found with ID: {id}` if not found; throw `Cannot cancel task {id}: task is already {status}` if status is not `'pending'`; set `status = 'canceled'` and return task — run T003 tests and confirm they now pass
- [ ] T006 [P] [US1] Create `src/features/cancel-task/use-case.ts` implementing `CancelTaskUseCase` class with `execute(id: number): Task` that delegates to `store.cancelTask(id)` — run T004 tests and confirm they now pass
- [ ] T007 [US1] Create `src/features/cancel-task/index.ts` exporting `CancelTaskUseCase` from `./use-case`
- [ ] T008 [US1] Update `src/index.ts`: (1) import `CancelTaskUseCase` from `./features/cancel-task`; (2) add `handleCancel()` function mirroring `handleComplete()` pattern — on already-canceled print `ℹ Task {id} is already canceled.` to stdout exit 0; on success print `✓ Task canceled: {id}\nTitle: {title}\n`; on invalid transition print error + hint to stderr exit 1; (3) add `case 'cancel': handleCancel(); break;` to switch; (4) update `USAGE` constant to add `  cancel <id>      Cancel a pending task` line — see `contracts/cli-commands.md` for exact output strings

**Checkpoint**: `cancel` command fully functional. Build, run manual smoke test, confirm `tasks.json` persists `"status": "canceled"`.

---

## Phase 3: User Story 2 — Fail a Pending Task (Priority: P2)

**Goal**: Users can mark a pending task as failed via `fail <id>`; same transition guard as cancel.

**Independent Test**: Run `node dist/index.js add "Task"` → `node dist/index.js fail 1` → verify status is `failed` in `tasks.json` and exit code is `0`. Then run `node dist/index.js fail 1` again and verify the "already failed" notice. Run `node dist/index.js cancel 1` on a failed task and verify error on stderr.

### Tests for User Story 2

> **Write these tests FIRST — confirm they FAIL before implementing.**

- [ ] T009 [P] [US2] Add `describe('failTask', ...)` block to `tests/unit/entities/task.test.ts` with 5 tests mirroring T003 but for `failTask`: (1) pending→failed succeeds, (2) throws on unknown ID, (3) throws when already done, (4) throws when already canceled, (5) throws when already failed — exact error messages use `fail` as the action verb
- [ ] T010 [P] [US2] Create `tests/unit/features/fail-task.test.ts` with 3 tests for `FailTaskUseCase`: (1) fails pending task, (2) throws on non-pending task, (3) throws on unknown ID

### Implementation for User Story 2

- [ ] T011 [P] [US2] Add `failTask(id: number): Task` method to `src/entities/task/model.ts` with identical guard logic as `cancelTask` but action verb `fail` and target status `'failed'` — run T009 tests and confirm they now pass
- [ ] T012 [P] [US2] Create `src/features/fail-task/use-case.ts` implementing `FailTaskUseCase` class delegating to `store.failTask(id)` — run T010 tests and confirm they now pass
- [ ] T013 [US2] Create `src/features/fail-task/index.ts` exporting `FailTaskUseCase` from `./use-case`
- [ ] T014 [US2] Update `src/index.ts`: (1) import `FailTaskUseCase` from `./features/fail-task`; (2) add `handleFail()` mirroring `handleCancel()` — on already-failed print `ℹ Task {id} is already failed.`; on success print `✓ Task marked as failed: {id}\nTitle: {title}\n`; (3) add `case 'fail': handleFail(); break;`; (4) update `USAGE` to add `  fail <id>         Mark a pending task as failed` line

**Checkpoint**: `fail` command fully functional. Both `cancel` and `fail` work independently. Confirm cross-transition guard: `cancel` a failed task returns an error.

---

## Phase 4: User Story 3 — Colorized and Emoji-Prefixed Task List (Priority: P3)

**Goal**: The `list` output displays `{🔵🟢🟡🔴} {status}` with ANSI color in TTY; emoji visible without color in piped output.

**Independent Test**: Run `node dist/index.js list` in a color terminal and verify: pending shows `🔵 pending` in plain, done shows `🟢 done` in green, canceled shows `🟡 canceled` in yellow, failed shows `🔴 failed` in red. Pipe: `node dist/index.js list | cat` — verify emoji appear but no ANSI escape codes in output.

### Tests for User Story 3

> **Write these tests FIRST — confirm they FAIL before implementing.**

- [ ] T015 [P] [US3] Create `tests/unit/shared/status-format.test.ts` with 8 tests covering: (1) pending returns `🔵 pending` plain in any context, (2) done returns `🟢 done` with `[32m` in TTY, (3) canceled returns `🟡 canceled` with `[33m` in TTY, (4) failed returns `🔴 failed` with `[31m` in TTY, (5) done returns `🟢 done` without ANSI in non-TTY, (6) done returns `🟢 done` without ANSI when `NO_COLOR=1` — use `Object.defineProperty(process.stdout, 'isTTY', ...)` to control TTY state; see `quickstart.md §Step 2` for full test bodies

### Implementation for User Story 3

- [ ] T016 [US3] Create `src/shared/ui/status-format.ts`: define `EMOJI` record mapping each `TaskStatus` to its circle (🔵🟢🟡🔴), define `COLOR` partial record mapping done/canceled/failed to ANSI codes 32/33/31, implement `colorize(text, code)` that checks `process.stdout.isTTY && !process.env.NO_COLOR`, implement `formatStatus(status: TaskStatus, paddedLabel: string): string` that prepends emoji and applies ANSI color — run T015 tests and confirm they now pass
- [ ] T017 [US3] Create `src/shared/ui/index.ts` exporting `formatStatus` from `./status-format`
- [ ] T018 [US3] Update `handleList()` in `src/index.ts`: (1) import `formatStatus` from `./shared/ui`; (2) change row construction from `` `${String(t.id).padEnd(4)}${t.status.padEnd(12)}${t.title}` `` to `` `${String(t.id).padEnd(4)}${formatStatus(t.status, t.status.padEnd(10))}${t.title}` `` — the padEnd(10) pads the raw label before emoji prefix to preserve column alignment

**Checkpoint**: `list` shows colored emoji-prefixed status. All three user stories fully functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Integration coverage and final quality gates.

- [ ] T019 [P] Update `tests/integration/cli-flow.test.ts` to add: (1) cancel command success scenario, (2) fail command success scenario, (3) invalid transition error scenario (cancel a done task), (4) list output contains emoji characters for all four statuses
- [ ] T020 [P] Run `npx tsc --noEmit` and confirm zero TypeScript errors across all new and modified files
- [ ] T021 Run `npm run test:coverage` and confirm: all tests pass, coverage ≥70% across branches/functions/lines/statements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 (T002 must complete first)
- **Phase 3 (US2)**: Depends on Phase 1; can start after T002; Phase 2 not required but recommended to complete first to avoid model.ts conflicts
- **Phase 4 (US3)**: Depends on Phase 1 (type); independent of US1/US2 implementation (different files except src/index.ts)
- **Phase 5 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Requires T002 only — no dependency on US2/US3
- **US2 (P2)**: Requires T002 — no dependency on US1/US3 (same files modified sequentially)
- **US3 (P3)**: Requires T002 — fully independent of US1 and US2 (different files except final src/index.ts touch in T018)

### Within Each User Story (TDD Order)

1. Write tests → confirm they FAIL
2. Implement entity method (model.ts)
3. Implement use case (new file)
4. Create index export
5. Wire CLI handler in src/index.ts

### Parallel Opportunities

- T003 + T004 (US1 test files): different files → run in parallel
- T005 + T006 (US1 implementations): different files → run in parallel after T003/T004
- T009 + T010 (US2 test files): different files → run in parallel
- T011 + T012 (US2 implementations): different files → run in parallel after T009/T010
- T019 + T020 (integration test + type check): independent → run in parallel

---

## Parallel Example: User Story 1

```bash
# Step 1 — Write tests in parallel (different files):
Task T003: "Add cancelTask tests to tests/unit/entities/task.test.ts"
Task T004: "Create tests/unit/features/cancel-task.test.ts"

# Step 2 — After tests written and confirmed failing, implement in parallel:
Task T005: "Add cancelTask() to src/entities/task/model.ts"
Task T006: "Create src/features/cancel-task/use-case.ts"

# Step 3 — Sequential wiring:
Task T007: "Create src/features/cancel-task/index.ts"
Task T008: "Update src/index.ts with handleCancel() and cancel case"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001–T002)
2. Complete Phase 2 / US1 (T003–T008)
3. **Stop and validate**: `cancel` command works end-to-end, `tasks.json` persists correctly
4. Demo: add task → cancel it → list shows canceled status

### Incremental Delivery

1. Phase 1 + US1 → `cancel` command ships (MVP)
2. Add US2 → `fail` command ships
3. Add US3 → colored emoji list ships
4. Polish → integration coverage and quality gates

### Single Developer Order

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021

---

## Notes

- All tasks touch a single file or create a new file — no cross-task file conflicts within a phase
- `src/index.ts` is touched by T008 (US1), T014 (US2), and T018 (US3) — these are sequential across phases
- `src/entities/task/model.ts` is touched by T005 (US1) and T011 (US2) — complete Phase 2 before starting Phase 3 to avoid conflicts
- `tests/unit/entities/task.test.ts` is touched by T003 (US1) and T009 (US2) — complete Phase 2 before starting Phase 3
- Emoji circles (🔵🟢🟡🔴) are Unicode, not ANSI — they appear in all output including piped
- See `quickstart.md` for exact code snippets for each implementation task
