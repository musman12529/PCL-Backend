const express = require('express');
const User = require('../models/User'); // Import the User model to check email existence
const Teammate = require('../models/teams'); // Import the Teammate model
const router = express.Router();

// Add a new teammate
router.post('/', async (req, res) => {
  const { teammateEmail } = req.body;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !teammateEmail) {
    return res.status(400).json({ message: 'User email and teammate email are required' });
  }

  try {
    // Check if the teammate exists in the User collection
    const userExists = await User.findOne({ email: teammateEmail });
    if (!userExists) {
      return res.status(404).json({ message: 'Teammate email does not exist in the database' });
    }

    // Check if the teammate is already added
    const existingTeammate = await Teammate.findOne({ userEmail, teammateEmail });
    if (existingTeammate) {
      return res.status(400).json({ message: 'Teammate already added' });
    }

    // Add the new teammate
    const teammate = new Teammate({ userEmail, teammateEmail });
    await teammate.save();

    res.status(201).json({ message: 'Teammate added successfully', teammate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Retrieve all teammates for the user
router.get('/', async (req, res) => {
  const userEmail = req.headers['user-email'];

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const teammates = await Teammate.find({ userEmail });
    res.status(200).json(teammates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a teammate
router.delete('/:teammateEmail', async (req, res) => {
  const { teammateEmail } = req.params;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !teammateEmail) {
    return res.status(400).json({ message: 'User email and teammate email are required' });
  }

  try {
    const deletedTeammate = await Teammate.findOneAndDelete({ userEmail, teammateEmail });

    if (!deletedTeammate) {
      return res.status(404).json({ message: 'Teammate not found' });
    }

    res.status(200).json({ message: 'Teammate removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
