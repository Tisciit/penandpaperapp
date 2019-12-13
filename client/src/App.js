import React from "react";

import "./App.css";
import { ChatBox } from "./components/ChatBox";
import { DiceArea } from "./components/DiceArea";
//import { AudioPlayer } from "./components/AudioPlayer";
import { Tabletop } from "./components/Tabletop";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <ChatBox />
        <DiceArea /> */}

        <Tabletop rows="100" cols="100" />
      </header>
    </div>
  );
}

export default App;
