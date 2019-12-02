import React from 'react';
import io from "socket.io-client";
import './App.css';

function App() {

  const socket = io(":5000");
  
  socket.on("message", () => {
    console.log("message");
  })

  return (
    <div className="App">
      <header className="App-header">
        <div>Hello! Edit src/App.js!</div>
      </header>
    </div>
  );
}

export default App;
