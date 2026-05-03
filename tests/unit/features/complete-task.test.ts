import { CompleteTaskUseCase } from '../../../src/features/complete-task';
import { TaskStore } from '../../../src/entities/task';

describe('CompleteTaskUseCase', () => {
  it('marks a pending task as done', () => {
    const store = new TaskStore([{ id: 1, title: 'Buy milk', status: 'pending' }]);
    const task = new CompleteTaskUseCase(store).execute(1);
    expect(task.status).toBe('done');
    expect(store.getTaskById(1)?.status).toBe('done');
  });

  it('throws when task id does not exist', () => {
    const store = new TaskStore([]);
    expect(() => new CompleteTaskUseCase(store).execute(999)).toThrow(
      'Task not found with ID: 999'
    );
  });
});
