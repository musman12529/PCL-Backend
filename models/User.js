const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Username should be required
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false, // Password should be required for user authentication
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
