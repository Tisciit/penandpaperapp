import io from "socket.io-client";

//#region --------------------- Server Constants ---------------------
const socket = io(":5000");

const EVENTS = {
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

const PORT = 5000;
//#endregion
//#region --------------------- Helper Functions ---------------------
const unsubscribeEvent = (event, callback) => {
  if (callback) {
    //Unsubscribe only from given callback
    socket.off(event, callback);
  } else {
    //Unsubscribe from all Callbacks
    socket.off(event);
  }
};
//#endregion
//#region --------------------- Chat ---------------------
export const subscribeChat = (cb, once = false) => {
  if (once) {
    socket.once(EVENTS.SEND_CHAT_MESSAGE, data => cb(data));
  } else {
    socket.on(EVENTS.SEND_CHAT_MESSAGE, data => cb(data));
  }
};
export const unsubscribeChat = () => {
  unsubscribeEvent(EVENTS.SEND_CHAT_MESSAGE);
};
export const sendChat = message => {
  socket.emit(EVENTS.SEND_CHAT_MESSAGE, message);
};
//#endregion
//#region --------------------- Audio ---------------------

export const audioURL = `http://${window.location.hostname}:${PORT}/audio`;

export const subscribeAudio = (cb, once = false) => {
  if (once) {
    socket.once(EVENTS.CHANGE_AUDIO, data => cb(data));
  } else {
    socket.on(EVENTS.CHANGE_AUDIO, data => cb(data));
  }
};

export const unsubscribeAudio = () => {
  unsubscribeEvent(EVENTS.CHANGE_AUDIO);
};

export const gm_Change_song = newSong => {
  socket.emit(EVENTS.CHANGE_AUDIO, newSong);
};
//#endregion
//#region --------------------- Dice ---------------------
export const subscribeDice = cb => {
  socket.once(EVENTS.ROLL_DICE, data => cb(data));
};

export const unsubscribeDice = () => {
  unsubscribeEvent(EVENTS.ROLL_DICE);
};

export const rollDice = diceString => {
  socket.emit(EVENTS.ROLL_DICE, diceString);
};
//#endregion
//#region --------------------- Interaction with TableTop --------------------------

/**
 * Requests existing tabletop once and executes callback on response
 * @param {callback} cb
 */
export const getExistingTableTop = cb => {
  socket.once(EVENTS.REQUEST_EXISTING_TABLETOP, data => cb(data));
  socket.emit(EVENTS.REQUEST_EXISTING_TABLETOP);
};

export const subscribeDrawings = (cb, once = false) => {
  if (once) {
    socket.once(EVENTS.SEND_NEW_DRAWING, data => cb(data));
  } else {
    socket.on(EVENTS.SEND_NEW_DRAWING, data => cb(data));
  }
};
export const unsubscribeDrawings = () => {
  unsubscribeEvent(EVENTS.SEND_NEW_DRAWING);
};
export const sendNewDrawing = obj => {
  socket.emit(EVENTS.SEND_NEW_DRAWING, obj);
};
export const subscribeDeletions = (cb, once = false) => {
  if (once) {
    socket.once(EVENTS.REQUEST_DELETION_DRAWING, data => cb(data));
  } else {
    socket.on(EVENTS.REQUEST_DELETION_DRAWING, data => cb(data));
  }
};
export const unsubscribeDeletions = () => {
  unsubscribeEvent(EVENTS.REQUEST_DELETION_DRAWING);
};
export const deleteDrawing = id => {
  socket.emit(EVENTS.REQUEST_DELETION_DRAWING, id);
};


export const updateTokenCard = elt => {
  socket.emit(EVENTS.REQUEST_UPDATE_TOKENCARD, elt);
};
export const subscribeTokenCards = (cb, once = false) => {
  if (once) {
    socket.once(EVENTS.REQUEST_UPDATE_TOKENCARD, data => cb(data));
  } else {
    socket.on(EVENTS.REQUEST_UPDATE_TOKENCARD, data => cb(data));
  }
};
export const addToken = token => {
  socket.emit(EVENTS.REQUEST_NEW_TOKEN, token);
};
export const drawCard = () => {
  socket.emit(EVENTS.REQUEST_DRAW_CARD);
};
export const subscribeCards = (cb, once = false) => {
  if (once) {
    socket.once(EVENTS.REQUEST_DRAW_CARD, data => cb(data));
  } else {
    socket.on(EVENTS.REQUEST_DRAW_CARD, data => cb(data));
  }
};

//-----------------------------------------------
//#endregion
//#region --------------------- Other ---------------------
export const changeName = newName => {
  socket.emit(EVENTS.COMMAND_NAME, newName);
};

export const assetURL = `http://${window.location.hostname}:${PORT}/assets`;
//#endregion
