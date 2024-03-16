const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const path = require('path');
const cluster = require("cluster");
const process = require("process");
const os = require("os");
require('dotenv').config()

const PORT = process.env.PORT || 8080;
const cpus = os.cpus;
const numCPUs = cpus().length;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
let socketConnected = new Set()

app.use(cors({
  origin: 'http://localhost:4200',
}));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(fileUpload());
app.use('/api', router);




io.on('connection', (socket) => {
  console.log(socket.id);
  socketConnected.add(socket.id)



  socket.on('message', (message) => {
    console.log('Message received:', message);
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected ', socket.id);
    socketConnected.delete(socket.id)
  });
});




if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const start = async () => {
    try {
       sequelize.authenticate();
       sequelize.sync();
      server.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
      });
    } catch (e) {
      console.log(e);
    }
  };
  start();
}
