import { nanoid } from 'nanoid';

class Task {
  constructor(title, details = '') {
    this.id = nanoid();
    this.title = title.trim();
    this.details = details.trim();
    this.done = false;
    this.sessionName = `gemini-task-${this.id}`;
    this.createdAt = new Date().toISOString();

    this.validate();
  }

  validate() {
    if (!this.title || this.title.length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (this.title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters');
    }
    if (this.details.length > 2000) {
      throw new Error('Task details cannot exceed 2000 characters');
    }
  }

  buildPrompt() {
    return this.details.length > 0
      ? `${this.title}. ${this.details}`
      : this.title;
  }

  toggleDone() {
    this.done = !this.done;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      details: this.details,
      done: this.done,
      sessionName: this.sessionName,
      createdAt: this.createdAt
    };
  }

  static fromJSON(json) {
    const task = Object.create(Task.prototype);
    Object.assign(task, json);
    return task;
  }
}

export default Task;
