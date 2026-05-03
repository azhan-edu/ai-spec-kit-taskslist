# Data Model: Task Manager

**Feature**: Task Manager  
**Date**: 2026-05-03  
**Phase**: Phase 1 - Design

## Entities

### Task

Represents a single task in the system.

**Fields**:
- `id` (number, required): Auto-incrementing sequential integer starting at 1 (1, 2, 3…)
- `title` (string, required, 1–500 chars): Task description
- `status` (enum: `"pending"` | `"done"`, required): Current state

**Validation Rules**:
- `id`: Positive integer; assigned by system on creation; never reused
- `title`: Trimmed string; non-empty after trim; max 500 characters
- `status`: Must be exactly `"pending"` or `"done"`

**State Transitions**:
```
pending → done  (via complete command)
done    → (no transitions; once done, always done in v1)
```

### TaskStore (aggregate root)

In-memory representation of the task collection loaded from `tasks.json`.

**Responsibilities**:
- Maintain ordered collection of tasks
- Generate next sequential ID on add
- Validate business rules on mutation
- Read from / write to `tasks.json`

**Operations**:
- `addTask(title: string): Task` — create a pending task with next ID
- `getTasks(): Task[]` — return all tasks ordered by ID ascending
- `completeTask(id: number): Task` — mark task as done; throws if not found
- `getTaskById(id: number): Task | undefined` — lookup by ID

## Persistence Format

### tasks.json Structure

```json
{
  "version": "1.0",
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending"
    },
    {
      "id": 2,
      "title": "Complete project proposal",
      "status": "done"
    }
  ]
}
```

**Schema Notes**:
- `version` field reserved for future migrations
- Tasks array ordered by `id` ascending (creation order)
- No timestamps in v1 (YAGNI)
- Next ID = `max(existing ids) + 1`, or `1` if empty

## Error Conditions

| Condition | Behavior |
|-----------|----------|
| Empty/whitespace title on add | Reject; show error to stderr; exit 1 |
| ID not found on complete | Reject; show error to stderr; exit 1 |
| tasks.json missing on read | Treat as empty task list; create on first write |
| tasks.json contains invalid JSON | Warn to stderr; initialize empty; continue |

## Performance Notes

- All tasks loaded into memory once per command invocation (single-shot CLI)
- Synchronous I/O is safe and sufficient: single-user, no concurrency
- O(n) scan for task lookup; acceptable at expected scale (<10k tasks)
