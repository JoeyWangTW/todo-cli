#!/usr/bin/env node

import { spawn } from 'child_process';
import TodoApp from '../src/app.js';

async function checkDependency(command) {
  return new Promise((resolve) => {
    const proc = spawn('which', [command]);
    proc.on('close', (code) => resolve(code === 0));
  });
}

async function checkDependencies() {
  const hasTmux = await checkDependency('tmux');
  const hasGemini = await checkDependency('gemini');

  if (!hasTmux) {
    console.error('ERROR: tmux is not installed');
    console.error('Install with: brew install tmux (macOS) or apt install tmux (Linux)');
    process.exit(1);
  }

  if (!hasGemini) {
    console.error('ERROR: gemini CLI is not installed');
    console.error('Install instructions: https://ai.google.dev/gemini-api/docs/cli');
    process.exit(1);
  }
}

(async () => {
  await checkDependencies();

  const app = new TodoApp();
  await app.init();
})();
