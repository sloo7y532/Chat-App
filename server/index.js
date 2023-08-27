const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

app.use(cors());

const server = http.createServer(app);
const rabbitSettings = {
  protocol: "amqp",
  hostname: "localhost",
  port: 5672,
  username: "saleh",
  password: "saleh532",
  vhost: "/",
  authMachanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var activeUsers = [];
// Message content
var MessageContent = {
  Cid: null,
  message: "",
  time: "",
};
// Message content

// ==Conneting to RabbitMQ==
const queue_SEND = "Chatting_SEND";
const queue_RECEIVE = "Cahtting_RECEIVE";
let channel_SEND, channel_RECEIVE, connection_SEND, connection_RECEIVE;

connect();
async function connect() {
  try {
    // **Queue [ 1 ]**
    connection_SEND = await amqp.connect(rabbitSettings);
    console.log("connection_SEND created");
    channel_SEND = await connection_SEND.createChannel();
    console.log("channel_SEND created");
    await channel_SEND.assertQueue(queue_SEND);
    console.log("queue_SEND ");
    // ** Queue [ 1 ] **

    // ** Queue [ 2 ] **
    connection_RECEIVE = await amqp.connect(rabbitSettings);
    console.log("connection_RECEIVE created");
    channel_RECEIVE = await connection_RECEIVE.createChannel();
    console.log("channel_RECEIVE created");
    await channel_RECEIVE.assertQueue(queue_RECEIVE);
    console.log("queue_RECEIVE ");
    // ** Queue [ 2 ] **
  } catch (ex) {
    console.error(ex);
  }
}
// ==Conneting to RabbitMQ==

io.on("connection", (socket) => {
  console.log(`User Connected`);

  // == Client ID ==
  socket.on("CidExist", (Cid) => {
    if (Cid === "" || Cid === undefined || Cid === null) {
      Cid = uuidv4();
      console.log(Cid);
      socket.emit("CidExistTrue", Cid);
    }

    if (!activeUsers.includes(Cid)) {
      activeUsers.push(Cid);
    }

    console.log(`active users: ${activeUsers} `);
    MessageContent.Cid = Cid;
  });
  // == Client ID ==
  socket.on("join", (Cid) => {
    socket.join(Cid);
    console.log(Cid, "=>joined to the room");
  });

  socket.on("send_message", (data) => {
    
    // Assigning the content to the MessageContent object
    MessageContent.message = data.message;
    MessageContent.time = data.time;
    // Assigning the content to the MessageContent object

    console.log(MessageContent);
    // ===Sending the message to rabbitmq===
    sendData(MessageContent);
    async function sendData(MessageContent) {
      try {
        await channel_SEND.sendToQueue(
          queue_SEND,
          Buffer.from(JSON.stringify(MessageContent))
        );
        console.log(
          `Message sent successfully ${MessageContent.message} with id ${MessageContent.Cid} `
        );
      } catch (ex) {
        console.error(ex);
      }
    }
    // ===Sending the message to rabbitmq===
  });
  // ==Receiving the message==
  receive();
  async function receive() {
    try {
      channel_RECEIVE.consume(queue_RECEIVE, (received_message) => {
        const input = JSON.parse(received_message.content.toString());
        console.log(
          `Recieved messages with input ${input.message} with id ${input.Cid}`
        );

        // Mapping through the active users
        activeUsers.map((user) => {
          if (user === input.Cid) {
            console.log("sent message: ", input);

            io.in(input.Cid).emit("receive_message", input);
            channel_RECEIVE.ack(received_message);
          }
        });
        // =Mapping through the active users=

        console.log("Waiting for messages...");
      });
    } catch (e) {
      console.log(e);
    }
  }

  // ====Receiving the message====

  socket.on("disconnect", () => {
    console.log("User Disconnected");
    activeUsers.pop(MessageContent.Cid);
  });
});

// setTimeout(() => {
//   connection.close();
//   process.exit(0);
// }, 500);

server.listen(3010, () => {
  console.log("Server Running");
});
