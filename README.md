# Task Manager

A TypeScript CLI for managing personal tasks with local persistence.

## Requirements

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
npm run build
```

## Usage

```bash
node dist/index.js add "Buy groceries"
# ✓ Task added: 1
# Title: Buy groceries
# Status: pending

node dist/index.js list
# ID  Status      Title
# 1   pending     Buy groceries

node dist/index.js complete 1
# ✓ Task completed: 1
# Title: Buy groceries

node dist/index.js list
# ID  Status      Title
# 1   done        Buy groceries
```

### Commands

| Command | Description |
|---------|-------------|
| `add <title>` | Add a new task (title max 500 chars) |
| `list` | Display all tasks with status |
| `complete <id>` | Mark a task as done by its ID |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation error (empty title, task not found, invalid ID) |
| `2` | File system error |

### Data

Tasks are saved to `tasks.json` in the directory where you run the command. The file is created automatically on first use.

## Development

```bash
npm test                # Run all tests
npm run test:coverage   # Run tests with coverage report
npm run build           # Compile TypeScript to dist/
```

### Project Structure

```
src/
├── shared/
│   ├── types/task.ts       # Task, TaskStatus, TasksFile types
│   └── lib/storage.ts      # JSON file read/write
├── entities/task/          # TaskStore (add, list, complete, getById)
├── features/
│   ├── add-task/           # AddTaskUseCase
│   ├── list-tasks/         # ListTasksUseCase
│   └── complete-task/      # CompleteTaskUseCase
└── index.ts                # CLI entry point

tests/
├── unit/                   # Per-layer unit tests
└── integration/            # Full add → list → complete flow
```

Architecture follows [Feature-Sliced Design](https://feature-sliced.design/). All business logic has 100% test coverage.
