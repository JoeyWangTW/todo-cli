import blessed from 'blessed';

class UIManager {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
      title: 'todo-cli'
    });

    this.taskList = blessed.box({
      parent: this.screen,
      label: ' TODO ',
      left: 0,
      top: 0,
      width: '40%',
      bottom: 2,
      border: { type: 'line' },
      scrollable: true,
      keys: true,
      vi: true,
      mouse: false,
      style: {
        border: { fg: 'cyan' },
        focus: { border: { fg: 'green' } }
      }
    });

    this.previewBox = blessed.box({
      parent: this.screen,
      label: ' AGENT PREVIEW ',
      left: '40%',
      top: 0,
      width: '60%',
      bottom: 2,
      border: { type: 'line' },
      scrollable: true,
      keys: true,
      tags: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        style: { bg: 'blue' }
      },
      style: {
        border: { fg: 'cyan' }
      }
    });

    // Status message line (for notifications)
    this.statusMessage = blessed.box({
      parent: this.screen,
      left: 0,
      bottom: 1,
      width: '100%',
      height: 1,
      content: '',
      style: {
        bg: 'black',
        fg: 'yellow'
      }
    });

    // Shortcut hints line (always visible)
    this.shortcutBar = blessed.box({
      parent: this.screen,
      left: 0,
      bottom: 0,
      width: '100%',
      height: 1,
      content: ' [a]Add [Enter]Open session(Ctrl+q to quit) [x]Done [d]Delete | "["/""]" Scroll up/down  [g]Jump to bottom | [q]Quit',
      style: {
        bg: 'black',
        fg: 'cyan'
      }
    });

    this.taskList.focus();
  }

  render() {
    this.screen.render();
  }

  destroy() {
    this.screen.destroy();
  }
}

export default UIManager;
