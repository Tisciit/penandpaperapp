import React from "react";

import "./App.css";
import { Navbar } from "./components/Navbar";
import { ChatBox } from "./components/ChatBox";
import { DiceArea } from "./components/DiceArea/DiceArea";
//import { AudioPlayer } from "./components/AudioPlayer";
import { Tabletop } from "./components/Tabletop/Tabletop";
import Content from "./components/Content";
import NavSelector from "./components/NavSelector";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Content>
        <Tabletop rows="100" cols="100" />
        <NavSelector>
          <ChatBox image={"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Echo_chat_icon.svg/1200px-Echo_chat_icon.svg.png"} />
          <DiceArea image={"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Echo_chat_icon.svg/1200px-Echo_chat_icon.svg.png"} />
        </NavSelector>
      </Content>
    </div>
  );
}

export default App;
