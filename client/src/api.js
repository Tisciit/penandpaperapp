import io from "socket.io-client";
const socket = io(":5000");

const EVENTS = {
  NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
  COMMAND_NAME: "COMMAND_NAME",
  AUDIO_CHANGE: "AUDIO_CHANGE",
  ROLL_DICE: "ROLL_DICE",
  CANVAS: "CANVAS",
  GETCANVAS: "GETCANVAS",
  REMOVECANVAS: "REMOVECANVAS",
  DRAWCARD: "DRAW_CARD"
};

//#region  Helper Functions
//-----------------------------------------------
const unsubscribeEvent = (event, callback) => {
  if (callback) {
    //Unsubscribe only from given callback
    socket.off(event, callback);
  } else {
    //Unsubscribe from all Callbacks
    socket.off(event);
  }
};
//-----------------------------------------------
//#endregion

//#region  Chat
//-----------------------------------------------
export const subscribeChat = cb => {
  socket.once(EVENTS.NEW_CHAT_MESSAGE, data => cb(data));
};

export const unsubscribeChat = () => {
  unsubscribeEvent(EVENTS.NEW_CHAT_MESSAGE);
};

export const sendChat = message => {
  socket.emit(EVENTS.NEW_CHAT_MESSAGE, message);
};
//-----------------------------------------------
//#endregion

//#region  Audio
//-----------------------------------------------
export const audioURL = "http://" + window.location.hostname + ":5000/audio";

export const subscribeAudio = cb => {
  socket.once(EVENTS.AUDIO_CHANGE, data => cb(data));
};

export const unsubscribeAudio = () => {
  unsubscribeEvent(EVENTS.AUDIO_CHANGE);
};

export const gm_Change_song = newSong => {
  socket.emit(EVENTS.AUDIO_CHANGE, newSong);
};
//-----------------------------------------------
//#endregion

//#region  Dice
//-----------------------------------------------
export const subscribeDice = cb => {
  socket.once(EVENTS.ROLL_DICE, data => cb(data));
};

export const unsubscribeDice = () => {
  unsubscribeEvent(EVENTS.ROLL_DICE);
};

export const rollDice = diceString => {
  socket.emit(EVENTS.ROLL_DICE, diceString);
};
//-----------------------------------------------
//#endregion

//#region  Canvas
//-----------------------------------------------
export const subscribeCanvas = cb => {
  socket.once(EVENTS.CANVAS, data => {
    console.log("CANVAS");
    cb(data);
  });
};

export const unsubscribeCanvas = () => {
  unsubscribeEvent(EVENTS.CANVAS);
};

export const updateCanvas = obj => {
  socket.emit(EVENTS.CANVAS, obj);
};

export const getCanvas = cb => {
  socket.on(EVENTS.GETCANVAS, data => {
    cb(data);
    socket.off(EVENTS.GETCANVAS);
  });
  socket.emit(EVENTS.GETCANVAS);
};

export const deleteDrawing = id => {
  socket.emit(EVENTS.REMOVECANVAS, id);
};

export const subscribeDeletions = cb => {
  socket.once(EVENTS.REMOVECANVAS, data => cb(data));
};

export const unsubscribeDeletions = cb => {
  unsubscribeEvent(EVENTS.REMOVECANVAS, cb);
}
//-----------------------------------------------
//#endregion

//#region  Cards
//-----------------------------------------------
export const drawCard = (cb) => {
  socket.emit(EVENTS.DRAWCARD);

  socket.once(EVENTS.DRAWCARD, (data) => {
    console.log(data);
    cb(data);
  })
};
//-----------------------------------------------
//#endregion

//#region  Other
//-----------------------------------------------
export const changeName = newName => {
  socket.emit(EVENTS.COMMAND_NAME, newName);
};
//-----------------------------------------------
//#endregion
