import io from "socket.io-client";
const socket = io(":5000");

const CHAT = "CHAT";
const AUDIO = "AUDIO";
const C_NAME = "/NAME";

const subscribeChat = cb => {
  socket.on(CHAT, data => cb(data));
};

const unsubscribeChat = () => {
  socket.off(CHAT);
};

const sendChat = message => {
  socket.emit(CHAT, message);
};

const changeName = newName => {
  socket.emit(C_NAME, newName);
};

export const audioURL = ("http://localhost:5000/audio");

const subscribeAudio = cb => {
  socket.on(AUDIO, data => cb(data));
};

const unsubscribeAudio = () => {
  socket.off(AUDIO);
};

export { subscribeChat, unsubscribeChat, sendChat, changeName, subscribeAudio, unsubscribeAudio };
