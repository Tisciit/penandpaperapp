import React from "react";

import "./App.css";
import { Navbar } from "./components/Navbar";
import { ChatBox } from "./components/ChatBox";
import { DiceArea } from "./components/DiceArea/DiceArea";
//import { AudioPlayer } from "./components/AudioPlayer";
import { Tabletop } from "./components/Tabletop/Tabletop";
import Content from "./components/Content";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Content>
        <Tabletop rows="100" cols="100" />
        <ChatBox />
      </Content>
    </div>
  );
}

export default App;
