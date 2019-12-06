import React from "react";

import "./App.css";
import { ChatBox } from "./components/ChatBox";
import { DiceArea } from "./components/DiceArea";
import { AudioPlayer } from "./components/AudioPlayer";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>Hello! Edit src/App.js!</div>
        <ChatBox />
        <DiceArea />
        <AudioPlayer />
      </header>
    </div>
  );
}

export default App;
