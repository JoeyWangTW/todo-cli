import { spawn } from 'child_process';

class TmuxService {
  async createSession(sessionName, prompt, workDir = process.cwd(), width = 80, height = 24, yoloMode = false) {
    return new Promise((resolve, reject) => {
      // Use -i flag to start interactive mode with initial prompt
      // Set window size to match preview box dimensions
      const args = [
        'new-session', '-d',
        '-s', sessionName,
        '-x', width.toString(),
        '-y', height.toString(),
        '-c', workDir,
        'gemini', '-i', prompt
      ];

      // Add --yolo flag if YOLO mode is enabled
      if (yoloMode) {
        args.push('--yolo');
      }

      const proc = spawn('tmux', args);
      let stderr = '';

      proc.stderr.on('data', (data) => stderr += data.toString());

      proc.on('close', (code) => {
        if (code === 0) {
          // Force the window size to be fixed (prevent auto-resize)
          const resizeProc = spawn('tmux', [
            'set-window-option', '-t', sessionName,
            'aggressive-resize', 'off'
          ]);
          resizeProc.on('close', () => {
            // Lock the window to the exact size
            const lockProc = spawn('tmux', [
              'resize-window', '-t', sessionName,
              '-x', width.toString(),
              '-y', height.toString()
            ]);
            lockProc.on('close', () => resolve());
          });
        } else {
          reject(new Error(`tmux create failed: ${stderr}`));
        }
      });
    });
  }

  async captureOutput(sessionName, lines = 50) {
    return new Promise((resolve) => {
      const args = [
        'capture-pane',
        '-t', sessionName,
        '-p', '-e', '-J',
        '-S', `-${lines}`
      ];

      const proc = spawn('tmux', args);
      let stdout = '';

      proc.stdout.on('data', (data) => stdout += data.toString());

      proc.on('close', (code) => {
        resolve(code === 0 ? stdout : '');
      });
    });
  }

  async attachToSession(sessionName) {
    // Set Ctrl+q to detach before attaching
    await new Promise((resolve) => {
      const bindProc = spawn('tmux', ['bind-key', '-n', 'C-q', 'detach-client']);
      bindProc.on('close', () => resolve());
    });

    return new Promise((resolve) => {
      const proc = spawn('tmux', ['attach', '-t', sessionName], {
        stdio: 'inherit'
      });

      proc.on('close', (code) => resolve(code));
    });
  }

  async killSession(sessionName) {
    return new Promise((resolve) => {
      const proc = spawn('tmux', ['kill-session', '-t', sessionName]);
      proc.on('close', () => resolve());
    });
  }

  async sessionExists(sessionName) {
    return new Promise((resolve) => {
      const proc = spawn('tmux', ['has-session', '-t', sessionName]);
      proc.on('close', (code) => resolve(code === 0));
    });
  }
}

export default TmuxService;
