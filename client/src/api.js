import io from "socket.io-client";

//#region --------------------- Server Constants ---------------------
const EVENTS = {
  SEND_CHAT_MESSAGE: "SEND_CHAT_MESSAGE",
  CHANGE_NAME: "CHANGE_NAME",
  CHANGE_AUDIO: "CHANGE_AUDIO",
  REQUEST_DICE_ROLL: "REQUEST_DICE_ROLL",
  REQUEST_EXISTING_TABLETOP: "REQUEST_EXISTING_TABLETOP",
  SEND_NEW_DRAWING: "SEND_NEW_DRAWING",
  REQUEST_DELETION: "REQUEST_DELETION",
  REQUEST_DRAW_CARD: "REQUEST_DRAW_CARD",
  REQUEST_NEW_TOKEN: "REQUEST_NEW_TOKEN",
  REQUEST_UPDATE_TABLETOP: {
    IDENTIFIER: "REQUEST_UPDATE_TABLETOP",
    OPTIONS: {
      ADD: "ADD",
      UPDATE: "UPDATE",
      DELETE: "DELETE"
    }
  }
};

const PORT = 8080;
const SERVER_HOST = "http://localhost:5000";
export const audioURL = `${SERVER_HOST}/audio`;
export const assetURL = `${SERVER_HOST}/assets`;
const socket = io(SERVER_HOST);

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
export const subscribeDice = (cb, once) => {
  if (once) {
    socket.once(EVENTS.REQUEST_DICE_ROLL, data => cb(data));
  } else {
    socket.on(EVENTS.REQUEST_DICE_ROLL, data => cb(data));
  }
};

export const unsubscribeDice = callback => {
  unsubscribeEvent(EVENTS.REQUEST_DICE_ROLL, callback);
};

export const rollDice = diceString => {
  socket.emit(EVENTS.REQUEST_DICE_ROLL, diceString);
};
//#endregion
//#region --------------------- Interaction with TableTop --------------------------

//#region ------------------ Subscribes ---------------------
export const subscribeTableTopUpdates = (cb, once = false) => {
  const handler = transmitted => {
    console.log(transmitted);

    const { operation, data } = transmitted;

    cb(operation, data);
  };

  if (once) {
    socket.once(EVENTS.REQUEST_UPDATE_TABLETOP.IDENTIFIER, transmitted =>
      handler(transmitted)
    );
  } else {
    socket.on(EVENTS.REQUEST_UPDATE_TABLETOP.IDENTIFIER, data => handler(data));
  }
};
//#endregion
//#region ------------------ Unsubscribes ---------------------
export const unsubscribeTableTopUpdates = () => {
  socket.off(EVENTS.REQUEST_UPDATE_TABLETOP);
};
//#endregion
//#region ------------------ "Active" Events ---------------------
/**
 * Requests existing tabletop once and executes callback on response
 * @param {callback} cb
 */
export const getExistingTableTop = cb => {
  socket.once(EVENTS.REQUEST_EXISTING_TABLETOP, data => cb(data));
  socket.emit(EVENTS.REQUEST_EXISTING_TABLETOP);
};
export const sendNewDrawing = obj => {
  socket.emit(EVENTS.SEND_NEW_DRAWING, obj);
};
export const deleteDrawing = id => {
  socket.emit(EVENTS.REQUEST_DELETION, id);
};
export const updateTableTopElement = elt => {
  const { id, x, y, width, height } = elt;
  if (x && y && width && height) {
    const data = { id, x, y, width, height };
    socket.emit(EVENTS.REQUEST_UPDATE_TABLETOP, data);
  }
};
export const addToken = token => {
  socket.emit(EVENTS.REQUEST_NEW_TOKEN, token);
};
export const drawCard = () => {
  socket.emit(EVENTS.REQUEST_DRAW_CARD);
};
//#endregion
//-----------------------------------------------
//#endregion
//#region --------------------- Other ---------------------
export const changeName = newName => {
  socket.emit(EVENTS.CHANGE_NAME, newName);
};

//#endregion
