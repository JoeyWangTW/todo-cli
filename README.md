# todo-cli

A terminal-based todo application that automatically spawns AI agents for each task using tmux and Gemini CLI.

## Features

- 📋 **Terminal UI** - Full-screen todo list built with blessed
- 🤖 **AI Agent Integration** - Each task automatically gets a Gemini CLI agent in a tmux session
- 👀 **Real-time Preview** - Watch agent output in split-screen view (40/60 layout)
- ⌨️  **Keyboard-driven** - Vim-like navigation and shortcuts
- 💾 **Persistent Storage** - Tasks saved to `~/.config/todo-cli/tasks.json`
- 🎯 **YOLO Mode** - Optional auto-approval for agent actions
- ✏️  **External Editor** - Press Ctrl+E to edit in vim/nano

## Prerequisites

- **Node.js v18+**
- **tmux 2.6+** - Install with `brew install tmux` (macOS) or `apt install tmux` (Linux)
- **Gemini CLI** - Follow installation at https://ai.google.dev/gemini-api/docs/cli

## Installation

```bash
npm install
npm link  # For global access
```

Or run directly:
```bash
npm start
```

## Usage

Start the application:
```bash
todo-cli
```

### Keyboard Shortcuts

#### Task Management
- `a` - Add new task (title → details → YOLO mode)
- `Enter` - Open/attach to agent session (Ctrl+q to return)
- `x` - Toggle task done/undone
- `d` - Delete task and kill session
- `j/k` or `↑/↓` - Navigate tasks

#### Preview Navigation
- `[` - Scroll preview up
- `]` - Scroll preview down
- `g` - Jump to bottom of preview

#### Application
- `q` - Quit application

#### Input Modal
- `Enter` - Submit and move to next step
- `Ctrl+E` - Open external editor ($EDITOR) for full cursor control
- `Escape` - Cancel

## Creating Tasks

When you add a task, you'll be prompted for:

1. **Task Title** - Brief description of what to do
2. **Details** (optional) - Additional context for the agent
3. **YOLO Mode** (y/N) - Auto-approve all agent actions

**Tip:** Press Ctrl+E in any input field to open your `$EDITOR` (vim/nano) for full text editing with cursor movement!

## UI Layout

```
┌─ TODO ──────────────┬─ AGENT PREVIEW ──────────────────┐
│                     │                                   │
│  > ☐ Task 1         │ [Session: gemini-task-abc123]    │
│    ☐ Task 2         │ [Started: 10:30:45 AM]           │
│    ✓ Task 3 (done)  │                                   │
│                     │ Agent output appears here...      │
│                     │                                   │
│  [3 tasks]          │                                   │
│                     │                                   │
└─────────────────────┴───────────────────────────────────┘
 Status: ✓ Task created: gemini-task-abc123
 [a]Add [Enter]Open session(Ctrl+q) [x]Done [d]Delete | "["/""]" Scroll [g]Bottom [q]Quit
```

## Architecture

- **blessed** - Terminal UI framework
- **lowdb** - JSON file storage
- **tmux** - Process isolation for agent sessions
- **nanoid** - Unique ID generation

### Directory Structure

```
todo-cli/
├── bin/
│   └── todo-cli.js          # Entry point with dependency checks
├── src/
│   ├── app.js               # Main application logic
│   ├── models/
│   │   └── task.js          # Task data model
│   ├── services/
│   │   ├── storage.js       # lowdb persistence layer
│   │   └── tmux.js          # tmux session management
│   └── ui/
│       ├── screen.js        # blessed UI layout
│       └── modal.js         # Task creation modal
└── package.json
```

## How It Works

1. **Create Task** - Enter title, details, and YOLO mode preference
2. **Spawn Agent** - Creates a tmux session running `gemini -i "{prompt}"` (or with `--yolo`)
3. **Preview Output** - Captures tmux pane output every second
4. **Auto-scroll** - Shows latest agent output automatically
5. **Manual Control** - Scroll up with `[` to read history, press `g` to jump to bottom
6. **Attach Session** - Press Enter to attach full-screen, Ctrl+q to return

## Tips

- **Cursor Movement**: Press Ctrl+E in input fields to open vim/nano for full editing
- **YOLO Mode**: Tasks with YOLO mode enabled let agents execute actions without confirmation
- **Auto-scroll**: Preview auto-scrolls to show new output; scroll up manually to pause
- **Session Isolation**: Each task runs in an isolated tmux session that persists until deleted
- **Clean Termination**: When you delete a task, its tmux session is automatically killed

## Notes

- Tasks are stored in `~/.config/todo-cli/tasks.json`
- View all sessions: `tmux ls`
- Kill session manually: `tmux kill-session -t gemini-task-{id}`

## License

MIT
