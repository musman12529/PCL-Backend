const express = require('express');
const http = require('http'); // For creating the server
const { Server } = require('socket.io'); // For WebSocket functionality
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importing routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teammateRoutes = require('./routes/teamsRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Create the HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teammates', teammateRoutes);

// MongoDB connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected...');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));

// Socket.IO functionality
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Event to join a specific room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    // Optionally, emit a message when a user joins
    socket.emit("new_user", { user: socket.id, roomId });
  });

  socket.on("send_message", (msg, roomId) => {
    console.log("Message received:", msg);
    // Emit the message to all users in the room, excluding the sender
    socket.to(roomId).emit("recieve_message", msg);
  });

  // Event to broadcast typing status to a specific room
  socket.on("user_typing", (data, roomId) => {
    socket.to(roomId).emit("user_typing", data); // Emit typing status to the room
  });

  socket.on("new_user", (data, roomId) => {
    socket.to(roomId).emit("new_user", data.user); // Notify room about new user
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Export app for testing or additional configurations
module.exports = app;
