import * as fs from 'fs';
import { Task, TasksFile } from '../types/task';

export function readTasks(filePath: string): Task[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data: TasksFile = JSON.parse(raw);
    return data.tasks ?? [];
  } catch {
    return [];
  }
}

export function writeTasks(filePath: string, tasks: Task[]): void {
  const data: TasksFile = { version: '1.0', tasks };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
