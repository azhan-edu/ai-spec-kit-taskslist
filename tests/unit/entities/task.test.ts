import { TaskStore } from '../../../src/entities/task';

describe('TaskStore', () => {
  let store: TaskStore;

  beforeEach(() => {
    store = new TaskStore([]);
  });

  describe('addTask', () => {
    it('creates a pending task with sequential id starting at 1', () => {
      const task = store.addTask('Buy milk');
      expect(task.id).toBe(1);
      expect(task.title).toBe('Buy milk');
      expect(task.status).toBe('pending');
    });

    it('increments id for each new task', () => {
      store.addTask('First');
      const second = store.addTask('Second');
      expect(second.id).toBe(2);
    });

    it('continues from max existing id when initialised with tasks', () => {
      const existing = new TaskStore([{ id: 5, title: 'Old', status: 'done' }]);
      const task = existing.addTask('New');
      expect(task.id).toBe(6);
    });
  });

  describe('getTasks', () => {
    it('returns empty array when no tasks', () => {
      expect(store.getTasks()).toEqual([]);
    });

    it('returns all tasks ordered by id ascending', () => {
      store.addTask('A');
      store.addTask('B');
      const tasks = store.getTasks();
      expect(tasks[0].id).toBe(1);
      expect(tasks[1].id).toBe(2);
    });
  });

  describe('completeTask', () => {
    it('changes status to done', () => {
      const task = store.addTask('Do something');
      store.completeTask(task.id);
      expect(store.getTaskById(task.id)?.status).toBe('done');
    });

    it('throws when task id does not exist', () => {
      expect(() => store.completeTask(999)).toThrow();
    });
  });

  describe('getTaskById', () => {
    it('returns the task when found', () => {
      const task = store.addTask('Find me');
      expect(store.getTaskById(task.id)).toEqual(task);
    });

    it('returns undefined when not found', () => {
      expect(store.getTaskById(999)).toBeUndefined();
    });
  });
});
