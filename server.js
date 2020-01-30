const express = require("express");
const app = express();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);
const fs = require("fs");
const deckapi = require("./deckofcardsapi");
const {
  analysePoints,
  convertIncomingDrawing,
  storeTableTopElement,
  getTableTopElements,
  deleteTableTopElement,
  updateTableTopElement
} = require("./TableTopApi");
const { DiceRoll } = require("rpg-dice-roller/lib/umd/bundle");

const chatHistory = [];

let currentSong = "./static/sound/beat3.mp3";

const EVENTS = {
  SEND_CHAT_MESSAGE: "SEND_CHAT_MESSAGE",
  CHANGE_NAME: "CHANGE_NAME",
  CHANGE_AUDIO: "CHANGE_AUDIO",
  REQUEST_DICE_ROLL: "REQUEST_DICE_ROLL",
  REQUEST_EXISTING_TABLETOP: "REQUEST_EXISTING_TABLETOP",
  SEND_NEW_DRAWING: "SEND_NEW_DRAWING",
  REQUEST_NEW_TOKEN: "REQUEST_NEW_TOKEN",
  REQUEST_DRAW_CARD: "REQUEST_DRAW_CARD",
  REQUEST_DELETION: "REQUEST_DELETION",
  REQUEST_UPDATE_TABLETOP: "REQUEST_UPDATE_TABLETOP"
};
deckapi
  .shuffleDeck()
  .then(data => console.log(data))
  .catch(err => console.log(err));

const PORT = 5000;

//#region --------------------- Socket ---------------------
ioSocket.on("connection", client => {
  client.on(EVENTS.CHANGE_NAME, newName => {
    console.log(`Client ${client.id} changed name to ${newName}`);
    client.name = newName;
  });

  client.on(EVENTS.SEND_CHAT_MESSAGE, message => {
    const time = new Date().getTime();
    chatHistory.push({ client: client.id, time, message });
    const data = {
      id: client.id + time,
      user: client.name || client.id,
      message: message
    };
    console.log(data);
    ioSocket.emit(EVENTS.SEND_CHAT_MESSAGE, data);
  });

  client.on(EVENTS.CHANGE_AUDIO, newSong => {
    console.log("GM CHANGED SONG TO " + newSong);
    currentSong = `./sound/${newSong}.mp3`;
    ioSocket.emit(EVENTS.AUDIO_CHANGE, newSong);
  });

  client.on(EVENTS.REQUEST_DICE_ROLL, (diceString, options) => {
    console.log(`Client ${client.id} requested dice roll ${diceString}`);

    const roll = new DiceRoll(diceString);
    ioSocket.emit(EVENTS.REQUEST_DICE_ROLL, roll);
  });

  client.on(EVENTS.SEND_NEW_DRAWING, object => {
    console.log(`Client ${client.id} sent new drawing`);
    const drawing = convertIncomingDrawing(object);
    if (drawing) {
      const { minX, minY, width, height, points } = analysePoints(
        drawing.points
      );
      //Store relative points
      drawing.points = points;
      drawing.x = minX;
      drawing.y = minY;
      drawing.width = width;
      drawing.height = height;

      const stored = storeTableTopElement(drawing);
      ioSocket.emit(EVENTS.SEND_NEW_DRAWING, stored);
    }
  });

  client.on(EVENTS.REQUEST_EXISTING_TABLETOP, () => {
    console.log(`Client ${client.id} requested existing tabletop`);
    client.emit(EVENTS.REQUEST_EXISTING_TABLETOP, getTableTopElements());
  });

  client.on(EVENTS.REQUEST_DELETION, id => {
    console.log(
      `Client ${client.id} requested deletion of element with id ${id}`
    );
    const elements = getTableTopElements();
    const elt = elements.find(elt => elt.id === id);
    if (elt) {
      const index = elements.indexOf(elt);
      deleteTableTopElement(index);
      console.log("Element has been deleted");

      ioSocket.emit(EVENTS.REQUEST_DELETION, id);
    }
  });

  client.on(EVENTS.REQUEST_NEW_TOKEN, token => {
    console.log(token);
    if (token.image) {
      //Valid token?
      token.type = "TC";
      token.subType = "TOKEN";
      token.x = token.x || 0;
      token.y = token.y || 0;
      ioSocket.emit(EVENTS.REQUEST_NEW_TOKEN, storeTableTopElement(token));
    }
  });
  
  client.on(EVENTS.REQUEST_DRAW_CARD, () => {
    console.log(`Client with id ${client.id} requested a card`);
    deckapi.drawCards(1).then(
      resolve => {
        //Send Drawn Card to everyone :)
        for (let card of resolve) {
          card.type = "TC";
          card.subType = "CARD";
          ioSocket.emit(
            EVENTS.REQUEST_DRAW_CARD,
            storeTableTopElement(card)
          );
        }
      },
      reject => {
        console.log(reject);
      }
    );
  });

  client.on(EVENTS.REQUEST_UPDATE_TABLETOP, elt => {
    const { id, x, y, width, height } = elt;
    const updated = updateTableTopElement(id, x, y, width, height);
    if (updated) {
      ioSocket.emit(EVENTS.REQUEST_UPDATE_TABLETOP, updated);
    }
  });
});
//#endregion
//#region --------------------- Express ---------------------
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

server.listen(PORT, () => {
  console.log("Listening");
});
//#endregion
