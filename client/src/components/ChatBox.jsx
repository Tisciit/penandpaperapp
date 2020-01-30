import React, { useState, useEffect, useRef } from "react";
import { subscribeChat, sendChat, changeName, gm_Change_song } from "../api";
import "./ChatBox.css";

const scrollToBottom = obj => obj.scrollTo(0, obj.scrollHeight);

export const ChatBox = () => {
  //Reveice Chat events

  const refHistory = useRef(null);
  const [message, setMessage] = useState("Type the message");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    subscribeChat(data => {
      console.log("received");
      const tmp = [
        ...history,
        <p key={data.id}>
          {data.user}: {data.message}
        </p>
      ];
      setHistory(tmp);
      //console.log(tmp);
      //Will be re-applied when effect is run again
    }, true);
  }, [history]);

  useEffect(() => {
    scrollToBottom(refHistory.current);
  }, [history]);

  const sendMsg = () => {
    if (message === "") {
      return;
    }

    if (message.startsWith("/")) {
      //This is a command
      const command = message.substr(1);
      const split = command.split(" ");
      switch (split[0]) {
        case "name":
          changeName(split[1]);
          break;
        case "gmcs":
          console.log("Changing song");
          gm_Change_song(split[1]);
          break;

        default:
          console.log("Command not recognized");
          break;
      }
    } else {
      sendChat(message);
    }

    setMessage("");
  };

  return (
    <div className="ChatWrapper">
      <div ref={refHistory} className="Chathistory">
        {history.map(elt => elt)}
      </div>
      <div className="Controls">
        <input
          onKeyDown={e => {
            if (e.keyCode === 13) {
              sendMsg();
            }
          }}
          onChange={e => {
            setMessage(e.target.value);
          }}
          value={message}
        />
        <button onClick={sendMsg}>Send</button>
      </div>
    </div>
  );
};
