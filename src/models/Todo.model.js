const prisma = require('./prismaClient');

// Get filtered and sorted todos
module.exports.getFilteredTodos = async function (filters, sortBy) {
  const { userId, category, status, mood } = filters;

  const where = {
    userId,
    ...(category && { category }),
    ...(status && { status }),
    ...(mood && { mood }),
  };

  const orderBy =
    sortBy === 'due-date'
      ? { dueDate: 'asc' }
      : sortBy === 'priority'
      ? { priority: 'asc' }
      : {};

  return prisma.todo.findMany({ where, orderBy });
};


// Get a single todo by ID
module.exports.getTodoById = async function (id) {
  return prisma.todo.findUnique({ where: { id: parseInt(id, 10) } });
};

// Create a new todo
module.exports.createTodo = async function (data) {
  if (!data.userId) {
    throw new Error('Missing userId for task creation');
  }

  const newTask = await prisma.todo.create({
    data: {
      userId: parseInt(data.userId, 10),
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      category: data.category,
      priority: data.priority,
      notes: data.notes,
      status: 'PENDING',
      mood: data.mood,
      recurring: data.recurring || 'NONE',
    },
  });

  if (data.recurring && data.recurring !== 'NONE') {
    await scheduleRecurringTasks(newTask);
  }

  return newTask;
};

// Function to create recurring tasks
async function scheduleRecurringTasks(task) {
  let interval;
  if (task.recurring === 'DAILY') interval = 1;
  else if (task.recurring === 'WEEKLY') interval = 7;
  else if (task.recurring === 'MONTHLY') interval = 30;
  else return;

  for (let i = 1; i <= 5; i++) {
    const newDate = new Date(task.dueDate);
    newDate.setDate(newDate.getDate() + interval * i);

    await prisma.todo.create({
      data: {
        userId: task.userId,
        title: task.title,
        description: task.description,
        dueDate: newDate,
        category: task.category,
        priority: task.priority,
        notes: task.notes,
        status: 'PENDING',
        mood: task.mood,
        recurring: task.recurring,
      },
    });
  }
}

// Update a todo and manage points
module.exports.updateTodo = async function (id, data) {
  const existingTodo = await prisma.todo.findUnique({ where: { id: parseInt(id, 10) } });

  if (!existingTodo) throw new Error('Task not found');

  // If task is completed, add points
  let pointsChange = 0;
  if (data.completed && !existingTodo.completed) {
    pointsChange = 10; // Assign points for completing a task
  }

  const updatedTodo = await prisma.todo.update({
    where: { id: parseInt(id, 10) },
    data,
  });

  if (pointsChange !== 0) {
    await updateUserPoints(existingTodo.userId, pointsChange, "COMPLETED_TASK");
  }

  return updatedTodo;
};

// Function to update user points
async function updateUserPoints(userId, points, type) {
  await prisma.user.update({
    where: { userId },
    data: { points: { increment: points } },
  });

  await prisma.pointsTransaction.create({
    data: {
      userId,
      points,
      type,
      description: type === "COMPLETED_TASK" ? "Completed a task" : "Task overdue",
    },
  });
}

// Function to decrease points for overdue tasks every second
async function autoDeductPoints() {
  setInterval(async () => {
    const now = new Date();
    const overdueTodos = await prisma.todo.findMany({
      where: { dueDate: { lt: now }, completed: false },
    });

    for (const todo of overdueTodos) {
      await updateUserPoints(todo.userId, -2, "OVERDUE_TASK");
    }
  }, 846000); // Run every day
}


// Start auto-deduction process
autoDeductPoints();


// Delete a todo
module.exports.deleteTodo = async function (id) {
  return prisma.todo.delete({ where: { id: parseInt(id, 10) } });
};
