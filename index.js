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
const {logger} = require("sequelize/lib/utils/logger");
require('dotenv').config()

const PORT = process.env.PORT || 8080;
const cpus = os.cpus();
const numCPUs = cpus.length;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  pingTimeout: 66660000,
  pingInterval: 50000,
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "UPDATE"]
  }
});

app.use(cors());
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

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User joined room ${room}`);
    });

    socket.on('encryptedMessage', (data) => {
      const { message, recipientEmail, userEmail, timestamp, key } = data;
      console.log('Encrypted message received:', message);
      console.log("key: ", key)
      let encryptedData = {
        message: message,
        key: key,
        userEmail: userEmail,
        timestamp: timestamp
      };
      console.log(recipientEmail)
      if (recipientEmail !== userEmail) {
        io.sockets.in(userEmail).emit('ReceivedEncryptedMessage', encryptedData);
        console.log('send to user')
      }
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
