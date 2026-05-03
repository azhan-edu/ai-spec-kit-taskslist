import { AddTaskUseCase } from '../../../src/features/add-task';
import { TaskStore } from '../../../src/entities/task';

describe('AddTaskUseCase', () => {
  let store: TaskStore;
  let useCase: AddTaskUseCase;

  beforeEach(() => {
    store = new TaskStore([]);
    useCase = new AddTaskUseCase(store);
  });

  it('creates a pending task with the given title', () => {
    const task = useCase.execute('Buy groceries');
    expect(task.title).toBe('Buy groceries');
    expect(task.status).toBe('pending');
    expect(task.id).toBe(1);
  });

  it('trims whitespace from title', () => {
    const task = useCase.execute('  Learn TypeScript  ');
    expect(task.title).toBe('Learn TypeScript');
  });

  it('throws when title is empty', () => {
    expect(() => useCase.execute('')).toThrow('Task title cannot be empty');
  });

  it('throws when title is whitespace only', () => {
    expect(() => useCase.execute('   ')).toThrow('Task title cannot be empty');
  });
});
