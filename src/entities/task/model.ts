import { Task } from '../../shared/types/task';

export class TaskStore {
  private tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = [...tasks];
  }

  private nextId(): number {
    if (this.tasks.length === 0) return 1;
    return Math.max(...this.tasks.map((t) => t.id)) + 1;
  }

  addTask(title: string): Task {
    const task: Task = { id: this.nextId(), title, status: 'pending' };
    this.tasks.push(task);
    return task;
  }

  getTasks(): Task[] {
    return [...this.tasks].sort((a, b) => a.id - b.id);
  }

  completeTask(id: number): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task not found with ID: ${id}`);
    task.status = 'done';
    return task;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  toArray(): Task[] {
    return [...this.tasks];
  }
}
