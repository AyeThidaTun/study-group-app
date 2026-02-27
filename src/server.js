const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin, or specify your frontend domain here
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Handle events, e.g., sending chat messages
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg); // Emit the message to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});