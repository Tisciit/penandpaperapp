const app = require("express")();
const server = require("http").createServer(app);
const ioSocket = require("socket.io")(server);
const fs = require("fs");
const deckapi = require("./deckofcardsapi");

const chatHistory = [];
const drawing = [];
let drawingId = 1;

const tokens = [];
let tokenId = 1;
const cards = [];
let cardId = 1;
let currentSong = "./sound/beat3.mp3";

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
    console.log(`Client ${client.id} requested existing drawings`);
    client.emit(EVENTS.GETCANVAS, drawing);
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
    deckapi.drawCards(1).then(
      resolve => {
        //Send Drawn Card to everyone :)
        const card = Object.assign(resolve, { id: cardId++ });
        cards.push(card);
        ioSocket.emit(EVENTS.DRAWCARD, card);
      },
      reject => {
        console.log(reject);
      }
    );
  });

  client.on(EVENTS.UPDATETOKENORCARD, elt => {
    if (elt.type === "CARD") {
      const card = cards.find(c => c.id === elt.id);
      card.x = elt.x;
      card.y = elt.y;
      ioSocket.emit(EVENTS.UPDATETOKENORCARD, card);
    }
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

deckapi.shuffleDeck();

const PORT = 5000;
server.listen(PORT, () => {
  console.log("Listening");
});
