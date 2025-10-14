import blessed from 'blessed';

function showAddTaskModal(screen, onSubmit, onCancel) {
  // Use blessed's built-in prompt for title
  const promptBox = blessed.prompt({
    parent: screen,
    border: 'line',
    height: 'shrink',
    width: 'half',
    top: 'center',
    left: 'center',
    label: ' Add New Task ',
    tags: false,
    keys: true,
    vi: false
  });

  // Show the prompt and get title
  promptBox.input('Enter task title:', '', (err, title) => {
    if (err || !title || !title.trim()) {
      // User cancelled or entered empty title
      if (onCancel) onCancel();
      return;
    }

    const taskTitle = title.trim();

    // Now ask for details (optional)
    promptBox.input('Enter details (optional, press Enter to skip):', '', (err, details) => {
      const taskDetails = details?.trim() || '';

      // Submit the task
      if (onSubmit) onSubmit(taskTitle, taskDetails);
    });
  });

  return promptBox;
}

export default showAddTaskModal;
