const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const Task = require('../models/task');
const User = require('../models/User'); // Mocked User model

// Hash the password before saving the user in tests
const bcrypt = require('bcryptjs');



// Before running tests, clear the database
beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});


// Mock Task data
const mockTask = {
  title: "Test Task",
  description: "This is a test task.",
  dueDate: new Date('2024-12-31'),
  status: 'pending',
  userEmail: "testuser@example.com" // Include this field
};



let taskId; // Variable to store the ID of a created task

// Before each test, clear the database and create a new task
beforeEach(async () => {
  await Task.deleteMany({}); // Clear all tasks in the database
  const task = new Task(mockTask);
  await task.save();
  taskId = task._id;
});


// Tests for User Registration
describe('POST /api/register', () => {
  it('should register a new user successfully', async () => {
    const newUser = {
      username: 'TestUser',
      email: 'testuser@example.com',
      password: 'securepassword',
    };

    const res = await request(app).post('/api/users/register').send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should return 400 if email is already in use', async () => {
    const existingUser = new User({
      username: 'ExistingUser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password', 10),
    });
    await existingUser.save();

    const newUser = {
      username: 'TestUser',
      email: 'testuser@example.com',
      password: 'securepassword',
    };

    const res = await request(app).post('/api/users/register').send(newUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email is already in use');
  });
});

// Tests for User Login
describe('POST /api/users/login', () => {
  it('should log in the user successfully', async () => {
    const user = new User({
      username: 'TestUser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('securepassword', 10),
    });
    await user.save();

    const loginDetails = {
      email: 'testuser@example.com',
      password: 'securepassword',
    };

    const res = await request(app).post('/api/users/login').send(loginDetails);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
  });

  it('should return 400 for invalid credentials', async () => {
    const user = new User({
      username: 'TestUser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('securepassword', 10),
    });
    await user.save();

    const loginDetails = {
      email: 'testuser@example.com',
      password: 'wrongpassword',
    };

    const res = await request(app).post('/api/users/login').send(loginDetails);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if email does not exist', async () => {
    const loginDetails = {
      email: 'nonexistentuser@example.com',
      password: 'securepassword',
    };

    const res = await request(app).post('/api/users/login').send(loginDetails);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
});


// Test for GET /api/tasks
describe('GET /api/tasks', () => {
  it('should return all tasks for a specific user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('user-email', 'testuser@example.com'); // Set user-email header
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1); // Should return 1 task for the user
  });

  it('should return a 500 error if the server fails', async () => {
    jest.spyOn(Task, 'find').mockRejectedValueOnce(new Error('Database failure'));
    const res = await request(app)
      .get('/api/tasks')
      .set('user-email', 'testuser@example.com'); // Set user-email header
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Database failure');
  });
});

// Test for GET /api/tasks/:id
describe('GET /api/tasks/:id', () => {
  it('should return the task for the given ID', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(mockTask.title);
  });

  it('should return 404 if task not found', async () => {
    const res = await request(app).get('/api/tasks/609bfe418b5ae2a0c8f5a6d0'); // Invalid ID
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});

// Test for POST /api/tasks
// Test for POST /api/tasks
describe('POST /api/tasks', () => {
  it('should create a new task for a specific user', async () => {
    const newTask = {
      title: "New Task",
      description: "This is a new task.",
      dueDate: new Date('2024-12-31'),
      status: 'pending'
    };
    const res = await request(app)
      .post('/api/tasks')
      .set('user-email', 'testuser@example.com') // Set user-email header
      .send(newTask);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(newTask.title);
  });

  it('should return a 400 error if the request body is invalid', async () => {
    const invalidTask = { description: "No title" }; // Missing title
    const res = await request(app)
      .post('/api/tasks')
      .set('user-email', 'testuser@example.com') // Set user-email header
      .send(invalidTask);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Task validation failed');
  });
});

// Test for PUT /api/tasks/:id
describe('PUT /api/tasks/:id', () => {
  it('should update the task for the given ID', async () => {
    const updatedTask = {
      title: "Updated Task",
      description: "Updated description",
      dueDate: new Date('2024-12-31'),
      status: 'completed'
    };
    const res = await request(app).put(`/api/tasks/${taskId}`).send(updatedTask);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updatedTask.title);
    expect(res.body.status).toBe(updatedTask.status);
  });

  it('should return 404 if task not found', async () => {
    const updatedTask = {
      title: "Updated Task",
      description: "Updated description",
      dueDate: new Date('2024-12-31'),
      status: 'completed'
    };
    const res = await request(app).put('/api/tasks/609bfe418b5ae2a0c8f5a6d0').send(updatedTask); // Invalid ID
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});

// Test for DELETE /api/tasks/:id
describe('DELETE /api/tasks/:id', () => {
  it('should delete the task for the given ID', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task Deleted');
  });

  it('should return 404 if task not found', async () => {
    const res = await request(app).delete('/api/tasks/609bfe418b5ae2a0c8f5a6d0'); // Invalid ID
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});

// Test for GET /api/tasks/overdue
// Test for GET /api/tasks/overdue
describe('GET /api/tasks/overdue', () => {
  it('should return overdue tasks for a specific user', async () => {
    const overdueTask = new Task({
      title: "Overdue Task",
      description: "This task is overdue.",
      dueDate: new Date('2023-12-31'), // Overdue date
      status: 'pending',
      userEmail: 'testuser@example.com' // Assign userEmail
    });
    await overdueTask.save();
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('user-email', 'testuser@example.com'); // Set user-email header
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Should return the overdue task
  });

  it('should return an empty array if no tasks are overdue', async () => {
    const res = await request(app)
      .get('/api/tasks/overdue')
      .set('user-email', 'testuser@example.com'); // Set user-email header
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0); // Should return an empty array if no tasks are overdue
  });
});

// Test for GET /api/tasks/history/:id
describe('GET /api/tasks/history/:id', () => {
  it('should return task history for the given ID', async () => {
    // First, create a task and add some history to it.
    const task = new Task({
      title: "History Task",
      description: "This task has history.",
      dueDate: new Date('2024-12-31'),
      status: 'pending',
      userEmail: "testuser@example.com", // Add the userEmail field

      history: [
        { title: "Initial Task", description: "Initial description", dueDate: new Date('2024-11-30'), status: 'pending' }
      ]
    });
    await task.save();

    const res = await request(app).get(`/api/tasks/history/${task._id}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Should return history
    expect(res.body[0].title).toBe("Initial Task"); // Check if history is correct
  });

  it('should return 404 if task not found', async () => {
    const res = await request(app).get('/api/tasks/history/609bfe418b5ae2a0c8f5a6d0'); // Invalid ID
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });
});





