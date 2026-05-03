# Quickstart: Extended Task Statuses Development

**Feature**: 002-add-task-statuses  
**Date**: 2026-05-03  
**Phase**: Phase 1 - Developer Guide  
**Prerequisite**: [001-task-manager/quickstart.md](../001-task-manager/quickstart.md) — the project is already set up

---

## Overview

This guide covers implementing the two new task statuses (`canceled`, `failed`), emoji-prefixed color coding in the `list` output, and the `cancel`/`fail` CLI commands. No new dependencies are required.

---

## What's Changing

| Area | Change |
|------|--------|
| `src/shared/types/task.ts` | Extend `TaskStatus` union |
| `src/shared/ui/` | **New**: emoji + ANSI status formatting utility |
| `src/entities/task/model.ts` | Add `cancelTask()`, `failTask()`, transition guard |
| `src/features/cancel-task/` | **New**: cancel use case |
| `src/features/fail-task/` | **New**: fail use case |
| `src/index.ts` | Add `cancel`/`fail` handlers; apply `formatStatus()` to `list` output |
| `tests/unit/entities/task.test.ts` | Add transition guard tests |
| `tests/unit/features/cancel-task.test.ts` | **New** |
| `tests/unit/features/fail-task.test.ts` | **New** |
| `tests/unit/shared/status-format.test.ts` | **New** |

---

## TDD Workflow

### Step 1: Extend TaskStatus Type

**File**: `src/shared/types/task.ts`

```typescript
export type TaskStatus = 'pending' | 'done' | 'canceled' | 'failed';
```

No test needed — type-only change. Verify with `npx tsc --noEmit`.

---

### Step 2: Status Formatting Utility (TDD)

**Test first**: `tests/unit/shared/status-format.test.ts`

```typescript
import { formatStatus } from '../../../src/shared/ui/status-format';

describe('formatStatus', () => {
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
    delete process.env.NO_COLOR;
  });

  it('prefixes pending with 🔵 and returns plain text', () => {
    const result = formatStatus('pending', 'pending   ');
    expect(result).toContain('🔵');
    expect(result).toContain('pending');
  });

  describe('in TTY context', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    });

    it('prefixes done with 🟢 and wraps in green', () => {
      const result = formatStatus('done', 'done      ');
      expect(result).toContain('🟢');
      expect(result).toContain('[32m');
      expect(result).toContain('[0m');
    });

    it('prefixes canceled with 🟡 and wraps in yellow', () => {
      const result = formatStatus('canceled', 'canceled  ');
      expect(result).toContain('🟡');
      expect(result).toContain('[33m');
    });

    it('prefixes failed with 🔴 and wraps in red', () => {
      const result = formatStatus('failed', 'failed    ');
      expect(result).toContain('🔴');
      expect(result).toContain('[31m');
    });
  });

  describe('in non-TTY context', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
    });

    it('shows emoji but no ANSI codes for done', () => {
      const result = formatStatus('done', 'done      ');
      expect(result).toContain('🟢');
      expect(result).not.toContain('[32m');
    });
  });

  describe('with NO_COLOR env var', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
      process.env.NO_COLOR = '1';
    });

    it('shows emoji but no ANSI codes', () => {
      const result = formatStatus('done', 'done      ');
      expect(result).toContain('🟢');
      expect(result).not.toContain('[32m');
    });
  });
});
```

**Implement**: `src/shared/ui/status-format.ts`

```typescript
import { TaskStatus } from '../types/task';

const ESC = '';
const RESET = `${ESC}[0m`;

const EMOJI: Record<TaskStatus, string> = {
  pending:  '🔵',
  done:     '🟢',
  canceled: '🟡',
  failed:   '🔴',
};

const COLOR: Partial<Record<TaskStatus, string>> = {
  done:     '32',
  canceled: '33',
  failed:   '31',
};

function colorize(text: string, code: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) return text;
  return `${ESC}[${code}m${text}${RESET}`;
}

/**
 * Returns a display string for the status column.
 * paddedLabel should be the raw status string already padded to column width
 * (e.g. status.padEnd(10)) — padding before emoji preserves alignment.
 */
export function formatStatus(status: TaskStatus, paddedLabel: string): string {
  const emoji = EMOJI[status] ?? '';
  const label = `${emoji} ${paddedLabel}`;
  const code = COLOR[status];
  return code ? colorize(label, code) : label;
}
```

**Export**: `src/shared/ui/index.ts`

```typescript
export { formatStatus } from './status-format';
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
    expect(() => store.cancelTask(task.id))
      .toThrow(`Cannot cancel task ${task.id}: task is already done`);
  });

  it('throws when task is already canceled', () => {
    const task = store.addTask('Canceled task');
    store.cancelTask(task.id);
    expect(() => store.cancelTask(task.id))
      .toThrow(`Cannot cancel task ${task.id}: task is already canceled`);
  });

  it('throws when task is already failed', () => {
    const task = store.addTask('Failed task');
    store.failTask(task.id);
    expect(() => store.cancelTask(task.id))
      .toThrow(`Cannot cancel task ${task.id}: task is already failed`);
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
    expect(() => store.failTask(task.id))
      .toThrow(`Cannot fail task ${task.id}: task is already done`);
  });

  it('throws when task is already canceled', () => {
    const task = store.addTask('Canceled task');
    store.cancelTask(task.id);
    expect(() => store.failTask(task.id))
      .toThrow(`Cannot fail task ${task.id}: task is already canceled`);
  });

  it('throws when task is already failed', () => {
    const task = store.addTask('Failed task');
    store.failTask(task.id);
    expect(() => store.failTask(task.id))
      .toThrow(`Cannot fail task ${task.id}: task is already failed`);
  });
});
```

**Implement** in `src/entities/task/model.ts`:

```typescript
cancelTask(id: number): Task {
  const task = this.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task not found with ID: ${id}`);
  if (task.status !== 'pending')
    throw new Error(`Cannot cancel task ${id}: task is already ${task.status}`);
  task.status = 'canceled';
  return task;
}

failTask(id: number): Task {
  const task = this.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task not found with ID: ${id}`);
  if (task.status !== 'pending')
    throw new Error(`Cannot fail task ${id}: task is already ${task.status}`);
  task.status = 'failed';
  return task;
}
```

---

### Step 4: New Use Cases (TDD)

**`tests/unit/features/cancel-task.test.ts`**:

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
    expect(() => new CancelTaskUseCase(store).execute(999))
      .toThrow('Task not found with ID: 999');
  });
});
```

**`src/features/cancel-task/use-case.ts`**:

```typescript
import { Task } from '../../shared/types/task';
import { TaskStore } from '../../entities/task';

export class CancelTaskUseCase {
  constructor(private store: TaskStore) {}
  execute(id: number): Task { return this.store.cancelTask(id); }
}
```

**`src/features/cancel-task/index.ts`**:

```typescript
export { CancelTaskUseCase } from './use-case';
```

Repeat the same pattern for **FailTaskUseCase** in `src/features/fail-task/`.

---

### Step 5: Update CLI Entry Point

**`src/index.ts`** changes:

1. Import new use cases and formatter:
```typescript
import { CancelTaskUseCase } from './features/cancel-task';
import { FailTaskUseCase } from './features/fail-task';
import { formatStatus } from './shared/ui';
```

2. Update `USAGE` to include `cancel` and `fail`.

3. Update `handleList()` — apply `formatStatus` with pre-padded label:
```typescript
const rows = tasks.map((t) =>
  `${String(t.id).padEnd(4)}${formatStatus(t.status, t.status.padEnd(10))}${t.title}`
);
```

4. Add `handleCancel()` (mirrors `handleComplete()`, uses `CancelTaskUseCase`):
```typescript
function handleCancel(): void {
  const raw = args[0];
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) {
    process.stderr.write(`Error: Invalid ID: '${raw}' is not a number\nUsage: cancel <id>\n`);
    process.exit(1);
  }
  const store = loadStore();
  const existing = store.getTaskById(id);
  if (existing?.status === 'canceled') {
    process.stdout.write(`ℹ Task ${id} is already canceled.\n`);
    process.exit(0);
  }
  try {
    const task = new CancelTaskUseCase(store).execute(id);
    saveStore(store);
    process.stdout.write(`✓ Task canceled: ${task.id}\nTitle: ${task.title}\n`);
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\nHint: Run \`list\` to see valid task IDs\n`);
    process.exit(1);
  }
}
```

5. Add `handleFail()` following the same pattern with `FailTaskUseCase`.

6. Add switch cases:
```typescript
case 'cancel': handleCancel(); break;
case 'fail':   handleFail();   break;
```

---

## Verification

```bash
# Build and smoke-test
npx tsc && \
  node dist/index.js add "Buy groceries" && \
  node dist/index.js add "Call dentist" && \
  node dist/index.js complete 2 && \
  node dist/index.js cancel 1 && \
  node dist/index.js list
# Expected: 🔴/🟡/🟢/🔵 prefixed status column with ANSI colors

# Piped output (no ANSI, emoji visible)
node dist/index.js list | cat
```

---

## Checklist Before Marking Done

- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] `npm run test:coverage` meets ≥ 70% threshold
- [ ] `list` shows `🔵🟢🟡🔴` emoji prefixes in correct order
- [ ] `list` applies green/yellow/red ANSI colors in a TTY
- [ ] `list` shows plain emoji text (no ANSI codes) when piped
- [ ] `cancel`/`fail` reject non-pending tasks with correct error messages
- [ ] `tasks.json` persists `canceled` and `failed` correctly
