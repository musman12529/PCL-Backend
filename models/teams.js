const mongoose = require('mongoose');

const teammateSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // The email of the user adding teammates
  teammateEmail: { type: String, required: true }, // The email of the teammate being added
  addedAt: { type: Date, default: Date.now }, // Timestamp when the teammate was added
});

const Teammate = mongoose.model('Teammate', teammateSchema);

module.exports = Teammate;
