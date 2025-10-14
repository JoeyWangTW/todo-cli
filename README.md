# todo-cli

> The todo app that actually gets things done.

A terminal-based task manager where AI agents finish your todos for you. Powered by Gemini CLI and MCP tools.
Why?
The best todo list isn't one that tracks tasks—it's one that completes them.
Inspired by [claude-squad](https://github.com/smtg-ai/claude-squad?tab=readme-ov-file), todo-cli runs multiple AI agents in parallel, each working on a different task. But instead of coding agents, these are personal assistant agents that can:

- 📧 Check your email and make phone calls
- 🗺️ Search for services and request quotes
- 📅 Schedule meetings and manage your calendar
- 🔍 Research topics and compile reports
  ...and anything else you can describe in a prompt

## Features

- 📋 **Terminal UI** - Full-screen todo list built with blessed
- 🤖 **AI Agent Integration** - Each task automatically gets a Gemini CLI agent in a tmux session
- 👀 **Real-time Preview** - Watch agent output in split-screen view (40/60 layout)
- ⌨️ **Keyboard-driven** - Vim-like navigation and shortcuts
- 💾 **Persistent Storage** - Tasks saved to `~/.config/todo-cli/tasks.json`
- 🎯 **YOLO Mode** - Optional auto-approval for agent actions
- ✏️ **External Editor** - Press Ctrl+E to edit in vim/nano

## Prerequisites

- **Node.js v18+**
- **tmux 2.6+** - Install with `brew install tmux` (macOS) or `apt install tmux` (Linux)
- **Gemini CLI** - Follow installation at https://ai.google.dev/gemini-api/docs/cli

## Usage

### Setup Gemini-cli:

#### Allow Gemini-cli to use custom system prompt under `.gemini`

```bash
cp .env.example .env
```

There is an example `system.md` under `.gemini`, it includes [ElevenLabs Agent prompting guide](https://elevenlabs.io/docs/agents-platform/best-practices/prompting-guide) to optimize phone calls. Update the system prompt to adjust what you want to agent to do

#### Setup tools

Setup [MCP](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md) or [Extention](https://geminicli.com/extensions/) to extend agent capability

Some useful MCPs:

- [Google Map](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/google-maps) to get location data
- [Gmail](https://github.com/GongRzhe/Gmail-MCP-Server) to access gmail, get information or send out email
- [Google Calendar](https://github.com/GongRzhe/Gmail-MCP-Server) to access calendar, get events or update calendar
- [Eleven Labs](https://github.com/elevenlabs/elevenlabs-mcp) to create conversational agents for phone calls

**Note:** MCP servers run with the same permissions as your user account. Only connect to trusted MCP servers and review their code before use.

### Provide Context for Your Agent

Create text files in the `/user_data` directory to give your agent access to important information. The agent can read these files when needed using Gemini CLI's built-in file reading and search capabilities.

This simple file-based approach provides persistent memory - your preferences, account details, and context are stored as regular text files that you can easily view and edit.

### Start using

Start the application:

```bash
npm start
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

## Next steps

- Come up with a better approach to manage personal info as context.
- Allow using different agent (codex, claude-code) if they have a way to replace the system prompt
- Communicate between agent and todo tasks, right now gemini-cli doesn't have hooks, so there's no direct way check if the task is done or not. Still needs manual update
- Better MCP/Extension installation, right now its still cumbersome to setup

## License

MIT
