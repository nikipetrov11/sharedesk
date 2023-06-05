const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Serve the static HTML file
app.use(express.static('public'));

// Store room data
const rooms = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining a room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    // Store user in the room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    rooms.get(roomId).set(socket.id, userId);

    // Send existing users in the room to the newly joined user
    const existingUsers = Array.from(rooms.get(roomId).values());
    socket.emit('existing-users', existingUsers);
  });

  // Handle signaling messages
  socket.on('message', (roomId, userId, message) => {
    socket.to(roomId).emit('message', userId, message);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    const roomId = getRoomId(socket);
    if (roomId) {
      socket.to(roomId).emit('user-disconnected', rooms.get(roomId).get(socket.id));
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

// Get the room ID for a socket
function getRoomId(socket) {
  const room = Array.from(socket.rooms.values()).find(roomId => roomId !== socket.id);
  return room || null;
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});