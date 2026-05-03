# CLI Command Contract: Task Manager

**Version**: 1.1
**Date**: 2026-05-03
**Type**: Console CLI Interface

## Overview

The Task Manager CLI exposes three commands as the primary interface:
- `add <title>` - Add a new task
- `list` - Display all tasks
- `complete <id>` - Mark task as done

**v1 scope**: Input via command-line arguments only. Interactive stdin mode is deferred to a future version.

---

## Usage Output

Printed to **stderr** with exit code **1** when:
- No command is provided (`node dist/index.js`)
- An unknown command is provided (`node dist/index.js foo`)

```
Usage: task-manager <command>

Commands:
  add <title>      Add a new task
  list             List all tasks
  complete <id>    Mark a task as done
```

---

## Command Interface Definitions

### Command: add

**Purpose**: Create a new task with a title

**Signature**:
```
add <title>
```

**Arguments**:
- `title` (string, required): Task title, 1–500 characters; trimmed before saving

**Output**:
- **Success**:
  ```
  ✓ Task added: [id]
  Title: [title]
  Status: pending
  ```
- **Error (empty/whitespace-only title)**:
  ```
  Error: Task title cannot be empty
  Usage: add <title>
  ```
- **Error (file system)**:
  ```
  Error: Cannot write tasks.json: [specific reason, e.g. Permission denied]
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
Usage: add <title>

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
- Column separator: Two spaces (`"  "`)
- Header row: `ID  Status      Title` followed by newline
- Data rows: One task per line
- Sorting: By task ID ascending (creation order)
- Title truncation: None in v1 (full title displayed, may wrap)
- Each row ends with a newline

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
- `0`: Success (empty list also exit 0)
- `2`: File system error
  ```
  Error: Cannot read tasks.json: [specific reason]
  ```

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
- `id` (integer, required): Sequential integer task ID

**Output**:
- **Success**:
  ```
  ✓ Task completed: [id]
  Title: [title]
  ```
- **Notification (already done)**:
  ```
  ℹ Task [id] is already done.
  ```
  → stdout, exit 0
- **Error (non-integer ID)**:
  ```
  Error: Invalid ID: '[value]' is not a number
  Usage: complete <id>
  ```
- **Error (integer but not found)**:
  ```
  Error: Task not found with ID: [id]
  Hint: Run `list` to see valid task IDs
  ```
- **Error (file system)**:
  ```
  Error: Cannot read tasks.json: [specific reason]
  ```

**Exit Codes**:
- `0`: Success (including already-done notification)
- `1`: Task not found or invalid ID
- `2`: File system error

**Example Interactions**:
```bash
$ app complete 1
✓ Task completed: 1
Title: Buy groceries

$ app complete 1
ℹ Task 1 is already done.

$ app complete abc
Error: Invalid ID: 'abc' is not a number
Usage: complete <id>

$ app complete 999
Error: Task not found with ID: 999
Hint: Run `list` to see valid task IDs
```

---

## Input/Output Protocol

**Input Sources**:
- Command-line arguments (v1 only; interactive stdin deferred)

**Output Destinations**:
- Successful results and informational notices → stdout
- Error messages and usage output → stderr
- Exit codes for script integration

**Format**:
- Human-readable
- Consistent success indicator: `✓` prefix
- Consistent informational indicator: `ℹ` prefix
- Consistent error prefix: `Error:`
- Consistent capitalization and punctuation across all commands

---

## Error Handling

### Validation Errors

| Error | Condition | Message | Exit |
|-------|-----------|---------|------|
| Empty title | `add` with empty/whitespace string | `Error: Task title cannot be empty\nUsage: add <title>` | 1 |
| Invalid ID format | `complete` with non-integer | `Error: Invalid ID: '{value}' is not a number\nUsage: complete <id>` | 1 |
| Task not found | `complete` with integer that doesn't exist | `Error: Task not found with ID: {id}\nHint: Run \`list\` to see valid task IDs` | 1 |
| Unknown command | Unrecognised first argument | Print usage (see Usage Output section) | 1 |
| No command | No arguments provided | Print usage (see Usage Output section) | 1 |

### System Errors

| Error | Condition | Message | Exit |
|-------|-----------|---------|------|
| Cannot read tasks.json | File missing/unreadable | `Error: Cannot read tasks.json: {reason}` | 2 |
| Corrupted tasks.json | Invalid JSON content | `Error: Cannot read tasks.json: invalid JSON — starting fresh` | 2 |
| Cannot write tasks.json | Permission denied or disk full | `Error: Cannot write tasks.json: {reason}` | 2 |

---

## Edge Cases

| Condition | Behaviour |
|-----------|-----------|
| Empty/whitespace-only title | Reject; error + usage to stderr; exit 1 |
| tasks.json missing on first run | Treat as empty list; create on first write |
| Completing an already-done task | Print `ℹ Task {id} is already done.` to stdout; exit 0 |
| Title at 500-char limit | Accept and save (valid boundary) |
| Title exceeding 500 chars | Reject; `Error: Task title too long (max 500 characters)`; exit 1 |

---

## Future Contract Extensions (not in v1)

- Interactive stdin input for `add` and `complete`
- Filter/search: `list --filter pending`
- Update task title: `update <id> <new-title>`
- Delete task: `delete <id>`
- `--help` / `-h` flag per command
- Export: `export --format json`
