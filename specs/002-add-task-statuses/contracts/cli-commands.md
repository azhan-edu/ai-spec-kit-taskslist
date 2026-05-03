# CLI Command Contract: Extended Task Statuses

**Version**: 1.0  
**Date**: 2026-05-03  
**Type**: Console CLI Interface  
**Extends**: [001-task-manager/contracts/cli-commands.md](../../001-task-manager/contracts/cli-commands.md)

---

## Overview

This contract extends the existing Task Manager CLI with two new commands and updates the `list` command output.

**New commands**:
- `cancel <id>` — Cancel a pending task
- `fail <id>` — Mark a pending task as failed

**Updated commands**:
- `list` — Now outputs status labels with emoji prefix and ANSI color coding

---

## Updated: Usage Output

When no command or an unknown command is provided, the updated usage block is printed to **stderr** with exit code **1**:

```
Usage: task-manager <command>

Commands:
  add <title>      Add a new task
  list             List all tasks
  complete <id>    Mark a task as done
  cancel <id>      Cancel a pending task
  fail <id>        Mark a pending task as failed
```

---

## Updated Command: list

**Change**: The `Status` column now shows `{emoji} {status}` with ANSI color applied to the full string when stdout is a TTY. In non-TTY contexts (piped output), emoji circles remain visible but ANSI codes are omitted.

**Status display format**:

| Status   | TTY output (colored)        | Non-TTY output  |
|----------|-----------------------------|-----------------|
| pending  | `🔵 pending` (plain)        | `🔵 pending`    |
| done     | `🟢 done` (green)           | `🟢 done`       |
| canceled | `🟡 canceled` (yellow)      | `🟡 canceled`   |
| failed   | `🔴 failed` (red)           | `🔴 failed`     |

**Column alignment**: Padding is calculated from the raw status string length before the emoji is prepended. The emoji (2 display columns) + space prefix causes the status column to appear slightly wider visually, but text column alignment is preserved.

**Output format**:

- **No tasks**:
  ```
  No tasks found.
  ```

- **With tasks** (TTY — colors applied, shown here as plain text):
  ```
  ID  Status          Title
  1   🔵 pending      Buy groceries
  2   🟢 done         Call dentist
  3   🟡 canceled     Fix bug #42
  4   🔴 failed       Deploy to prod
  ```

**Exit codes**: unchanged (0 = success, 2 = file system error)

---

## New Command: cancel

**Purpose**: Mark a pending task as canceled, indicating the user decided not to do it.

**Signature**:
```
cancel <id>
```

**Arguments**:
- `id` (integer, required): Sequential integer task ID

**Output**:
- **Success**:
  ```
  ✓ Task canceled: [id]
  Title: [title]
  ```
- **Notification (already canceled)**:
  ```
  ℹ Task [id] is already canceled.
  ```
  → stdout, exit 0
- **Error (task in non-cancelable state)**:
  ```
  Error: Cannot cancel task [id]: task is already [status]
  Hint: Run `list` to see valid task IDs
  ```
  → stderr, exit 1
- **Error (non-integer ID)**:
  ```
  Error: Invalid ID: '[value]' is not a number
  Usage: cancel <id>
  ```
  → stderr, exit 1
- **Error (ID not found)**:
  ```
  Error: Task not found with ID: [id]
  Hint: Run `list` to see valid task IDs
  ```
  → stderr, exit 1

**Exit Codes**:
- `0`: Success (including already-canceled notification)
- `1`: Validation error (invalid ID format, task not found, invalid transition)
- `2`: File system error

**Example Interactions**:
```bash
$ app cancel 3
✓ Task canceled: 3
Title: Fix bug #42

$ app cancel 3
ℹ Task 3 is already canceled.

$ app cancel 2
Error: Cannot cancel task 2: task is already done
Hint: Run `list` to see valid task IDs

$ app cancel abc
Error: Invalid ID: 'abc' is not a number
Usage: cancel <id>

$ app cancel 999
Error: Task not found with ID: 999
Hint: Run `list` to see valid task IDs
```

---

## New Command: fail

**Purpose**: Mark a pending task as failed, indicating the user attempted but could not complete it.

**Signature**:
```
fail <id>
```

**Arguments**:
- `id` (integer, required): Sequential integer task ID

**Output**:
- **Success**:
  ```
  ✓ Task marked as failed: [id]
  Title: [title]
  ```
- **Notification (already failed)**:
  ```
  ℹ Task [id] is already failed.
  ```
  → stdout, exit 0
- **Error (task in non-failable state)**:
  ```
  Error: Cannot fail task [id]: task is already [status]
  Hint: Run `list` to see valid task IDs
  ```
  → stderr, exit 1
- **Error (non-integer ID)**:
  ```
  Error: Invalid ID: '[value]' is not a number
  Usage: fail <id>
  ```
  → stderr, exit 1
- **Error (ID not found)**:
  ```
  Error: Task not found with ID: [id]
  Hint: Run `list` to see valid task IDs
  ```
  → stderr, exit 1

**Exit Codes**:
- `0`: Success (including already-failed notification)
- `1`: Validation error (invalid ID format, task not found, invalid transition)
- `2`: File system error

**Example Interactions**:
```bash
$ app fail 4
✓ Task marked as failed: 4
Title: Deploy to prod

$ app fail 4
ℹ Task 4 is already failed.

$ app fail 2
Error: Cannot fail task 2: task is already done
Hint: Run `list` to see valid task IDs

$ app fail abc
Error: Invalid ID: 'abc' is not a number
Usage: fail <id>

$ app fail 999
Error: Task not found with ID: 999
Hint: Run `list` to see valid task IDs
```

---

## Error Handling (additions)

### Validation Errors

| Error | Condition | Message | Exit |
|-------|-----------|---------|------|
| Invalid ID format (cancel) | `cancel` with non-integer | `Error: Invalid ID: '{value}' is not a number\nUsage: cancel <id>` | 1 |
| Task not found (cancel) | `cancel` with integer that doesn't exist | `Error: Task not found with ID: {id}\nHint: Run \`list\` to see valid task IDs` | 1 |
| Invalid transition (cancel) | `cancel` on done/canceled/failed task | `Error: Cannot cancel task {id}: task is already {status}\nHint: Run \`list\` to see valid task IDs` | 1 |
| Invalid ID format (fail) | `fail` with non-integer | `Error: Invalid ID: '{value}' is not a number\nUsage: fail <id>` | 1 |
| Task not found (fail) | `fail` with integer that doesn't exist | `Error: Task not found with ID: {id}\nHint: Run \`list\` to see valid task IDs` | 1 |
| Invalid transition (fail) | `fail` on done/canceled/failed task | `Error: Cannot fail task {id}: task is already {status}\nHint: Run \`list\` to see valid task IDs` | 1 |

### Edge Cases

| Condition | Behaviour |
|-----------|-----------|
| Cancel an already-canceled task | Print `ℹ Task {id} is already canceled.`; stdout; exit 0 |
| Fail an already-failed task | Print `ℹ Task {id} is already failed.`; stdout; exit 0 |
| Cancel/fail a done task | Error: invalid transition; stderr; exit 1 |
| Cancel a failed task | Error: invalid transition; stderr; exit 1 |
| Fail a canceled task | Error: invalid transition; stderr; exit 1 |
| `list` in non-TTY context (piped) | Emoji circles shown; ANSI codes omitted |
