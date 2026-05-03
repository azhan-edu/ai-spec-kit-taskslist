# CLI Command Contract: Task Manager

**Version**: 1.0  
**Date**: 2026-05-03  
**Type**: Console CLI Interface

## Overview

The Task Manager CLI exposes three commands as the primary interface:
- `add <title>` - Add a new task
- `list` - Display all tasks
- `complete <id>` - Mark task as done

## Command Interface Definitions

### Command: add

**Purpose**: Create a new task with a title

**Signature**:
```
add <title>
```

**Arguments**:
- `title` (string, required): Task title (1-500 characters)

**Input Modes**:
- Command line argument: `app add "Buy milk"`
- Interactive input: `app add` then prompt for title

**Output**:
- **Success**: 
  ```
  ✓ Task added: [id]
  Title: [title]
  Status: pending
  ```
- **Error (empty title)**:
  ```
  Error: Task title cannot be empty
  ```

**Exit Codes**:
- `0`: Success
- `1`: Validation error (empty title)
- `2`: File system error

**Example Interactions**:
```bash
$ app add "Buy groceries"
✓ Task added: 1
Title: Buy groceries
Status: pending

$ app add ""
Error: Task title cannot be empty

$ app add "Complete project proposal"
✓ Task added: 2
Title: Complete project proposal
Status: pending
```

---

### Command: list

**Purpose**: Display all tasks with current status

**Signature**:
```
list
```

**Arguments**: None

**Output Format**:

Table format with three columns: ID, Status, Title.
- Column widths: ID (4 chars, right-aligned), Status (10 chars, left-aligned), Title (remaining, left-aligned)
- Column separator: Two spaces ("  ")
- Header row: "ID  Status      Title" (followed by newline)
- Data rows: One task per line, values right/left-aligned as specified
- Sorting: By task ID ascending (creation order)
- Title truncation: None in v1 (full title displayed, may wrap)

- **No tasks**:
  ```
  No tasks found.
  ```
- **With tasks**:
  ```
  ID  Status      Title
  1   pending     Buy groceries
  2   done        Complete project proposal
  3   pending     Learn TypeScript
  ```

**Exit Codes**:
- `0`: Success
- `2`: File system error (can't read tasks.json)

**Example Interactions**:
```bash
$ app list
ID  Status      Title
1   pending     Buy groceries
2   done        Complete project proposal

$ app list
No tasks found.
```

---

### Command: complete

**Purpose**: Mark a specific task as done by ID

**Signature**:
```
complete <id>
```

**Arguments**:
- `id` (integer, required): Task ID (sequential integer) to mark as complete

**Output**:
- **Success**:
  ```
  ✓ Task completed: [id]
  Title: [title]
  ```
- **Error (invalid ID)**:
  ```
  Error: Task not found with ID: [id]
  ```

**Exit Codes**:
- `0`: Success
- `1`: Task not found
- `2`: File system error

**Example Interactions**:
```bash
$ app complete 1
✓ Task completed: 1
Title: Buy groceries

$ app complete 999
Error: Task not found with ID: 999
```

---

## Input/Output Protocol

**Input Sources**:
- Command line arguments (first choice)
- stdin if argument missing and terminal is interactive
- Pipe input for scripting

**Output Destinations**:
- Successful results → stdout
- Error messages → stderr
- Exit codes for script integration

**Format**:
- Human-readable by default
- Consistent formatting across all commands
- Clear success/error indicators (✓ / Error:)

## Error Handling

### Validation Errors

| Error | Condition | Recovery |
|-------|-----------|----------|
| Empty title | `add` with empty string | Show usage, exit 1 |
| Invalid ID | `complete` with non-integer value | Show error, exit 1 |
| Task not found | `complete` with integer ID that doesn't exist | Show error, exit 1 |

### System Errors

| Error | Condition | Recovery |
|-------|-----------|----------|
| Cannot read tasks.json | File missing/unreadable | Create/show error, exit 2 |
| Corrupted tasks.json | Invalid JSON | Warn, initialize empty, exit 2 |
| Cannot write tasks.json | Permission denied | Show error, exit 2 |

## Edge Cases

- **Empty title in add**: Must reject, show validation error
- **Whitespace-only title**: Trim and validate (reject if empty after trim)
- **Missing tasks.json**: Create on first write
- **Completing already-done task**: Update completedAt timestamp, show success
- **Large task list**: Display all (no pagination in v1)

## Future Contract Extensions

These are NOT in v1 but documented for future consideration:
- Filter/search tasks: `list --filter pending`
- Update task title: `update <id> <new-title>`
- Delete task: `delete <id>`
- Import/export: `export --format json`
