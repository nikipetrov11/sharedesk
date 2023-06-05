const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Handle socket connections
io.on('connection', socket => {
  console.log('A user connected');

  // Event handler for the "offer" message
  socket.on('offer', offer => {
    // Broadcast the offer to all other connected clients
    socket.broadcast.emit('offer', offer);
  });

  // Event handler for the "answer" message
  socket.on('answer', answer => {
    // Broadcast the answer to all other connected clients
    socket.broadcast.emit('answer', answer);
  });

  // Event handler for the "iceCandidate" message
  socket.on('iceCandidate', candidate => {
    // Broadcast the ICE candidate to all other connected clients
    socket.broadcast.emit('iceCandidate', candidate);
  });

  // Event handler for disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Signaling server is running on port ${port}`);
});
