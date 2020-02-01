import React from "react";

import "./App.css";
import { Navbar } from "./components/Navbar";
import { ChatBox } from "./components/ChatBox";
import { DiceArea } from "./components/DiceArea/DiceArea";
//import { AudioPlayer } from "./components/AudioPlayer";
import { Tabletop } from "./components/Tabletop/Tabletop";
import Content from "./components/Content";
import NavSelector from "./components/NavSelector";

import messageIcon from "./svg/message-24px.svg";
import gameIcon from "./svg/games-24px.svg";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Content>
        <Tabletop rows="100" cols="100" />
        <NavSelector>
          <ChatBox image={messageIcon} />
          <DiceArea image={gameIcon} />
        </NavSelector>
      </Content>
    </div>
  );
}

export default App;
