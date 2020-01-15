const express = require("express");
const app = express();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);
const fs = require("fs");
const deckapi = require("./deckofcardsapi");

const chatHistory = [];
const drawing = [];
let drawingId = 1;

const tokenCards = [];
let tokenCardId = 1;
let currentSong = "./static/sound/beat3.mp3";

const EVENTS = {
  NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
  COMMAND_NAME: "COMMAND_NAME",
  AUDIO_CHANGE: "AUDIO_CHANGE",
  ROLL_DICE: "ROLL_DICE",
  CANVAS: "CANVAS",
  GETCANVAS: "GETCANVAS",
  REMOVECANVAS: "REMOVECANVAS",
  DRAWCARD: "DRAW_CARD",
  UPDATETOKENORCARD: "UPDATE_TOKENCARD"
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
    };

    const rollTo = options.rollTo || ROLLTOOPTIONS.EVERYONE;
  });

  client.on(EVENTS.CANVAS, object => {
    console.log(EVENTS.CANVAS);
    object.id = drawingId++;
    drawing.push(object);
    ioSocket.emit(EVENTS.CANVAS, object);
  });

  client.on(EVENTS.GETCANVAS, () => {
    console.log(`Client ${client.id} requested existing canvas`);
    client.emit(EVENTS.GETCANVAS, { drawing, tokenCards });
  });

  client.on(EVENTS.REMOVECANVAS, id => {
    console.log(
      `Client ${client.id} requested deletion of drawing with id ${id}`
    );
    const elt = drawing.find(elt => elt.id === id);
    if (elt) {
      const index = drawing.indexOf(elt);
      drawing.splice(index, 1);
      console.log("Element has been deleted");

      ioSocket.emit(EVENTS.REMOVECANVAS, id);
    }
  });

  client.on(EVENTS.DRAWCARD, () => {
    console.log(`Client with id ${client.id} requested a card`);
    deckapi.drawCards(1).then(
      resolve => {
        //Send Drawn Card to everyone :)
        for (let card of resolve) {
          card.id = tokenCardId++;
          card.type = "CARD";
        }
        tokenCards.push(...resolve);
        ioSocket.emit(EVENTS.UPDATETOKENORCARD, resolve);
      },
      reject => {
        console.log(reject);
      }
    );
  });

  client.on(EVENTS.UPDATETOKENORCARD, elt => {
    const tokenCard = tokenCards.find(c => c.id === elt.id);
    console.log(tokenCard);
    if (tokenCard) {
      tokenCard.x = elt.x;
      tokenCard.y = elt.y;
      ioSocket.emit(EVENTS.UPDATETOKENORCARD, tokenCard);
    }
  });
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", (req, res) => {
  res.send(chatHistory);
});

app.get("/audio", (req, res) => {
  if (fs.existsSync(currentSong)) {
    const src = fs.createReadStream(currentSong);
    src.pipe(res);
  } else {
    //TODO: Set 500 header and send response;
  }
});

app.get("/assets", (req, res) => {
  console.log("Assets have been requested");
  fs.readdir("./static/assets", (err, files) => {
    const fileNames = [];
    if (err) {
      res.status(500);
      fileNames.push("There is an issue right now");
    } else {
      res.status(200);
      files.forEach(file => {
        fileNames.push(file);
      });
    }
    res.send(fileNames);
  });
});

app.use(express.static("./static"));

deckapi.shuffleDeck();

const PORT = 5000;
server.listen(PORT, () => {
  console.log("Listening");
});
