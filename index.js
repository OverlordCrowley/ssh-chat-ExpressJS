const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const path = require('path');
const cluster = require("cluster");
const os = require("os");
require('dotenv').config()

const PORT = process.env.PORT || 8080;
const cpus = os.cpus();
const numCPUs = cpus.length;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  pingTimeout: 30000,
  pingInterval: 5000,
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
let socketConnected = new Set();

app.use(cors({
  origin: 'http://localhost:4200',
}));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(fileUpload());
app.use('/api', router);

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room ${room}`);
    });

    socket.on('encryptedMessage', (data) => {
      const { message, recipientEmail } = data;
      socket.to(recipientEmail).emit('encryptedMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  const start = async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      server.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
      });
    } catch (e) {
      console.error('Error starting server:', e);
    }
  };

  start();
}
