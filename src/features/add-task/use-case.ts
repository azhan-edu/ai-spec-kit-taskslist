import { Task } from '../../shared/types/task';
import { TaskStore } from '../../entities/task';

export class AddTaskUseCase {
  constructor(private store: TaskStore) {}

  execute(title: string): Task {
    const trimmed = title.trim();
    if (!trimmed) throw new Error('Task title cannot be empty');
    return this.store.addTask(trimmed);
  }
}
