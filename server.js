const app = require("express")();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);

ioSocket.on("connection", client => {
   console.log(client.id);
});

app.get("/", (req, res) => {
    console.log("yay")
    res.send("HALLO!")
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log("Listening");
});