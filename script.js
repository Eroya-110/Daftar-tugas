let tasks = [];
let currentFilter = 'all';
let nextId = 1;

function saveTasks() {
  localStorage.setItem('manajer_tugas_data', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('manajer_tugas_data');
  if (saved) {
    tasks = JSON.parse(saved);
    // cari ID tertinggi supaya nextId tidak bentrok
    const maxId = tasks.reduce((max, t) => Math.max(max, t.id), 0);
    nextId = maxId + 1;
  }
}

function addTask() {
  const name = document.getElementById('taskName').value.trim();
  const detail = document.getElementById('taskDetail').value.trim();
  const deadline = document.getElementById('taskDeadline').value;

  if (!name) {
    alert('Nama tugas wajib diisi ya!');
    return;
  }

  tasks.unshift({
    id: nextId++,
    name: name,
    detail: detail,
    deadline: deadline,
    completed: false,
    createdAt: new Date().toISOString()
  });

  document.getElementById('taskName').value = '';
  document.getElementById('taskDetail').value = '';
  document.getElementById('taskDeadline').value = '';

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + filter).classList.add('active');
  renderTasks();
}

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return {
    text: d.toLocaleDateString('id-ID', options),
    overdue: d < now
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');

  let filtered = tasks;
  if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);

  document.getElementById('countActive').textContent = tasks.filter(t => !t.completed).length;
  document.getElementById('countDone').textContent = tasks.filter(t => t.completed).length;

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = filtered.map(task => {
    const dl = formatDeadline(task.deadline);
    const dlClass = dl && dl.overdue && !task.completed ? 'overdue' : 'normal';
    const dlIcon = dl && dl.overdue && !task.completed ? '⏰' : '📅';

    return `
      <div class="task-item">
        <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
          <span class="checkmark">✓</span>
        </div>
        <div class="task-content">
          <div class="task-title ${task.completed ? 'done' : ''}">${escapeHtml(task.name)}</div>
          ${task.detail ? `<div class="task-detail">${escapeHtml(task.detail)}</div>` : ''}
          ${task.deadline ? `<div class="task-deadline ${dlClass}">${dlIcon} ${dl.text}</div>` : ''}
        </div>
        <button class="btn-delete" onclick="deleteTask(${task.id})" title="Hapus tugas">🗑</button>
      </div>
    `;
  }).join('');
}

loadTasks();
renderTasks();
