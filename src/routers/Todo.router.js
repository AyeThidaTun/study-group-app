const express = require('express');
const router = express.Router();
const {
  getFilteredTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
} = require('../models/Todo.model');


// Route to fetch filtered and sorted todos
router.get('/', async (req, res) => {
  try {
    const { userId, category, status, sortBy, mood, recurring } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const filters = {
      userId: parseInt(userId, 10),
      ...(category && { category }),
      ...(status && { status }),
      ...(mood && { mood }),
      ...(recurring && { recurring }),
    };

    const todos = await getFilteredTodos(filters, sortBy);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to load todos.' });
  }
});

// Route to create a new todo
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newTodo = await createTodo(data);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo.' });
  }
});

// Route to fetch a single todo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await getTodoById(id);
    if (!todo) return res.status(404).json({ error: 'Task not found.' });
    res.json(todo);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
});

// Route to update a todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedTodo = await updateTodo(id, data);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo.' });
  }
});

// Route to delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTodo(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo.' });
  }
});

module.exports = router;
