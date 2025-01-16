const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date }, // New field for due date
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Low' 
  }, // New field for priority
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  history: [{
    title: { type: String }, 
    description: { type: String }, 
    dueDate: { type: Date },
    priority: { type: String, enum: ['High', 'Medium', 'Low'] }, // Save priority in history
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    updatedAt: { type: Date, default: Date.now }
  }],
  projectId: { type: String, required: true } // Link task to a project

});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
