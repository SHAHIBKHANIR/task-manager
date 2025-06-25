const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();

addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  const newTask = {
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString() // Save ISO timestamp
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = '';
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
    span.textContent = task.text;

    const actions = document.createElement('div');

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      const newText = prompt('Edit your task:', task.text);
      if (newText && newText.trim() !== '') {
        tasks[index].text = newText.trim();
        saveTasks();
        renderTasks();
      }
    };

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    // Complete / Undo Button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
    toggleBtn.onclick = () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(toggleBtn);

    li.appendChild(span);
    li.appendChild(actions);

    if (task.completed) {
      completedList.appendChild(li);
    } else {
      pendingList.appendChild(li);
    }
  });
}

// Download Excel
document.getElementById('downloadExcelBtn').addEventListener('click', () => {
  const data = tasks.map(task => {
    const date = new Date(task.createdAt);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1)
      .toString().padStart(2, '0')}-${date.getFullYear()} ${date
      .getHours().toString().padStart(2, '0')}:${date
      .getMinutes().toString().padStart(2, '0')}:${date
      .getSeconds().toString().padStart(2, '0')}`;

    return {
      Task: task.text,
      Status: task.completed ? 'Completed' : 'Pending',
      CreatedAt: formattedDate
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  XLSX.writeFile(workbook, 'TaskList.xlsx');
});
