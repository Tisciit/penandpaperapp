import io from "socket.io-client";
const socket = io(":5000");

const EVENTS = {
  NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
  COMMAND_NAME: "COMMAND_NAME",
  AUDIO_CHANGE: "AUDIO_CHANGE",
  ROLL_DICE: "ROLL_DICE",
  CANVAS: "CANVAS",
  GETCANVAS: "GETCANVAS"
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
  socket.on(EVENTS.NEW_CHAT_MESSAGE, data => cb(data));
};

export const unsubscribeChat = cb => {
  unsubscribeEvent(EVENTS.NEW_CHAT_MESSAGE, cb);
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
  socket.on(EVENTS.AUDIO_CHANGE, data => cb(data));
};

export const unsubscribeAudio = cb => {
  unsubscribeEvent(EVENTS.AUDIO_CHANGE, cb);
};

export const gm_Change_song = newSong => {
  socket.emit(EVENTS.AUDIO_CHANGE, newSong);
};
//-----------------------------------------------
//#endregion

//#region  Dice
//-----------------------------------------------
export const subscribeDice = cb => {
  socket.on(EVENTS.ROLL_DICE, data => cb(data));
};

export const unsubscribeDice = cb => {
  unsubscribeEvent(EVENTS.ROLL_DICE, cb);
};

export const rollDice = diceString => {
  socket.emit(EVENTS.ROLL_DICE, diceString);
};
//-----------------------------------------------
//#endregion

//#region  Canvas
//-----------------------------------------------
export const subscribeCanvas = cb => {
  socket.on(EVENTS.CANVAS, data => {
    console.log("CANVAS");
    cb(data);
  });
};

export const unsubscribeCanvas = cb => {
  unsubscribeEvent(EVENTS.CANVAS, cb);
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
//-----------------------------------------------
//#endregion

//#region  Other 
//-----------------------------------------------
export const changeName = newName => {
  socket.emit(EVENTS.COMMAND_NAME, newName);
};
//-----------------------------------------------
//#endregion