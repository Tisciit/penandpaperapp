const app = require("express")();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);

ioSocket.on("connection", socket => {
    console.log(socket.id);
});