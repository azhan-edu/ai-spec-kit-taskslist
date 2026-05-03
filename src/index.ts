import * as path from 'path';
import { readTasks, writeTasks } from './shared/lib/storage';
import { TaskStore } from './entities/task';
import { AddTaskUseCase } from './features/add-task';
import { ListTasksUseCase } from './features/list-tasks';
import { CompleteTaskUseCase } from './features/complete-task';

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

const USAGE = `Usage: task-manager <command>

Commands:
  add <title>      Add a new task
  list             List all tasks
  complete <id>    Mark a task as done`;

const [, , command, ...args] = process.argv;

function loadStore(): TaskStore {
  return new TaskStore(readTasks(TASKS_FILE));
}

function saveStore(store: TaskStore): void {
  writeTasks(TASKS_FILE, store.toArray());
}

function handleAdd(): void {
  const title = args.join(' ');
  const store = loadStore();
  try {
    const task = new AddTaskUseCase(store).execute(title);
    saveStore(store);
    process.stdout.write(`✓ Task added: ${task.id}\nTitle: ${task.title}\nStatus: ${task.status}\n`);
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\nUsage: add <title>\n`);
    process.exit(1);
  }
}

function handleComplete(): void {
  const raw = args[0];
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) {
    process.stderr.write(`Error: Invalid ID: '${raw}' is not a number\nUsage: complete <id>\n`);
    process.exit(1);
  }
  const store = loadStore();
  const existing = store.getTaskById(id);
  if (existing?.status === 'done') {
    process.stdout.write(`ℹ Task ${id} is already done.\n`);
    process.exit(0);
  }
  try {
    const task = new CompleteTaskUseCase(store).execute(id);
    saveStore(store);
    process.stdout.write(`✓ Task completed: ${task.id}\nTitle: ${task.title}\n`);
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\nHint: Run \`list\` to see valid task IDs\n`);
    process.exit(1);
  }
}

function handleList(): void {
  const store = loadStore();
  const tasks = new ListTasksUseCase(store).execute();
  if (tasks.length === 0) {
    process.stdout.write('No tasks found.\n');
    process.exit(0);
  }
  const header = `${'ID'.padEnd(4)}${'Status'.padEnd(12)}Title`;
  const rows = tasks.map((t) =>
    `${String(t.id).padEnd(4)}${t.status.padEnd(12)}${t.title}`
  );
  process.stdout.write([header, ...rows].join('\n') + '\n');
  process.exit(0);
}

switch (command) {
  case 'add':
    handleAdd();
    break;
  case 'list':
    handleList();
    break;
  case 'complete':
    handleComplete();
    break;
  default:
    process.stderr.write(`${USAGE}\n`);
    process.exit(1);
}
