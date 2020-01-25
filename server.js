const express = require("express");
const app = express();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);
const fs = require("fs");
const deckapi = require("./deckofcardsapi");

const {
  analysePoints,
  convertIncomingDrawing,
  storeDrawing,
  getDrawings
} = require("./TableTopApi");

const chatHistory = [];

const tokenCards = [];
let tokenCardId = 1;
let currentSong = "./static/sound/beat3.mp3";

const EVENTS = {
  // NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
  // COMMAND_NAME: "COMMAND_NAME",
  // AUDIO_CHANGE: "AUDIO_CHANGE",
  // ROLL_DICE: "ROLL_DICE",
  // CANVAS: "CANVAS",
  // GETCANVAS: "GETCANVAS",
  // REMOVECANVAS: "REMOVECANVAS",
  // DRAWCARD: "DRAW_CARD",
  // UPDATETOKENORCARD: "UPDATE_TOKENCARD",

  SEND_CHAT_MESSAGE: "SEND_CHAT_MESSAGE",
  CHANGE_NAME: "CHANGE_Name",
  CHANGE_AUDIO: "CHANGE_AUDIO",
  REQUEST_DICE_ROLL: "REQUEST_DICE_ROLL",
  REQUEST_EXISTING_TABLETOP: "REQUEST_EXISTING_TABLETOP",
  SEND_NEW_DRAWING: "SEND_NEW_DRAWING",
  REQUEST_DELETION_DRAWING: "REQUEST_DELETION",
  REQUEST_DRAW_CARD: "REQUEST_DRAW_CARD",
  REQUEST_NEW_TOKEN: "REQUEST_NEW_TOKEN",
  REQUEST_UPDATE_TOKENCARD: "REQUEST_UPDATETOKENCARD",
  REQUEST_DELETION_TOKENCARD: "REQUEST_DELETION_TOKENCARD"
};
deckapi
  .shuffleDeck()
  .then(data => console.log(data))
  .catch(err => console.log(err));

const PORT = 8080;

//#region --------------------- Socket ---------------------
ioSocket.on("connection", client => {
  client.on(EVENTS.COMMAND_NAME, newName => {
    console.log(EVENTS.COMMAND_NAME);
    client.name = newName;
  });

  client.on(EVENTS.SEND_CHAT_MESSAGE, message => {
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

  client.on(EVENTS.CHANGE_AUDIO, newSong => {
    console.log("GM CHANGED SONG TO " + newSong);
    currentSong = `./sound/${newSong}.mp3`;
    ioSocket.emit(EVENTS.AUDIO_CHANGE, newSong);
  });

  client.on(EVENTS.REQUEST_DICE_ROLL, (diceString, options) => {
    const ROLLTOOPTIONS = {
      EVERYONE: 1,
      SELF: 2,
      GM: 3
    };

    const rollTo = options.rollTo || ROLLTOOPTIONS.EVERYONE;
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

      const stored = storeDrawing(drawing);
      ioSocket.emit(EVENTS.SEND_NEW_DRAWING, stored);
    }
  });

  client.on(EVENTS.REQUEST_EXISTING_TABLETOP, () => {
    console.log(`Client ${client.id} requested existing tabletop`);
    client.emit(EVENTS.REQUEST_EXISTING_TABLETOP, {
      drawing: getDrawings(),
      tokenCards
    });
  });

  client.on(EVENTS.REQUEST_DELETION_DRAWING, id => {
    console.log(
      `Client ${client.id} requested deletion of drawing with id ${id}`
    );
    const elt = drawing.find(elt => elt.id === id);
    if (elt) {
      const index = drawing.indexOf(elt);
      drawing.splice(index, 1);
      console.log("Element has been deleted");

      ioSocket.emit(EVENTS.REQUEST_DELETION_DRAWING, id);
    }
  });

  client.on(EVENTS.REQUEST_NEW_TOKEN, token => {
    console.log(token);
    if (token.image) {
      //Valid token?
      token.id = tokenCardId++;
      token.type = "TC";
      token.subType = "TOKEN";
      token.x = token.x || 0;
      token.y = token.y || 0;
      tokenCards.push(token);
      ioSocket.emit(EVENTS.REQUEST_UPDATE_TOKENCARD, token);
    }
  });
  client.on(EVENTS.REQUEST_DRAW_CARD, () => {
    console.log(`Client with id ${client.id} requested a card`);
    deckapi.drawCards(1).then(
      resolve => {
        //Send Drawn Card to everyone :)
        for (let card of resolve) {
          card.id = tokenCardId++;
          card.type = "TC";
          card.subType = "CARD";
        }
        tokenCards.push(...resolve);
        ioSocket.emit(EVENTS.REQUEST_UPDATE_TOKENCARD, resolve);
      },
      reject => {
        console.log(reject);
      }
    );
  });

  client.on(EVENTS.REQUEST_UPDATE_TOKENCARD, elt => {
    const tokenCard = tokenCards.find(c => c.id === elt.id);
    console.log(tokenCard);
    if (tokenCard) {
      tokenCard.x = elt.x;
      tokenCard.y = elt.y;
      ioSocket.emit(EVENTS.REQUEST_UPDATE_TOKENCARD, tokenCard);
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
