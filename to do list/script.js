const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");
const dateInput = document.getElementById("task-date");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Load tasks on startup
document.addEventListener("DOMContentLoaded", loadTasks);
addTaskBtn.addEventListener("click", addTask);

function addTask() {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const date = dateInput.value;

  if (!title) {
    alert("Please enter a task title.");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    desc,
    date,
    completed: false,
  };

  saveTask(task);
  clearInputs();
  loadTasks(); // Refresh list sorted
}

function clearInputs() {
  titleInput.value = "";
  descInput.value = "";
  dateInput.value = "";
}

// Create task element
function addTaskToDOM(task) {
  const li = document.createElement("li");
  li.classList.add("task");
  if (task.completed) li.classList.add("completed");

  // Remaining days calculation
  let remainingText = "";
  if (task.date) {
    const today = new Date();
    const deadline = new Date(task.date);
    const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (diff > 0)
      remainingText = `<span class="remaining green">⏳ ${diff} day${diff > 1 ? "s" : ""} left</span>`;
    else if (diff === 0)
      remainingText = `<span class="remaining orange">🕒 Due today</span>`;
    else
      remainingText = `<span class="remaining red">❌ ${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""} overdue</span>`;
  }

  li.innerHTML = `
    <div class="task-info">
      <h3>${task.title}</h3>
      ${task.desc ? `<p>${task.desc}</p>` : ""}
      ${
        task.date
          ? `<span class="deadline">Deadline: ${formatDate(task.date)}</span> ${remainingText}`
          : ""
      }
    </div>
    <div class="task-actions">
      <button class="complete-btn" title="Mark Complete">✔</button>
      <button class="delete-btn" title="Delete">🗑</button>
    </div>
  `;

  // Toggle complete
  li.querySelector(".complete-btn").addEventListener("click", () => {
    li.classList.toggle("completed");
    toggleComplete(task.id);
  });

  // Delete task
  li.querySelector(".delete-btn").addEventListener("click", () => {
    deleteTask(task.id);
    li.remove();
  });

  taskList.appendChild(li);
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Save task to localStorage
function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load and sort tasks
function loadTasks() {
  taskList.innerHTML = "";
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Sort: soonest deadlines first, overdue last
  tasks.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    const today = new Date();
    const da = new Date(a.date);
    const db = new Date(b.date);
    const diffA = da - today;
    const diffB = db - today;
    return diffA - diffB;
  });

  tasks.forEach(addTaskToDOM);
}

// Mark task complete
function toggleComplete(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Delete task
function deleteTask(id) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updated = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(updated));
}

// Auto-refresh remaining time and sorting every minute
setInterval(loadTasks, 60000);
