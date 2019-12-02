import React from 'react';
import io from "socket.io-client";
import './App.css';
import { ChatBox } from "./components/ChatBox"

function App() {

  const socket = io(":5000");

  return (
    <div className="App">
      <header className="App-header">
        <div>Hello! Edit src/App.js!</div>
        <ChatBox socket={socket} />
      </header>
    </div>
  );
}

export default App;
