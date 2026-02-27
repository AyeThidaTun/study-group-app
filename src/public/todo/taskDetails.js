const taskDetails = document.getElementById("taskDetails");
const params = new URLSearchParams(window.location.search);
const taskId = params.get("taskId");

// Fetch task details
async function fetchTaskDetails() {
  let id;
  try {
    const response = await fetch(`/todos/${taskId}`);
    if (!response.ok) throw new Error("Failed to fetch task details");
    const task = await response.json();
    renderTaskDetails(task);
  } catch (error) {
    console.error(error);
    taskDetails.innerHTML = '<p class="text-danger">Error fetching task details.</p>';
    deleteTask(id);
  }
}

// Render task details with an update form
function renderTaskDetails(task) {
  taskDetails.innerHTML = `
    <h2 class="card-title">Edit Task</h2>
    <form id="updateTaskForm">
      <div class="mb-3">
        <label for="title" class="form-label">Task Title</label>
        <input type="text" id="title" class="form-control" value="${task.title}" required>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea id="description" class="form-control">${task.description || ""}</textarea>
      </div>
      <div class="mb-3">
        <label for="dueDate" class="form-label">Due Date</label>
        <input type="date" id="dueDate" class="form-control" value="${task.dueDate.split("T")[0]}" required>
      </div>
      <div class="mb-3">
        <label for="category" class="form-label">Category</label>
        <select id="category" class="form-control">
          <option value="Work" ${task.category === "Work" ? "selected" : ""}>Work</option>
          <option value="Personal" ${task.category === "Personal" ? "selected" : ""}>Personal</option>
          <option value="School" ${task.category === "School" ? "selected" : ""}>School</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="priority" class="form-label">Priority</label>
        <select id="priority" class="form-control">
          <option value="HIGH" ${task.priority === "HIGH" ? "selected" : ""}>High</option>
          <option value="MEDIUM" ${task.priority === "MEDIUM" ? "selected" : ""}>Medium</option>
          <option value="LOW" ${task.priority === "LOW" ? "selected" : ""}>Low</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="mood" class="form-label">Mood</label>
        <select id="mood" class="form-control">
          <option value="HAPPY" ${task.mood === "HAPPY" ? "selected" : ""}>Happy</option>
          <option value="STRESSED" ${task.mood === "STRESSED" ? "selected" : ""}>Stressed</option>
          <option value="RELAXED" ${task.mood === "RELAXED" ? "selected" : ""}>Relaxed</option>
          <option value="NEUTRAL" ${task.mood === "NEUTRAL" ? "selected" : ""}>Neutral</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="notes" class="form-label">Notes</label>
        <textarea id="notes" class="form-control">${task.notes || ""}</textarea>
      </div>
      <button type="submit" class="btn btn-outline-success">Save Changes</button>
      <button type="button" class="btn btn-outline-danger" onclick="deleteTask()">Delete Task</button>
    </form>
  `;

  document.getElementById("updateTaskForm").addEventListener("submit", updateTask);
}

// Update task
async function updateTask(event) {
  event.preventDefault();
  
  const updatedTask = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    dueDate: new Date(document.getElementById("dueDate").value).toISOString(),
    category: document.getElementById("category").value,
    priority: document.getElementById("priority").value,
    mood: document.getElementById("mood").value,
    notes: document.getElementById("notes").value,
  };

  try {
    const response = await fetch(`/todos/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      alert("Task updated successfully!");
      window.location.reload();
    } else {
      alert("Failed to update task.");
    }
  } catch (error) {
    console.error(error);
    alert("Error updating task.");
  }
}

// Delete task
async function deleteTask() {
  
  try {
    await fetch(`/todos/${taskId}`, { method: "DELETE" });
    alert("Task deleted successfully.");
    window.location.href = "/todo/index.html";
  } catch (error) {
    console.error(error);
    alert("Error deleting task.");
   
  }
}

// Initialize
fetchTaskDetails();
