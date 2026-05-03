import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { readTasks, writeTasks } from '../../../src/shared/lib/storage';
import { Task } from '../../../src/shared/types/task';

describe('storage', () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `tasks-test-${Date.now()}.json`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  describe('readTasks', () => {
    it('returns empty array when file does not exist', () => {
      expect(readTasks(tmpFile)).toEqual([]);
    });

    it('returns tasks array when file exists', () => {
      const tasks: Task[] = [{ id: 1, title: 'Test', status: 'pending' }];
      fs.writeFileSync(tmpFile, JSON.stringify({ version: '1.0', tasks }));
      expect(readTasks(tmpFile)).toEqual(tasks);
    });

    it('returns empty array when file contains invalid JSON', () => {
      fs.writeFileSync(tmpFile, 'not-json');
      expect(readTasks(tmpFile)).toEqual([]);
    });
  });

  describe('writeTasks', () => {
    it('creates the file with tasks', () => {
      const tasks: Task[] = [{ id: 1, title: 'Buy milk', status: 'pending' }];
      writeTasks(tmpFile, tasks);
      const raw = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
      expect(raw.tasks).toEqual(tasks);
      expect(raw.version).toBe('1.0');
    });

    it('overwrites existing file', () => {
      const tasks1: Task[] = [{ id: 1, title: 'First', status: 'pending' }];
      const tasks2: Task[] = [{ id: 2, title: 'Second', status: 'done' }];
      writeTasks(tmpFile, tasks1);
      writeTasks(tmpFile, tasks2);
      expect(readTasks(tmpFile)).toEqual(tasks2);
    });
  });
});
