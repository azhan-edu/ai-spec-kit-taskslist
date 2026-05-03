# Data Model: Extended Task Statuses

**Feature**: 002-add-task-statuses  
**Date**: 2026-05-03  
**Phase**: Phase 1 - Design  
**Extends**: [001-task-manager/data-model.md](../001-task-manager/data-model.md)

---

## Changes to Existing Entities

### TaskStatus (extended)

The `TaskStatus` union type gains two new terminal values.

**Before**:
```
'pending' | 'done'
```

**After**:
```
'pending' | 'done' | 'canceled' | 'failed'
```

**File**: `src/shared/types/task.ts`

---

### Task (unchanged)

No new fields. The `status` field now holds one of four values.

| Field  | Type         | Required | Notes                                   |
|--------|--------------|----------|-----------------------------------------|
| id     | number       | yes      | Sequential integer, auto-assigned        |
| title  | string       | yes      | 1–500 chars, trimmed                    |
| status | TaskStatus   | yes      | One of: pending, done, canceled, failed |

---

### TaskStore (extended)

Two new methods added. Existing methods unchanged.

| Method              | Returns | Description                                              |
|---------------------|---------|----------------------------------------------------------|
| `addTask(title)`    | Task    | (unchanged) Create pending task with next ID             |
| `getTasks()`        | Task[]  | (unchanged) All tasks sorted by ID ascending             |
| `completeTask(id)`  | Task    | (unchanged) pending → done; throws if not found          |
| `getTaskById(id)`   | Task?   | (unchanged) Lookup by ID                                 |
| `toArray()`         | Task[]  | (unchanged) Raw tasks array for persistence              |
| `cancelTask(id)`    | Task    | **NEW** pending → canceled; throws on invalid transition |
| `failTask(id)`      | Task    | **NEW** pending → failed; throws on invalid transition   |

**Transition guard** (applied in `cancelTask` and `failTask`):
1. If task not found → throw `Task not found with ID: {id}`
2. If task status is not `'pending'` → throw `Cannot {action} task {id}: task is already {status}`

---

## New Entity: Status Display Map

A declarative mapping from status to its display representation, owned by `src/shared/ui/status-format.ts`.

| Status   | Emoji | ANSI Color | ANSI Code | Format (TTY)     | Format (non-TTY) |
|----------|-------|------------|-----------|------------------|------------------|
| pending  | 🔵    | plain      | (none)    | `🔵 pending`     | `🔵 pending`     |
| done     | 🟢    | green      | 32        | `🟢 done` (green)| `🟢 done`        |
| canceled | 🟡    | yellow     | 33        | `🟡 canceled` (yellow) | `🟡 canceled` |
| failed   | 🔴    | red        | 31        | `🔴 failed` (red)| `🔴 failed`      |

**Notes**:
- Emoji circles are Unicode and appear in both TTY and non-TTY (piped) contexts
- ANSI color wraps the full `{emoji} {status}` string
- Column padding is applied to the raw status string before emoji is prepended, to preserve alignment

---

## State Transition Diagram

```
         ┌─────────────────────────────┐
         │            pending           │
         └──────────┬──────┬───────────┘
                    │      │      │
                 complete cancel  fail
                    │      │      │
                    ▼      ▼      ▼
                  done  canceled  failed
                  (■)    (■)      (■)
```

**(■) = terminal status — no further transitions allowed**

---

## State Transition Rules

| From      | To       | Command  | Allowed |
|-----------|----------|----------|---------|
| pending   | done     | complete | ✓       |
| pending   | canceled | cancel   | ✓       |
| pending   | failed   | fail     | ✓       |
| done      | (any)    | any      | ✗       |
| canceled  | (any)    | any      | ✗       |
| failed    | (any)    | any      | ✗       |

---

## Persistence Format

### tasks.json (extended, backwards-compatible)

```json
{
  "version": "1.0",
  "tasks": [
    { "id": 1, "title": "Buy groceries", "status": "pending" },
    { "id": 2, "title": "Call dentist", "status": "done" },
    { "id": 3, "title": "Fix bug #42", "status": "canceled" },
    { "id": 4, "title": "Deploy to prod", "status": "failed" }
  ]
}
```

**No version bump required.** The `status` field is persisted as a plain string; the format is already open to additional values.

---

## Error Conditions (additions)

| Condition                            | Behavior                                                                    |
|--------------------------------------|-----------------------------------------------------------------------------|
| Cancel/fail a non-existent task      | Throw `Task not found with ID: {id}`; stderr exit 1                        |
| Cancel/fail a task in terminal state | Throw `Cannot {action} task {id}: task is already {status}`; stderr exit 1 |
| Cancel/fail with invalid ID format   | `Error: Invalid ID: '{value}' is not a number`; stderr exit 1              |
