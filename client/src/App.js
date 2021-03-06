import React from "react";

import "./App.css";
import { Navbar } from "./components/Navbar";
import { ChatBox } from "./components/ChatBox";
import { DiceArea } from "./components/DiceArea/DiceArea";
//import { AudioPlayer } from "./components/AudioPlayer";
import Tabletop, { ImageSelector, ColorSelector } from "./components/Tabletop";
import Content from "./components/Content";
import NavSelector from "./components/NavSelector";

import messageIcon from "./svg/message-24px.svg";
import gameIcon from "./svg/games-24px.svg";
import libraryIcon from "./svg/photo_library-24px.svg";
import colorizIcon from "./svg/colorize-24px.svg";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Content>
        <Tabletop rows="100" cols="100" />
        <NavSelector>
          <ChatBox image={messageIcon} />
          <DiceArea image={gameIcon} />
          <ImageSelector image={libraryIcon} />
          <ColorSelector image={colorizIcon} />
        </NavSelector>
      </Content>
    </div>
  );
}

export default App;
