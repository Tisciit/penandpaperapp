import io from "socket.io-client";
const socket = io(":5000");

const CHAT = "CHAT";
const AUDIO = "AUDIO";
const DICE_ROLL = "DICE_ROLL"
const DICE_RESU = "DICE_RESULT"
const C_NAME = "/NAME";


export const subscribeChat = cb => {
    socket.on(CHAT, data => cb(data));
};

export const unsubscribeChat = () => {
    socket.off(CHAT);
};

export const sendChat = message => {
    socket.emit(CHAT, message);
};

export const changeName = newName => {
    socket.emit(C_NAME, newName);
};

export const audioURL = "http://" + window.location.hostname + ":5000/audio";

export const subAudio = cb => {
    socket.on(AUDIO, data => cb(data));
};

export const unsubAudio = () => {
    socket.off(AUDIO);
};

export const gm_Change_song = (newSong) => {
    socket.emit("GM_CHANGE_SONG", newSong)
}

export const requestRoll = (parameters) => {
    socket.emit(DICE_ROLL, parameters);
}

export const subscribeRollResult = cb => {
    socket.on("ROLL_RESULT", data => cb(data));
}

export const unsubscribeRollResult = cb => {
    socket.off("ROLL_RESULT");
}