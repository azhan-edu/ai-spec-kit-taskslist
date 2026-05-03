import { ListTasksUseCase } from '../../../src/features/list-tasks';
import { TaskStore } from '../../../src/entities/task';

describe('ListTasksUseCase', () => {
  it('returns empty array when no tasks', () => {
    const store = new TaskStore([]);
    expect(new ListTasksUseCase(store).execute()).toEqual([]);
  });

  it('returns all tasks ordered by id ascending', () => {
    const store = new TaskStore([
      { id: 3, title: 'C', status: 'pending' },
      { id: 1, title: 'A', status: 'done' },
      { id: 2, title: 'B', status: 'pending' },
    ]);
    const tasks = new ListTasksUseCase(store).execute();
    expect(tasks.map((t) => t.id)).toEqual([1, 2, 3]);
  });
});
