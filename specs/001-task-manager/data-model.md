# Data Model: Task Manager

**Feature**: Task Manager  
**Date**: 2026-05-03  
**Phase**: Phase 1 - Design

## Entities

### Task

Represents a single task in the system.

**Fields**:
- `id` (string, required): Unique identifier, auto-generated UUID format
- `title` (string, required, 1-500 chars): Task description/title
- `status` (enum: "pending" | "done", required): Current task status
- `createdAt` (ISO 8601 timestamp, required): When task was created
- `completedAt` (ISO 8601 timestamp, optional): When task was marked done

**Validation Rules**:
- `id`: Must be unique, non-empty UUID string
- `title`: Trimmed, non-empty, max 500 characters
- `status`: Must be exactly "pending" or "done"
- `createdAt`: Valid ISO 8601 timestamp
- `completedAt`: Only set when status is "done", must be >= createdAt

**State Transitions**:
```
pending → done (via CompleteTask action)
done → (no transitions back to pending in current spec)
```

### TaskList

Aggregate root managing collection of tasks.

**Responsibilities**:
- Maintain ordered collection of tasks
- Provide methods to add, retrieve, and update tasks
- Persist to/from JSON file
- Validate business rules

**Methods**:
- `addTask(title: string): Task` - Add new pending task
- `getTasks(): Task[]` - Get all tasks in order
- `completeTask(id: string): void` - Mark task as done
- `getTaskById(id: string): Task | undefined` - Lookup single task
- `save(): void` - Persist to tasks.json
- `load(): void` - Load from tasks.json

**Invariants**:
- Task IDs must be unique across the list
- Status transitions must be valid (pending → done only)
- tasks.json must always be in sync with in-memory state

## Persistence Format

### tasks.json Structure

```json
{
  "version": "1.0",
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2026-05-03T10:30:00Z",
      "completedAt": null
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Complete project proposal",
      "status": "done",
      "createdAt": "2026-05-02T14:15:00Z",
      "completedAt": "2026-05-03T09:45:00Z"
    }
  ]
}
```

**Schema Notes**:
- Version field for future migrations
- Tasks array ordered by creation time
- Null values used for optional fields (completedAt)
- ISO 8601 timestamps for consistency

## Error Conditions

### Task Operations

- **Invalid Task ID**: If ID doesn't exist → Error message to stderr
- **Empty Title**: If title is empty/whitespace → Error message + validation feedback
- **Duplicate ID**: System prevents (auto-generated UUIDs)
- **Corrupted tasks.json**: 
  - If file missing: Create empty file on first write
  - If invalid JSON: Warn user and initialize empty
  - If missing required fields: Warn and skip corrupted records

## Performance Considerations

**In-Memory Caching**:
- All tasks loaded into memory on startup (assumption: <10k tasks)
- Changes written immediately to disk (synchronous)
- No lazy loading needed for typical usage

**Scalability Limits**:
- ~1000-5000 tasks per typical user
- File size grows ~100 bytes per task (~100KB for 1000 tasks)
- All operations O(n) or O(1) - acceptable for CLI app scale
