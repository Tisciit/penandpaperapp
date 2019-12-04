import io from "socket.io-client";
const socket = io(":5000");

const CHAT = "CHAT"

const subscribeChat = (cb) => {
    socket.on(CHAT, data => cb(data));
}

const unsubscribeChat = () => {
    socket.off(CHAT);
}

const sendChat = (message) => {
    socket.emit(CHAT, message);
}

const changeName = (newName) => {
    socket.emit("/name", newName);
}

export { subscribeChat, unsubscribeChat, sendChat, changeName };
