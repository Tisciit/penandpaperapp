import React, { useState, useEffect } from "react";
import { subscribeChat, unsubscribeChat, sendChat, changeName } from "../api";
import "./ChatBox.css";

export const ChatBox = () => {

    //Reveice Chat events

    const [message, setMessage] = useState("This is a test");
    const [history, setHistory] = useState([]);


    useEffect(() => {
        subscribeChat((data) => {
            console.log("received");
            const tmp = [...history, <p key={data.id}>{data.user}: {data.message}</p>];
            setHistory(tmp);
            //console.log(tmp);
            unsubscribeChat();
            //Will be re-applied when effect is run again
        });
    }, [history]);


    const sendMsg = () => {
        if (message.startsWith("/")) {
            //This is a command
            const command = message.substr(1);
            const split = command.split(" ");
            switch (split[0]) {
                case "name":
                    changeName(split[1]);
                    break;
            }
        }
        else {
            sendChat(message);
        }

        setMessage("");
    }

    return (
        <div className="ChatWrapper">
            <div className="Chathistory">
                {history.map(elt => elt)}
            </div>
            <input onKeyDown={(e) => { if (e.keyCode === 13) { sendMsg() } }} onChange={(e) => { setMessage(e.target.value) }} value={message} />
            <button onClick={sendMsg}>Send</button>
        </div>
    )
}