const app = require("express")();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);
const fs = require("fs");

const chatHistory = [];
const drawing = [];
let currentSong = "./sound/beat3.mp3";

const EVENTS = {
  NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
  COMMAND_NAME: "COMMAND_NAME",
  AUDIO_CHANGE: "AUDIO_CHANGE",
  ROLL_DICE: "ROLL_DICE",
  CANVAS: "CANVAS"
};

ioSocket.on("connection", client => {
  //#region EVENTS for "/" commands

  // client.emit(EVENTS.CANVAS, drawing);

  client.on(EVENTS.COMMAND_NAME, newName => {
    console.log(EVENTS.COMMAND_NAME);
    client.name = newName;
  });

  client.on(EVENTS.NEW_CHAT_MESSAGE, message => {
    console.log(EVENTS.NEW_CHAT_MESSAGE);
    const time = new Date().getTime();
    chatHistory.push({ client: client.id, time, message });
    const data = {
      id: client.id + time,
      user: client.name || client.id,
      message: message
    };

    ioSocket.emit(EVENTS.NEW_CHAT_MESSAGE, data);
  });

  client.on(EVENTS.AUDIO_CHANGE, newSong => {
    console.log("GM CHANGED SONG TO " + newSong);
    currentSong = `./sound/${newSong}.mp3`;
    ioSocket.emit(EVENTS.AUDIO_CHANGE, newSong);
  });

  client.on(EVENTS.ROLL_DICE, (diceString, options) => {
    const ROLLTOOPTIONS = {
      EVERYONE: 1,
      SELF: 2,
      GM: 3
    }

    const rollTo = options.rollTo || ROLLTOOPTIONS.EVERYONE;

  });

  client.on(EVENTS.CANVAS, (object) => {
    console.log(EVENTS.CANVAS);
    drawing.push([...object]);
    ioSocket.emit(EVENTS.CANVAS, [...object]);
  });
});

app.get("/", (req, res) => {
  res.send(chatHistory);
});

app.get("/events", (req, res) => {
  console.log(EVENTS);
  res.send(JSON.stringify(EVENTS));
});

app.get("/audio", (req, res) => {
  if (fs.existsSync(currentSong)) {
    const src = fs.createReadStream(currentSong);
    src.pipe(res);
  } else {
    //TODO: Set 500 header and send response;
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log("Listening");
});
