const express = require('express');
const Task = require('../models/task');
const router = express.Router();



// Retrieve all overdue tasks for a specific user
router.get('/overdue', async (req, res) => {
  try {
    const userEmail = req.headers['user-email'];
    if (!userEmail) return res.status(400).json({ message: 'User email is required' });

    const now = new Date();
    const overdueTasks = await Task.find({
      userEmail,
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    });

    res.status(200).json(overdueTasks);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  const { title, description, dueDate, priority } = req.body; // Include priority
  const projectId = req.headers['project-id']; // Get user email from the request headers

  if (!projectId) {
    return res.status(400).json({ message: 'projectId is required to create a task' });
  }

  const task = new Task({
    title,
    description,
    dueDate,
    priority, // Add priority to the task
    projectId
  });

  try {
    await task.save();
    res.status(201).json(task); // Return the newly created task
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Get a specific task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Push current title, description, and priority to history before updating
    task.history.push({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate, // Save current dueDate
      priority: task.priority, // Save current priority
      status: task.status,
      updatedAt: task.updatedAt
    });

    // Update task with new values
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.priority = req.body.priority || task.priority; // Update priority
    task.status = req.body.status || task.status;
    task.updatedAt = Date.now();

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Retrieve task history at  aspecified time
router.get('/history/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task.history);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Retrieve all tasks
router.get('/', async (req, res) => {
  try {
    const projectId = req.headers['project-id']; // Assuming you're sending the email in the headers (you can also send via body or query)
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const tasks = await Task.find({ projectId }); // Fetch tasks associated with the user's email
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Remove a teammate by ID
router.delete('/:teammateId', async (req, res) => {
  const { teammateId } = req.params;

  if (!teammateId) {
    return res.status(400).json({ message: 'Teammate ID is required' });
  }

  try {
    const deletedTeammate = await Teammate.findByIdAndDelete(teammateId);

    if (!deletedTeammate) {
      return res.status(404).json({ message: 'Teammate not found' });
    }

    res.status(200).json({ message: 'Teammate removed successfully', deletedTeammate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




module.exports = router;
