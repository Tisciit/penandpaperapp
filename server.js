const app = require("express")();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);

const chatHistory = [];

ioSocket.on("connection", client => {
  //#region Command Variables
  /**
   * Write all in UPPERCASE
   * Prefix "Commands" with C_
   *  
   */
  const CHAT = "CHAT";
  const C_NAME = "/NAME";
  //#endregion

  //#region Events for "/" commands
  client.on(C_NAME, newName => {
    client.name = newName;
  });

  client.on(CHAT, message => {
    let id = chatHistory.push({ client: client.id, message });
    const data = {
      id,
      user: client.name || client.id,
      message: message
    };

    ioSocket.emit(CHAT, data);
  });
});

app.get("/", (req, res) => {
  res.send(JSON.stringify(chatHistory));
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log("Listening");
});
