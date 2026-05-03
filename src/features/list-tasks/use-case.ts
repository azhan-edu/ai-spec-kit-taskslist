import { Task } from '../../shared/types/task';
import { TaskStore } from '../../entities/task';

export class ListTasksUseCase {
  constructor(private store: TaskStore) {}

  execute(): Task[] {
    return this.store.getTasks();
  }
}
