import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { readTasks, writeTasks } from '../../src/shared/lib/storage';
import { TaskStore } from '../../src/entities/task';
import { AddTaskUseCase } from '../../src/features/add-task';
import { ListTasksUseCase } from '../../src/features/list-tasks';
import { CompleteTaskUseCase } from '../../src/features/complete-task';

describe('CLI flow integration: add → list → complete', () => {
  let tasksFile: string;

  beforeEach(() => {
    tasksFile = path.join(os.tmpdir(), `tasks-integration-${Date.now()}.json`);
  });

  afterEach(() => {
    if (fs.existsSync(tasksFile)) fs.unlinkSync(tasksFile);
  });

  function buildStore(): TaskStore {
    return new TaskStore(readTasks(tasksFile));
  }

  function persist(store: TaskStore): void {
    writeTasks(tasksFile, store.toArray());
  }

  it('full flow: add two tasks, list them, complete one', () => {
    // Add
    let store = buildStore();
    new AddTaskUseCase(store).execute('Buy groceries');
    new AddTaskUseCase(store).execute('Learn TypeScript');
    persist(store);

    // List
    store = buildStore();
    const tasks = new ListTasksUseCase(store).execute();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({ id: 1, title: 'Buy groceries', status: 'pending' });
    expect(tasks[1]).toMatchObject({ id: 2, title: 'Learn TypeScript', status: 'pending' });

    // Complete
    store = buildStore();
    new CompleteTaskUseCase(store).execute(1);
    persist(store);

    // Verify persistence
    store = buildStore();
    expect(store.getTaskById(1)?.status).toBe('done');
    expect(store.getTaskById(2)?.status).toBe('pending');
  });

  it('tasks persist across store reloads', () => {
    let store = buildStore();
    new AddTaskUseCase(store).execute('Persisted task');
    persist(store);

    store = buildStore();
    expect(store.getTasks()).toHaveLength(1);
    expect(store.getTasks()[0].title).toBe('Persisted task');
  });

  it('ids are sequential across separate store instances', () => {
    let store = buildStore();
    new AddTaskUseCase(store).execute('First');
    persist(store);

    store = buildStore();
    new AddTaskUseCase(store).execute('Second');
    persist(store);

    store = buildStore();
    const tasks = store.getTasks();
    expect(tasks[0].id).toBe(1);
    expect(tasks[1].id).toBe(2);
  });

  it('completing a non-existent id throws', () => {
    const store = buildStore();
    expect(() => new CompleteTaskUseCase(store).execute(999)).toThrow(
      'Task not found with ID: 999'
    );
  });
});
