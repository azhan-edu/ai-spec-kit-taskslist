# Quickstart: Extended Task Statuses Development

**Feature**: 002-add-task-statuses  
**Date**: 2026-05-03  
**Phase**: Phase 1 - Developer Guide  
**Prerequisite**: [001-task-manager/quickstart.md](../001-task-manager/quickstart.md) — the project is already set up

---

## Overview

This guide covers implementing the two new task statuses (`canceled`, `failed`), status color coding in the `list` output, and the `cancel`/`fail` CLI commands. No new dependencies are required.

---

## What's Changing

| Area | Change |
|------|--------|
| `src/shared/types/task.ts` | Extend `TaskStatus` union |
| `src/shared/ui/` | **New**: ANSI color utility |
| `src/entities/task/model.ts` | Add `cancelTask()`, `failTask()`, transition guard |
| `src/features/cancel-task/` | **New**: cancel use case |
| `src/features/fail-task/` | **New**: fail use case |
| `src/index.ts` | Add `cancel`/`fail` handlers; colorize `list` status column |
| `tests/unit/entities/task.test.ts` | Add transition guard tests |
| `tests/unit/features/cancel-task.test.ts` | **New** |
| `tests/unit/features/fail-task.test.ts` | **New** |
| `tests/unit/shared/colors.test.ts` | **New** |

---

## TDD Workflow

Follow TDD order: write a failing test → implement → pass.

### Step 1: Extend TaskStatus Type

**File**: `src/shared/types/task.ts`

```typescript
export type TaskStatus = 'pending' | 'done' | 'canceled' | 'failed';
```

No test needed — this is a type-only change. Run `npx tsc --noEmit` to verify.

---

### Step 2: Color Utility (TDD)

**Test first**: `tests/unit/shared/colors.test.ts`

```typescript
import { colorStatus } from '../../../src/shared/ui/colors';

describe('colorStatus', () => {
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
    delete process.env.NO_COLOR;
  });

  it('returns plain text for pending in any context', () => {
    expect(colorStatus('pending')).toBe('pending');
  });

  describe('in TTY context', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    });

    it('wraps done in green', () => {
      expect(colorStatus('done')).toContain('[32m');
      expect(colorStatus('done')).toContain('[0m');
    });

    it('wraps canceled in yellow', () => {
      expect(colorStatus('canceled')).toContain('[33m');
    });

    it('wraps failed in red', () => {
      expect(colorStatus('failed')).toContain('[31m');
    });
  });

  describe('in non-TTY context', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
    });

    it('returns plain text for done', () => {
      expect(colorStatus('done')).toBe('done');
    });
  });

  describe('with NO_COLOR env var', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
      process.env.NO_COLOR = '1';
    });

    it('returns plain text for done', () => {
      expect(colorStatus('done')).toBe('done');
    });
  });
});
```

**Implement**: `src/shared/ui/colors.ts`

```typescript
import { TaskStatus } from '../types/task';

const ESC = '';
const RESET = `${ESC}[0m`;

function colorize(text: string, code: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return text;
  return `${ESC}[${code}m${text}${RESET}`;
}

export function colorStatus(status: TaskStatus | string): string {
  switch (status) {
    case 'done':     return colorize(status as string, '32');
    case 'canceled': return colorize(status as string, '33');
    case 'failed':   return colorize(status as string, '31');
    default:         return status as string;
  }
}
```

**Export**: `src/shared/ui/index.ts`

```typescript
export { colorStatus } from './colors';
```

---

### Step 3: Extend TaskStore (TDD)

**Test additions** in `tests/unit/entities/task.test.ts`:

```typescript
describe('cancelTask', () => {
  it('changes status to canceled for a pending task', () => {
    const task = store.addTask('Do something');
    store.cancelTask(task.id);
    expect(store.getTaskById(task.id)?.status).toBe('canceled');
  });

  it('throws when task id does not exist', () => {
    expect(() => store.cancelTask(999)).toThrow('Task not found with ID: 999');
  });

  it('throws when task is already done', () => {
    const task = store.addTask('Done task');
    store.completeTask(task.id);
    expect(() => store.cancelTask(task.id)).toThrow(`Cannot cancel task ${task.id}: task is already done`);
  });

  it('throws when task is already canceled', () => {
    const task = store.addTask('Canceled task');
    store.cancelTask(task.id);
    expect(() => store.cancelTask(task.id)).toThrow(`Cannot cancel task ${task.id}: task is already canceled`);
  });

  it('throws when task is already failed', () => {
    const task = store.addTask('Failed task');
    store.failTask(task.id);
    expect(() => store.cancelTask(task.id)).toThrow(`Cannot cancel task ${task.id}: task is already failed`);
  });
});

describe('failTask', () => {
  it('changes status to failed for a pending task', () => {
    const task = store.addTask('Do something');
    store.failTask(task.id);
    expect(store.getTaskById(task.id)?.status).toBe('failed');
  });

  it('throws when task id does not exist', () => {
    expect(() => store.failTask(999)).toThrow('Task not found with ID: 999');
  });

  it('throws when task is already done', () => {
    const task = store.addTask('Done task');
    store.completeTask(task.id);
    expect(() => store.failTask(task.id)).toThrow(`Cannot fail task ${task.id}: task is already done`);
  });

  it('throws when task is already canceled', () => {
    const task = store.addTask('Canceled task');
    store.cancelTask(task.id);
    expect(() => store.failTask(task.id)).toThrow(`Cannot fail task ${task.id}: task is already canceled`);
  });

  it('throws when task is already failed', () => {
    const task = store.addTask('Failed task');
    store.failTask(task.id);
    expect(() => store.failTask(task.id)).toThrow(`Cannot fail task ${task.id}: task is already failed`);
  });
});
```

**Implement** in `src/entities/task/model.ts` — add two methods:

```typescript
cancelTask(id: number): Task {
  const task = this.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task not found with ID: ${id}`);
  if (task.status !== 'pending') throw new Error(`Cannot cancel task ${id}: task is already ${task.status}`);
  task.status = 'canceled';
  return task;
}

failTask(id: number): Task {
  const task = this.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task not found with ID: ${id}`);
  if (task.status !== 'pending') throw new Error(`Cannot fail task ${id}: task is already ${task.status}`);
  task.status = 'failed';
  return task;
}
```

---

### Step 4: New Use Cases (TDD)

**CancelTaskUseCase** — `tests/unit/features/cancel-task.test.ts`:

```typescript
import { CancelTaskUseCase } from '../../../src/features/cancel-task';
import { TaskStore } from '../../../src/entities/task';

describe('CancelTaskUseCase', () => {
  it('cancels a pending task', () => {
    const store = new TaskStore([{ id: 1, title: 'Task', status: 'pending' }]);
    const task = new CancelTaskUseCase(store).execute(1);
    expect(task.status).toBe('canceled');
  });

  it('throws when task is not pending', () => {
    const store = new TaskStore([{ id: 1, title: 'Task', status: 'done' }]);
    expect(() => new CancelTaskUseCase(store).execute(1)).toThrow();
  });

  it('throws when task id does not exist', () => {
    const store = new TaskStore([]);
    expect(() => new CancelTaskUseCase(store).execute(999)).toThrow('Task not found with ID: 999');
  });
});
```

**Implement**: `src/features/cancel-task/use-case.ts`

```typescript
import { Task } from '../../shared/types/task';
import { TaskStore } from '../../entities/task';

export class CancelTaskUseCase {
  constructor(private store: TaskStore) {}

  execute(id: number): Task {
    return this.store.cancelTask(id);
  }
}
```

`src/features/cancel-task/index.ts`:

```typescript
export { CancelTaskUseCase } from './use-case';
```

Repeat the same pattern for **FailTaskUseCase** (`src/features/fail-task/`).

---

### Step 5: Update CLI Entry Point

In `src/index.ts`:

1. Import new use cases and color utility:
```typescript
import { CancelTaskUseCase } from './features/cancel-task';
import { FailTaskUseCase } from './features/fail-task';
import { colorStatus } from './shared/ui';
```

2. Update `USAGE` constant to include `cancel` and `fail`.

3. Add `handleCancel()` and `handleFail()` functions (parallel to `handleComplete()`).

4. Update `handleList()` to colorize the status column:
```typescript
const rows = tasks.map((t) =>
  `${String(t.id).padEnd(4)}${colorStatus(t.status.padEnd(12))}${t.title}`
);
```

5. Add cases to the switch statement:
```typescript
case 'cancel':
  handleCancel();
  break;
case 'fail':
  handleFail();
  break;
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run only new tests
npm test -- tests/unit/shared/colors.test.ts
npm test -- tests/unit/features/cancel-task.test.ts
npm test -- tests/unit/features/fail-task.test.ts

# Run with coverage
npm run test:coverage
```

---

## Verifying the CLI

```bash
npx tsc && \
  node dist/index.js add "Buy groceries" && \
  node dist/index.js cancel 1 && \
  node dist/index.js list

# Expected: task 1 shows as "canceled" in yellow
```

---

## Checklist Before Marking Done

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm test` passes with no failures
- [ ] `npm run test:coverage` meets ≥ 70% threshold
- [ ] `list` shows colored status labels in a TTY
- [ ] `list` shows plain text when output is piped
- [ ] `cancel` and `fail` reject non-pending tasks with correct error messages
- [ ] `tasks.json` persists `canceled` and `failed` statuses correctly
