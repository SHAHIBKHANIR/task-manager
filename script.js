const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const historySelect = document.getElementById('historySelect');
const loadHistoryBtn = document.getElementById('loadHistoryBtn');
const startNewBtn = document.getElementById('startNewBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();
loadDownloadHistoryDropdown();

addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const newTask = {
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
    endAt: null,
    deadline: deadlineInput.value ? new Date(deadlineInput.value).toISOString() : null
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = '';
  deadlineInput.value = '';
  taskInput.focus();
});

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    const span = document.createElement('span');

    const createdDate = new Date(task.createdAt);
    const createdAtFormatted = `${createdDate.getDate().toString().padStart(2, '0')}-${(createdDate.getMonth() + 1).toString().padStart(2, '0')}-${createdDate.getFullYear()} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;

    const endAtFormatted = task.endAt
      ? `${new Date(task.endAt).toLocaleDateString()} ${new Date(task.endAt).toLocaleTimeString()}`
      : '---';

    const deadlineFormatted = task.deadline
      ? `${new Date(task.deadline).toLocaleDateString()} ${new Date(task.deadline).toLocaleTimeString()}`
      : '---';

    span.innerHTML = `<strong>${task.text}</strong>
      <br><small>Created: ${createdAtFormatted}</small>
      <br><small>Deadline: ${deadlineFormatted}</small>
      <br><small>Completed: ${endAtFormatted}</small>`;

    const actions = document.createElement('div');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      const newText = prompt('Edit your task:', task.text);
      if (newText && newText.trim()) {
        tasks[index].text = newText.trim();
        saveTasks();
        renderTasks();
      }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
    toggleBtn.onclick = () => {
      tasks[index].completed = !task.completed;
      tasks[index].endAt = task.completed ? new Date().toISOString() : null;
      saveTasks();
      renderTasks();
    };

    actions.append(editBtn, deleteBtn, toggleBtn);
    li.appendChild(span);
    li.appendChild(actions);

    task.completed ? completedList.appendChild(li) : pendingList.appendChild(li);
  });
}

document.getElementById('downloadExcelBtn').addEventListener('click', () => {
  const data = tasks.map(task => {
    const createdAt = new Date(task.createdAt);
    const endAt = task.endAt ? new Date(task.endAt) : null;
    const deadline = task.deadline ? new Date(task.deadline) : null;

    return {
      Task: task.text,
      Status: task.completed ? 'Completed' : 'Pending',
      CreatedAt: formatDateTime(createdAt),
      Deadline: deadline ? formatDateTime(deadline) : '---',
      CompletedAt: endAt ? formatDateTime(endAt) : '---'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

  const filename = prompt('Enter file name:', 'TaskList');
  if (filename && filename.trim()) {
    const savedFileKey = `task-history-${Date.now()}`;
    localStorage.setItem(savedFileKey, JSON.stringify(tasks));
    updateHistoryList(savedFileKey, filename.trim());

    XLSX.writeFile(workbook, `${filename.trim()}.xlsx`);

    tasks = [];
    saveTasks();
    renderTasks();
    startNewBtn.style.display = 'none';
  }
});

function formatDateTime(d) {
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function updateHistoryList(key, label) {
  let history = JSON.parse(localStorage.getItem('taskHistoryList')) || [];
  history.push({ key, label });
  localStorage.setItem('taskHistoryList', JSON.stringify(history));
  loadDownloadHistoryDropdown();
}

function loadDownloadHistoryDropdown() {
  historySelect.innerHTML = '<option value="">-- Select Previous Download --</option>';
  const history = JSON.parse(localStorage.getItem('taskHistoryList')) || [];
  history.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.key;
    opt.textContent = item.label;
    historySelect.appendChild(opt);
  });
}

loadHistoryBtn.addEventListener('click', () => {
  const selectedKey = historySelect.value;
  if (!selectedKey) return;

  const saved = localStorage.getItem(selectedKey);
  if (saved) {
    tasks = JSON.parse(saved);
    saveTasks();
    renderTasks();

    const selectedOption = historySelect.options[historySelect.selectedIndex];
    alert(`Loaded "${selectedOption.textContent}" task list.`);
    startNewBtn.style.display = 'block';
  }
});

startNewBtn.addEventListener('click', () => {
  if (confirm('This will clear the loaded task list and start fresh. Continue?')) {
    tasks = [];
    saveTasks();
    renderTasks();
    startNewBtn.style.display = 'none';
  }
});
