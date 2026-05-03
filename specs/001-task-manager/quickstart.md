# Quickstart: Task Manager Development

**Feature**: Task Manager  
**Date**: 2026-05-03  
**Phase**: Phase 1 - Developer Guide

## Overview

This guide helps developers set up, build, test, and run the Task Manager CLI application following the TypeScript + Jest + Feature-Sliced Design architecture.

## Prerequisites

- Node.js 18+ (download from https://nodejs.org)
- npm 9+ (comes with Node.js)
- TypeScript knowledge
- Git for version control

## Project Setup

### 1. Initialize Project

```bash
# Clone/navigate to project root
cd /path/to/ai-spec-kit

# Install dependencies
npm install

# Install dev dependencies for TypeScript and Jest
npm install --save-dev typescript @types/node jest @types/jest ts-jest
```

### 2. Configure TypeScript

Create `tsconfig.json` in project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests", "dist"]
}
```

### 3. Configure Jest

Create `jest.config.js` in project root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### 4. Create Directory Structure

```bash
mkdir -p src/shared/lib src/shared/types
mkdir -p src/entities/task src/entities/task-list
mkdir -p src/features/add-task src/features/list-tasks src/features/complete-task
mkdir -p src/widgets
mkdir -p tests/unit/entities tests/unit/features tests/unit/shared tests/integration tests/mocks
```

## Development Workflow (TDD)

### Step 1: Write Tests First

Create a test file for a feature: `tests/unit/features/add-task/use-case.test.ts`

```typescript
import { AddTaskUseCase } from '../../../../src/features/add-task/use-case';
import { TaskList } from '../../../../src/entities/task-list';

describe('AddTaskUseCase', () => {
  it('should add a task with the given title', () => {
    const taskList = new TaskList();
    const useCase = new AddTaskUseCase(taskList);
    
    const task = useCase.execute('Buy milk');
    
    expect(task.title).toBe('Buy milk');
    expect(task.status).toBe('pending');
  });

  it('should reject empty titles', () => {
    const taskList = new TaskList();
    const useCase = new AddTaskUseCase(taskList);
    
    expect(() => useCase.execute('')).toThrow();
  });
});
```

### Step 2: Run Tests (Should Fail)

```bash
npm test -- tests/unit/features/add-task/use-case.test.ts
# Tests fail because implementation doesn't exist yet
```

### Step 3: Implement Code to Pass Tests

Create `src/features/add-task/use-case.ts`:

```typescript
import { Task } from '../../entities/task/model';
import { TaskList } from '../../entities/task-list';

export class AddTaskUseCase {
  constructor(private taskList: TaskList) {}

  execute(title: string): Task {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    return this.taskList.addTask(title.trim());
  }
}
```

### Step 4: Run Tests Again (Should Pass)

```bash
npm test -- tests/unit/features/add-task/use-case.test.ts
# Tests pass
```

### Step 5: Refactor If Needed

Improve code quality while keeping tests passing.

## Build and Run

### Build TypeScript

```bash
npm run build
# Outputs to ./dist
```

### Run the CLI

```bash
# Compile first
npx tsc

# Run with node
node dist/index.js add "Learn TypeScript"
node dist/index.js list
node dist/index.js complete <id>
```

### Create npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src tests",
    "start": "node dist/index.js"
  }
}
```

## Testing Strategy

### Unit Tests (70% coverage)
- Test each entity method
- Test each use case
- Mock file system and external dependencies

### Integration Tests
- Test full CLI command flow
- Test file I/O (with temp files)
- Test error scenarios

### Test Organization

```
tests/
├── unit/
│   ├── entities/task.test.ts
│   ├── entities/task-list.test.ts
│   ├── features/add-task.test.ts
│   ├── features/list-tasks.test.ts
│   ├── features/complete-task.test.ts
│   └── shared/file-system.test.ts
├── integration/
│   └── cli-flow.test.ts
└── mocks/
    └── file-system.mock.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch

# Run specific test file
npm test -- tests/unit/entities/task.test.ts
```

## File Locations

- **Source code**: `src/`
- **Tests**: `tests/`
- **Built output**: `dist/` (after build)
- **Configuration**: `tsconfig.json`, `jest.config.js`, `package.json`
- **Persistence**: `tasks.json` (created at runtime)

## Common Development Tasks

### Add a New Feature

1. Create feature directory: `src/features/my-feature/`
2. Write use case tests first: `tests/unit/features/my-feature/use-case.test.ts`
3. Implement use case: `src/features/my-feature/use-case.ts`
4. Export from index: `src/features/my-feature/index.ts`
5. Import in main app: `src/index.ts`
6. Write integration tests
7. Run full test suite

### Debug Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test
npm test -- -t "should add a task"

# Debug in VS Code (add .vscode/launch.json)
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Check Types

```bash
npx tsc --noEmit
```

## Architecture Principles (FSD)

- **shared/**: Cross-cutting utilities, types, common logic
- **entities/**: Business domain models and rules
- **features/**: User-facing functionality (use cases)
- **widgets/**: Reusable CLI components
- Each feature is independently testable and deployable

## Next Steps

After development:
1. Ensure 70%+ test coverage: `npm run test:coverage`
2. Check TypeScript strict mode: `npx tsc --noEmit`
3. Build project: `npm run build`
4. Test the CLI: `node dist/index.js list`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install`, check import paths |
| Tests fail to run | Ensure Jest config references `ts-jest` preset |
| TypeScript errors | Run `npx tsc --noEmit` to check full compilation |
| File not found errors | Check that relative paths are correct, use `__dirname` if needed |

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Node.js fs API](https://nodejs.org/api/fs.html)
