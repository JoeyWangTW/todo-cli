import UIManager from './ui/screen.js';
import showAddTaskModal from './ui/modal.js';
import TmuxService from './services/tmux.js';
import Storage from './services/storage.js';
import Task from './models/task.js';

class TodoApp {
  constructor() {
    this.tasks = [];
    this.selectedIndex = 0;
    this.scrollPositions = {}; // Track scroll position per task ID
    this.lastOutputs = {}; // Track last output to detect new content
    this.manualScroll = {}; // Track if user manually scrolled per task ID
    this.ui = new UIManager();
    this.tmux = new TmuxService();
    this.storage = new Storage();
  }

  async init() {
    await this.storage.init();
    this.tasks = await this.storage.loadTasks();
    this.setupKeyBindings();
    this.startUpdateLoop();
    this.updateUI();
  }

  setupKeyBindings() {
    this.ui.screen.key(['q', 'C-c'], async () => {
      await this.cleanup();
    });

    this.ui.screen.key(['a'], () => {
      showAddTaskModal(
        this.ui.screen,
        async (title, details, yoloMode) => {
          await this.addTask(title, details, yoloMode);
        },
        () => {
          this.ui.taskList.focus();
        }
      );
    });

    this.ui.taskList.key(['up', 'k'], () => {
      this.navigateUp();
    });

    this.ui.taskList.key(['down', 'j'], () => {
      this.navigateDown();
    });

    this.ui.taskList.key(['enter'], async () => {
      await this.attachToTask();
    });

    this.ui.taskList.key(['x'], async () => {
      await this.toggleDone();
    });

    this.ui.taskList.key(['d'], async () => {
      await this.deleteTask();
    });

    // Bind scroll keys to screen (not previewBox) so they work without focus
    // Use [ and ] for scrolling (like vim buffer navigation)
    this.ui.screen.key(['['], () => {
      const task = this.tasks[this.selectedIndex];
      if (task) {
        this.ui.previewBox.scroll(-1);
        this.manualScroll[task.id] = true; // Mark as manually scrolled
        this.ui.render();
      }
    });

    this.ui.screen.key([']'], () => {
      const task = this.tasks[this.selectedIndex];
      if (task) {
        this.ui.previewBox.scroll(1);
        this.manualScroll[task.id] = true; // Mark as manually scrolled
        this.ui.render();
      }
    });

    // Jump to bottom with 'g'
    this.ui.screen.key(['g'], () => {
      const task = this.tasks[this.selectedIndex];
      if (task) {
        this.manualScroll[task.id] = false; // Allow auto-scroll again
        this.ui.previewBox.setScroll(this.ui.previewBox.getScrollHeight());
        this.ui.render();
      }
    });
  }

  async addTask(title, details, yoloMode = false) {
    const task = new Task(title, details, yoloMode);
    this.tasks.push(task);

    try {
      // Get actual terminal dimensions from blessed screen
      const termWidth = this.ui.screen.width;
      const termHeight = this.ui.screen.height;

      // 60% width for preview box, minus 2 for borders
      const width = Math.floor(termWidth * 0.6) - 2;
      // Full height minus 2 lines at bottom, minus 2 for borders
      const height = termHeight - 4;

      this.showStatus(`Creating session (${width}x${height})...`);

      await this.tmux.createSession(task.sessionName, task.buildPrompt(), process.cwd(), width, height, yoloMode);
      this.showStatus(`✓ Task created: ${task.sessionName}`);
    } catch (err) {
      this.showStatus(`✗ Error creating session: ${err.message}`);
    }

    await this.storage.saveTasks(this.tasks);
    this.selectedIndex = this.tasks.length - 1;
    this.updateUI();
  }

  navigateUp() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateUI();
      this.resetScroll();
    }
  }

  navigateDown() {
    if (this.selectedIndex < this.tasks.length - 1) {
      this.selectedIndex++;
      this.updateUI();
      this.resetScroll();
    }
  }

  resetScroll() {
    // Reset preview box scroll to bottom when switching tasks
    // Also reset manual scroll flag for the new task
    const task = this.tasks[this.selectedIndex];
    if (task) {
      this.manualScroll[task.id] = false;
    }

    this.ui.render();
    setImmediate(() => {
      this.ui.previewBox.setScroll(this.ui.previewBox.getScrollHeight());
      this.ui.render();
    });
  }

  async attachToTask() {
    const task = this.tasks[this.selectedIndex];
    if (!task) return;

    const exists = await this.tmux.sessionExists(task.sessionName);
    if (!exists) {
      this.showStatus('✗ Error: Session not found');
      return;
    }

    this.ui.destroy();
    await this.tmux.attachToSession(task.sessionName);

    // Recreate UI after detaching from tmux
    this.ui = new UIManager();
    this.setupKeyBindings();
    this.startUpdateLoop();
    this.updateUI();
  }

  async toggleDone() {
    const task = this.tasks[this.selectedIndex];
    if (!task) return;

    task.toggleDone();
    await this.storage.saveTasks(this.tasks);
    this.updateUI();
  }

  async deleteTask() {
    const task = this.tasks[this.selectedIndex];
    if (!task) return;

    await this.tmux.killSession(task.sessionName);
    this.tasks.splice(this.selectedIndex, 1);
    await this.storage.saveTasks(this.tasks);

    if (this.selectedIndex >= this.tasks.length) {
      this.selectedIndex = Math.max(0, this.tasks.length - 1);
    }

    this.updateUI();
  }

  updateUI() {
    if (this.tasks.length === 0) {
      this.ui.taskList.setContent('\n No tasks yet\n\n Press [a] to add a task');
      this.ui.previewBox.setContent('\n [No task selected]');
    } else {
      const lines = this.tasks.map((task, index) => {
        const checkbox = task.done ? '' : '';
        const prefix = index === this.selectedIndex ? ' > ' : '   ';
        return `${prefix}${checkbox} ${task.title}`;
      });
      lines.push('');
      lines.push(` [${this.tasks.length} tasks]`);
      this.ui.taskList.setContent('\n' + lines.join('\n'));
    }

    this.ui.render();
  }

  startUpdateLoop() {
    setInterval(async () => {
      const task = this.tasks[this.selectedIndex];
      if (task) {
        const output = await this.tmux.captureOutput(task.sessionName);
        if (output) {
          const header = ` [Session: ${task.sessionName}]\n [Started: ${new Date(task.createdAt).toLocaleTimeString()}]\n`;
          const fullContent = header + output;

          // Check if content has changed (new output)
          const lastOutput = this.lastOutputs[task.id];
          const hasNewContent = lastOutput !== output;

          this.ui.previewBox.setContent(fullContent);

          // Only auto-scroll if user hasn't manually scrolled AND there's new content
          if (!this.manualScroll[task.id]) {
            setImmediate(() => {
              const scrollHeight = this.ui.previewBox.getScrollHeight();
              this.ui.previewBox.setScroll(scrollHeight);
              this.ui.render();
            });
          } else {
            this.ui.render();
          }

          if (hasNewContent) {
            this.lastOutputs[task.id] = output;
            // Reset manual scroll flag on new content so it auto-scrolls to show new output
            this.manualScroll[task.id] = false;
          }
        } else {
          this.ui.previewBox.setContent('\n [No active session]');
          this.ui.render();
        }
      }
    }, 1000);
  }

  showStatus(message) {
    this.ui.statusMessage.setContent(` ${message}`);
    this.ui.render();

    // Clear status after 3 seconds
    setTimeout(() => {
      this.ui.statusMessage.setContent('');
      this.ui.render();
    }, 3000);
  }

  async cleanup() {
    await this.storage.saveTasks(this.tasks);
    this.ui.destroy();
    process.exit(0);
  }
}

export default TodoApp;
