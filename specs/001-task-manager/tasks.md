# Tasks: Task Manager

**Input**: Design documents from `/specs/001-task-manager/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli-commands.md, research.md

**Tests**: Included — constitution mandates TDD (Unit Testing First principle). Write each test task first, confirm it fails, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Single project layout per plan.md: `src/` and `tests/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and FSD directory structure

- [ ] T001 Create FSD directory structure: `src/shared/types/`, `src/shared/lib/`, `src/entities/task/`, `src/features/add-task/`, `src/features/list-tasks/`, `src/features/complete-task/`, `tests/unit/shared/`, `tests/unit/entities/`, `tests/unit/features/`, `tests/integration/`
- [ ] T002 Initialize `package.json` with `npm init -y`; install devDependencies: `typescript@5`, `@types/node`, `jest`, `@types/jest`, `ts-jest`
- [ ] T003 [P] Create `tsconfig.json` — strict mode, target ES2020, module commonjs, outDir `./dist`, rootDir `./src`, resolveJsonModule true, sourceMap true
- [ ] T004 [P] Create `jest.config.js` — preset ts-jest, testEnvironment node, roots `['<rootDir>/tests', '<rootDir>/src']`, testMatch `['**/*.test.ts']`, coverageThreshold 70% branches/functions/lines/statements
- [ ] T005 Add `build`, `test`, `test:coverage`, `start` scripts to `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, storage utility, and Task entity that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [P] Define `Task`, `TaskStatus` (`'pending' | 'done'`), and `TasksFile` (`{ version: string; tasks: Task[] }`) types in `src/shared/types/task.ts`
- [ ] T007 Write failing unit tests for storage utility (readTasks returns `[]` when file missing, returns tasks array when file exists, writeTasks creates/updates file) in `tests/unit/shared/storage.test.ts`
- [ ] T008 Implement `readTasks(filePath: string): Task[]` and `writeTasks(filePath: string, tasks: Task[]): void` in `src/shared/lib/storage.ts` — handle missing file (return `[]`), handle corrupt JSON (return `[]`), use synchronous fs API; run T007 until green
- [ ] T009 Write failing unit tests for `TaskStore` (addTask creates pending task with sequential ID, getTasks returns all tasks ordered by id, completeTask changes status to done, completeTask throws on unknown id, getTaskById returns task or undefined) in `tests/unit/entities/task.test.ts`
- [ ] T010 Implement `TaskStore` class with `addTask(title)`, `getTasks()`, `completeTask(id)`, `getTaskById(id)`, and `nextId()` (max id + 1, or 1 if empty) in `src/entities/task/model.ts`; re-export from `src/entities/task/index.ts`; run T009 until green

**Checkpoint**: Foundation ready — all user stories can now be implemented

---

## Phase 3: User Story 1 — Add Task (Priority: P1) 🎯 MVP

**Goal**: User can run `node dist/index.js add "Buy groceries"` and the task is saved to `tasks.json`

**Independent Test**: Run `add "Buy groceries"` → exit 0, stdout shows `✓ Task added: 1 / Title: Buy groceries / Status: pending`; run `add ""` → exit 1, stderr shows `Error: Task title cannot be empty`

### Tests

- [ ] T011 [US1] Write failing unit tests for `AddTaskUseCase` (valid title creates pending task with trimmed text, empty/whitespace title throws validation error) in `tests/unit/features/add-task.test.ts`

### Implementation

- [ ] T012 [US1] Implement `AddTaskUseCase.execute(title: string): Task` — trim title, validate non-empty, delegate to `TaskStore.addTask`; export from `src/features/add-task/index.ts`; run T011 until green in `src/features/add-task/use-case.ts`
- [ ] T013 [US1] Create `src/index.ts` — parse `process.argv` for `add <title>` command; load tasks via `readTasks`, build `TaskStore`, call `AddTaskUseCase`, save via `writeTasks`; on success print `✓ Task added: {id}\nTitle: {title}\nStatus: pending` to stdout, exit 0; on validation error print to stderr, exit 1; on fs error print to stderr, exit 2

**Checkpoint**: `npm run build && node dist/index.js add "Buy groceries"` works end-to-end

---

## Phase 4: User Story 2 — List Tasks (Priority: P2)

**Goal**: User can run `node dist/index.js list` and see all tasks formatted as a table

**Independent Test**: After adding tasks, `list` shows all with correct ID/status/title; on empty store prints `No tasks found.`

### Tests

- [ ] T014 [US2] Write failing unit tests for `ListTasksUseCase` (returns empty array when no tasks, returns all tasks in id-ascending order) in `tests/unit/features/list-tasks.test.ts`

### Implementation

- [ ] T015 [US2] Implement `ListTasksUseCase.execute(): Task[]` — delegate to `TaskStore.getTasks()`; export from `src/features/list-tasks/index.ts`; run T014 until green in `src/features/list-tasks/use-case.ts`
- [ ] T016 [US2] Add `list` command handler to `src/index.ts` — load tasks, call `ListTasksUseCase`; if empty print `No tasks found.`; otherwise print table with header `ID  Status      Title` and one row per task (ID right-padded 4, Status left-padded 10, Title full); exit 0

**Checkpoint**: `node dist/index.js list` shows correct table or empty message

---

## Phase 5: User Story 3 — Complete Task (Priority: P3)

**Goal**: User can run `node dist/index.js complete 1` to mark a task done by its integer ID

**Independent Test**: After adding a task, `complete 1` changes status to done (visible on `list`); `complete 999` exits 1 with error to stderr

### Tests

- [ ] T017 [US3] Write failing unit tests for `CompleteTaskUseCase` (marks pending task as done, throws on non-existent id) in `tests/unit/features/complete-task.test.ts`

### Implementation

- [ ] T018 [US3] Implement `CompleteTaskUseCase.execute(id: number): Task` — call `TaskStore.completeTask(id)`, save updated store; export from `src/features/complete-task/index.ts`; run T017 until green in `src/features/complete-task/use-case.ts`
- [ ] T019 [US3] Add `complete <id>` command handler to `src/index.ts` — parse id as integer (reject non-integer: stderr + exit 1), load tasks, call `CompleteTaskUseCase`, save via `writeTasks`; on success print `✓ Task completed: {id}\nTitle: {title}` to stdout, exit 0; on not-found print `Error: Task not found with ID: {id}` to stderr, exit 1

**Checkpoint**: All three commands (add, list, complete) work independently and together

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration testing, coverage gate, type check, and end-to-end contract validation

- [ ] T020 Write integration test covering the full add → list → complete flow using a temp `tasks.json` file (create in `beforeEach`, delete in `afterEach`) in `tests/integration/cli-flow.test.ts`
- [ ] T021 [P] Run `npm run test:coverage`; confirm ≥ 70% branches, functions, lines, and statements across all source files; fix gaps if below threshold
- [ ] T022 [P] Run `npx tsc --noEmit`; resolve any TypeScript strict mode errors in `src/`
- [ ] T023 Run `npm run build`; manually validate all example interactions from `specs/001-task-manager/contracts/cli-commands.md` produce the documented output and exit codes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **blocks all user stories**
- **US1 (Phase 3)**: Requires Phase 2 — no dependency on US2/US3
- **US2 (Phase 4)**: Requires Phase 2 — no dependency on US1/US3 (list works even without prior adds)
- **US3 (Phase 5)**: Requires Phase 2 — no dependency on US1/US2 (use case is independently testable)
- **Polish (Phase 6)**: Requires all desired user stories complete

### User Story Dependencies

- **US1 (Add Task)**: Independent after Phase 2
- **US2 (List Tasks)**: Independent after Phase 2
- **US3 (Complete Task)**: Independent after Phase 2 (unit-testable); end-to-end needs US1 to add tasks first

### Within Each User Story

1. Write test → confirm it **fails**
2. Implement until test passes
3. Wire into CLI entry point (`src/index.ts`)
4. Manual smoke test before moving to next story

### Parallel Opportunities

- T003 and T004 (config files) can run in parallel
- T006 (types) and T007+T008 (storage tests + impl) can be worked independently
- T011, T014, T017 (tests per story) can run in parallel once Phase 2 is done
- T021 and T022 (coverage + type check) can run in parallel in Phase 6

---

## Parallel Example: Foundational Phase

```
# Can start in parallel after T005:
Task T006: Define types in src/shared/types/task.ts
Task T007: Write storage tests in tests/unit/shared/storage.test.ts

# T008 depends on T007:
Task T008: Implement storage in src/shared/lib/storage.ts
```

## Parallel Example: User Story Phases (after Phase 2 complete)

```
# Can start in parallel after T010:
Task T011: AddTask tests    → T012: AddTask impl    → T013: CLI add command
Task T014: ListTasks tests  → T015: ListTasks impl  → T016: CLI list command
Task T017: CompleteTask tests → T018: CompleteTask impl → T019: CLI complete command
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**blocks all stories**)
3. Complete Phase 3: User Story 1 (Add Task)
4. **STOP and VALIDATE**: `node dist/index.js add "test"` works, T011/T012 green
5. Demo / ship MVP

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (US1) → Add Task works → MVP
3. Phase 4 (US2) → List Tasks works
4. Phase 5 (US3) → Complete Task works
5. Phase 6 → Polish, coverage, contract validation

---

## Notes

- [P] tasks target different files with no shared dependencies
- TDD cycle enforced by constitution: write test → fail → implement → pass
- Tasks.json location: same directory as the running process (app root)
- `src/index.ts` is extended incrementally across US1 → US2 → US3 — take care not to break prior commands when adding new ones
- Sequential integer IDs: never reuse deleted IDs; next = max(existing) + 1
