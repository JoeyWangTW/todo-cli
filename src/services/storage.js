import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import os from 'os';
import fs from 'fs';
import Task from '../models/task.js';

class Storage {
  constructor() {
    this.db = null;
  }

  async init() {
    const configDir = path.join(os.homedir(), '.config', 'todo-cli');
    const dbPath = path.join(configDir, 'tasks.json');

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const adapter = new JSONFile(dbPath);
    this.db = new Low(adapter, { tasks: [] });
    await this.db.read();
  }

  async loadTasks() {
    await this.db.read();
    return this.db.data.tasks.map(json => Task.fromJSON(json));
  }

  async saveTasks(tasks) {
    this.db.data.tasks = tasks.map(task => task.toJSON());
    await this.db.write();
  }
}

export default Storage;
