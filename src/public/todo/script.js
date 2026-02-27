const todoForm = document.getElementById('todoForm');
const progressBar = document.getElementById('progressBar');
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');
const archivedTasks = document.getElementById('archivedTasks');
const themeToggle = document.getElementById('themeToggle');
const filterCategory = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');
const filterMood = document.getElementById('filterMood');
const sortBy = document.getElementById('sortBy');
const applyFilters = document.getElementById('applyFilters');
const userId = parseInt(localStorage.getItem('userId')); // Get userId from local storage

let tasks = []; // Global state for tasks

// Fetch tasks for the logged-in user with optional filters and sorting
async function fetchTasks(filters = {}) {
  const queryParams = new URLSearchParams({
    userId,
    ...filters,
  }).toString();

  try {
    const response = await fetch(`/todos?${queryParams}`);
    const todos = await response.json();
    tasks = todos; // Update the global task state
    updateUI();
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

// Add a new task to the backend
todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTask = {
    userId,
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value,
    category: document.getElementById('category').value,
    priority: document.getElementById('priority').value,
    mood: document.getElementById('mood').value,
    recurring: document.getElementById('recurring').value,
    notes: document.getElementById('notes').value,
    status: 'PENDING',
  };

  try {
    const response = await fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    const createdTask = await response.json();
    tasks.push(createdTask);
    updateUI();
    todoForm.reset();
  } catch (error) {
    console.error('Error adding task:', error);
  }
});

// UI Improvements: Recurring Task Icon
function getRecurringLabel(recurring) {
  if (recurring === 'DAILY') return '📅 Daily';
  if (recurring === 'WEEKLY') return '📆 Weekly';
  if (recurring === 'MONTHLY') return '📊 Monthly';
  return '';
}

// Get Mood Emoji
function getMoodEmoji(mood) {
  if (mood === 'HAPPY') return '😊';
  if (mood === 'STRESSED') return '😰';
  if (mood === 'RELAXED') return '😌';
  if (mood === 'NEUTRAL') return '😐';
  return '';
}

// Update the UI for the task board
function updateUI() {
  pendingTasks.innerHTML = '';
  completedTasks.innerHTML = '';
  archivedTasks.innerHTML = '';
  let completedCount = 0;
  completedCount;
  let recurringTaskCount = 0;

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <strong>${getMoodEmoji(task.mood)} ${task.title}<br> 
      ${getRecurringLabel(task.recurring)}</strong>
      <span>${new Date(task.dueDate).toLocaleDateString()}</span>
      <div>
        <button class="btn btn-success" onclick="markAsCompleted(${task.id})">Completed</button>
        <button class="btn btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
		    <button class="btn btn-outline-secondary" onclick="archiveTask(${task.id})">Archive</button>
		    <button class="btn btn-outline-warning" onclick="viewTask(${task.id})">View</button>
      </div>
    `;

    if (task.status === 'PENDING') {
      if (task.recurring !== 'NONE') {
        recurringTaskCount++;
      }
      if (task.recurring === 'NONE' || recurringTaskCount <= 5) {
        pendingTasks.appendChild(li);
      }
    } else if (task.status === 'COMPLETED') {
      completedTasks.appendChild(li);
      completedCount++;
    } else if (task.status === 'ARCHIVED') {
      archivedTasks.appendChild(li);
    }
  });
}

// Apply filters and sorting
applyFilters.addEventListener('click', () => {
  const filters = {
    category: filterCategory.value,
    status: filterStatus.value,
    mood: filterMood.value,
    sortBy: sortBy.value,
  };
  fetchTasks(filters);
});

function viewTask(taskId) {
    const taskDetailUrl = `../todo/taskDetail.html?taskId=${taskId}`;
    window.location.href = taskDetailUrl;
}

// Mark a task as completed
async function markAsCompleted(id) {
	try {
	  const task = tasks.find((task) => task.id === id);
	  if (!task) throw new Error("Task not found");
  
	  const updatedTask = { ...task, status: "COMPLETED", completed: true };
  
	  const response = await fetch(`/todos/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status: "COMPLETED", completed: true }), // Updating both
	  });
  
	  if (!response.ok) throw new Error("Failed to update task");
  
	  tasks = tasks.map((task) =>
		task.id === id ? updatedTask : task
	  );
	  updateUI();
  
	  alert("Task marked as completed! 10 Points added.");
	} catch (error) {
	  console.error("Error marking task as completed:", error);
	  alert("Error updating task.");
	}
}

// Delete task
async function deleteTask(taskId) {
  try {
    await fetch(`/todos/${taskId}`, { method: "DELETE" });
    alert("Task deleted successfully.");
    window.location.href = "/todo/index.html";
  } catch (error) {
    console.error(error);
    alert("Error deleting task.");
    myTodo();
  }
}

// Archive a task
async function archiveTask(id) {
  try {
    const task = tasks.find((task) => task.id === id);
    const updatedTask = { ...task, status: 'ARCHIVED' };

    await fetch(`/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });

    tasks = tasks.map((task) =>
      task.id === id ? { ...task, status: 'ARCHIVED' } : task
    );
    updateUI();
  } catch (error) {
    console.error('Error archiving task:', error);
  }
}

function myTodo () {
  const id = null;
    progressBar, themeToggle, viewTask(id), markAsCompleted(id), deleteTask(id), archiveTask(id);
}
// Generate recurring tasks
function generateRecurringTasks() {
  const today = new Date();
  tasks.forEach((task) => {
    if (task.recurring !== 'NONE' && task.status === 'PENDING') {
      const newDueDate = new Date(task.dueDate);

      if (task.recurring === 'DAILY') {
        newDueDate.setDate(today.getDate() + 1);
      } else if (task.recurring === 'WEEKLY') {
        newDueDate.setDate(today.getDate() + 7);
      } else if (task.recurring === 'MONTHLY') {
        newDueDate.setMonth(today.getMonth() + 1);
      }

      const newTask = {
        ...task,
        id: Date.now(), // Assign a unique ID for frontend use
        dueDate: newDueDate.toISOString().split('T')[0], // Keep the format consistent
      };

      if (tasks.filter((t) => t.recurring === task.recurring).length < 5) {
        tasks.push(newTask);
      }
    }
  });

  updateUI();
}

// Initialize by fetching tasks for the logged-in user
fetchTasks();

// Automatically generate recurring tasks every 24 hours
setInterval(generateRecurringTasks, 86400000); // Runs every 24 hours



