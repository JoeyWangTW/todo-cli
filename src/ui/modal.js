import blessed from 'blessed';

function showAddTaskModal(screen, onSubmit, onCancel) {
  let currentStep = 'title';
  let taskTitle = '';
  let taskDetails = '';

  // Create modal box
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '70%',
    height: 12,
    border: { type: 'line' },
    label: ' Add New Task ',
    tags: true,
    keys: true
  });

  // Label to show current prompt
  const label = blessed.text({
    parent: box,
    top: 0,
    left: 1,
    content: 'Task title:',
    tags: false
  });

  // Input field (textbox supports Ctrl+E for external editor and Enter to submit)
  const input = blessed.textbox({
    parent: box,
    top: 2,
    left: 1,
    right: 1,
    height: 3,
    keys: true,
    mouse: true,
    inputOnFocus: true,
    border: { type: 'line' },
    style: {
      focus: {
        border: { fg: 'green' }
      }
    }
  });

  // Instructions
  const instructions = blessed.text({
    parent: box,
    bottom: 1,
    left: 1,
    content: 'Enter: Submit | Ctrl+E: Edit in $EDITOR | Escape: Cancel',
    style: { fg: 'cyan' }
  });

  // Handle cancel with Escape
  input.key(['escape'], () => {
    cleanup();
    if (onCancel) onCancel();
  });

  // Handle Enter key to submit (textarea doesn't auto-submit)
  input.key(['C-s'], () => {
    handleSubmit(input.getValue());
  });

  // Handle input submission
  input.on('submit', (value) => {
    handleSubmit(value);
  });

  function handleSubmit(value) {
    if (currentStep === 'title') {
      taskTitle = value.trim();
      if (!taskTitle) {
        cleanup();
        if (onCancel) onCancel();
        return;
      }
      // Move to details
      currentStep = 'details';
      label.setContent('Details (optional):');
      input.clearValue();
      screen.render();
      input.readInput();
    } else if (currentStep === 'details') {
      taskDetails = value.trim();
      // Move to YOLO mode
      currentStep = 'yolo';
      label.setContent('Enable YOLO mode? (y/N):');
      input.clearValue();
      screen.render();
      input.readInput();
    } else if (currentStep === 'yolo') {
      const enableYolo = value.trim().toLowerCase() === 'y';
      cleanup();
      if (onSubmit) onSubmit(taskTitle, taskDetails, enableYolo);
    }
  }

  function cleanup() {
    box.destroy();
    screen.render();
  }

  // Show and focus
  screen.render();
  input.focus();
  input.readInput();

  return box;
}

export default showAddTaskModal;
