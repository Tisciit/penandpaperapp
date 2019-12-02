import React, { useState } from "react";

export const ChatBox = (props) => {

    const { socket } = props;

    const [message, setMessage] = useState("This is a test");

    const sendMsg = () => {
        console.log(socket);
        socket.emit("message", message);
    }

    return (
        <div className="ChatWrapper">
            <div className="Chathistory" />
            <input type="text" name="" id="" />
            <button onClick={sendMsg}>Send</button>
        </div>
    )
}