import { Task } from '../../shared/types/task';
import { TaskStore } from '../../entities/task';

export class CompleteTaskUseCase {
  constructor(private store: TaskStore) {}

  execute(id: number): Task {
    return this.store.completeTask(id);
  }
}
