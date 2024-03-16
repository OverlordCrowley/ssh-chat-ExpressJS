require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const path = require('path')
const cluster = require("cluster");
const process = require("process");
const os = require("os");
const http = require('http');
const WebSocket = require('ws');
const {logger} = require("sequelize/lib/utils/logger");

const PORT = process.env.PORT || 8080
const cpus = os.cpus;
const numCPUs = cpus().length;
const websocketApp = express()
const websocketServer = http.createServer(websocketApp)
const wss = new WebSocket.Server({server: websocketServer})


if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);


  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    // cluster.fork();
    console.log(`worker ${worker.process.pid} died`);
  });
}
else{
  const app = express()
  app.use(cors())
  app.use(express.json())



  app.use('/static', express.static(path.join(__dirname, 'static')));

  app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const photoUrl = `/static/${filename}`;
    res.send({ photoUrl });
  });

  app.use(fileUpload({}))
  app.use('/api', router)


  const start = async () => {
    try {
      await sequelize.authenticate()
      await sequelize.sync()

      app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
      console.log(e)
    }

  try{
      wss.on("connection", function connection(ws){

        console.log("A new client connected")
        ws.send("welcome new client")

        ws.on("message", function incoming(message){
          console.log("received: %s ", message)
          ws.send("Got u r mess its: ", message)
        })

      })

    websocketServer.listen(3000, () => console.log("Listening on port 3000"))
  }
  catch (e) {

  }
    

  }


  start()
}
