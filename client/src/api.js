import io from "socket.io-client";
const socket = io(":5000");

const EVENTS = {
  NEW_CHAT_MESSAGE: "NEW_CHAT_MESSAGE",
  COMMAND_NAME: "COMMAND_NAME",
  AUDIO_CHANGE: "AUDIO_CHANGE",
  ROLL_DICE: "ROLL_DICE"
};

export const subscribeChat = cb => {
  socket.on(EVENTS.NEW_CHAT_MESSAGE, data => cb(data));
};

export const unsubscribeChat = () => {
  socket.off(EVENTS.NEW_CHAT_MESSAGE);
};

export const sendChat = message => {
  socket.emit(EVENTS.NEW_CHAT_MESSAGE, message);
};

export const changeName = newName => {
  socket.emit(EVENTS.COMMAND_NAME, newName);
};

export const audioURL = "http://" + window.location.hostname + ":5000/audio";

export const subAudio = cb => {
  socket.on(EVENTS.AUDIO_CHANGE, data => cb(data));
};

export const unsubAudio = () => {
  socket.off(EVENTS.AUDIO_CHANGE);
};

export const gm_Change_song = newSong => {
  socket.emit(EVENTS.AUDIO_CHANGE, newSong);
};

export const subscribeDice = cb => {
  socket.on(EVENTS.ROLL_DICE, cb());
};

export const unsubscribeDice = () => {
  socket.off(EVENTS.ROLL_DICE);
};

export const rollDice = (diceString, options) => {
  socket.emit(EVENTS.ROLL_DICE, diceString, options);
};
