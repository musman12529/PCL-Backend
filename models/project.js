const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['In progress', 'Completed'], 
    default: 'In progress' 
  },
  dueDate: { type: Date }, // Due date for the project
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Reference to tasks within the project
  assignedTo: [{ type: String }], // New field for assigned users

  userEmail: { type: String, required: true } // New field for user email
  
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
