const express = require('express');
const Project = require('../models/project');
const router = express.Router();

router.post('/', async (req, res) => {
    const { projectName, status, dueDate, assignedTo } = req.body;
    const userEmail = req.headers['user-email'];
  
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required to create a project' });
    }
  
    try {
      const project = new Project({
        projectName,
        status,
        dueDate,
        userEmail,
        assignedTo: Array.isArray(assignedTo) ? assignedTo : assignedTo ? [assignedTo] : [], // Normalize to array

      });
  
      await project.save();
      res.status(201).json(project);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  
  router.get('/', async (req, res) => {
    const userEmail = req.headers['user-email'];
  
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
  
    try {
      const projects = await Project.find({
        $or: [
          { userEmail },
          { assignedTo: userEmail },
        ],
      });
      res.status(200).json(projects);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

// Retrieve a specific project by ID for a user
router.get('/:id', async (req, res) => {
    const userEmail = req.headers['user-email']; // Get user email from the request headers
  
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
  
    try {
      const project = await Project.findOne({ _id: req.params.id, userEmail })
      if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });
  
      res.status(200).json(project);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

// Update a project for a user
router.put('/:id', async (req, res) => {
    
  
    try {
      const project = await Project.findOne({ _id: req.params.id});
      if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });
  
      // Update project fields
      project.projectName = req.body.projectName || project.projectName;
      project.status = req.body.status || project.status;
      project.dueDate = req.body.dueDate || project.dueDate;
      project.updatedAt = Date.now();
  
      await project.save();
      res.status(200).json(project);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

// Delete a project for a user
router.delete('/:id', async (req, res) => {
    
  
    try {
      const project = await Project.findOneAndDelete({ _id: req.params.id });
      if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });
  
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


  // Add a teammate to the assignedTo list of an existing project
router.put('/:id/addTeammate', async (req, res) => {
    const { teammateEmail } = req.body; // Get the teammate email(s) from the request body
    

    if (!teammateEmail) {
      return res.status(400).json({ message: 'Teammate email is required' });
    }

    try {
      // Find the project by its ID
      const project = await Project.findOne({ _id: req.params.id });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Normalize teammateEmail to an array
      let teammates = Array.isArray(teammateEmail) ? teammateEmail : [teammateEmail];

      // Ensure all teammates are unique
      teammates = [...new Set(teammates)];

      // Normalize assignedTo to an array (if it's a single string, convert to array)
      project.assignedTo = Array.isArray(project.assignedTo) ? project.assignedTo : [project.assignedTo];

      // Check if any of the teammates are already in the assignedTo list
      for (let email of teammates) {
        if (project.assignedTo.includes(email)) {
          return res.status(400).json({ message: `Teammate ${email} is already assigned to this project` });
        }
      }

      // Add new teammates to the assignedTo list
      project.assignedTo.push(...teammates);

      // Save the updated project
      await project.save();

      res.status(200).json({ message: 'Teammates added successfully', project });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});


module.exports = router;
