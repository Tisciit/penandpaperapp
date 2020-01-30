import React, { useState } from "react";
import P5Wrapper from "react-p5-wrapper";
import { sketch } from "./TableTopSketch";
import { ImageSelector } from "./ImageSelector";
import "./Tabletop.css";

export const MODES = {
  SELECT: 0,
  DRAG: 1,
  DRAW: 2,
  DRAGELEMENTS: 3
};

export const Tabletop = () => {
  const [mode, setMode] = useState(MODES.SELECT);
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => {
    setZoom(zoom - 0.01);
  };

  const zoomOut = () => {
    setZoom(zoom + 0.01);
  };

  const changeMode = newMode => {
    setMode(newMode);
  };

  return (
    <div className="tabletopWrapper">
      <div className="sketchContainer">
        <P5Wrapper
          container=".sketchContainer"
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          changeMode={changeMode}
          mode={mode}
          zoom={zoom}
          sketch={sketch}
        />
      </div>
      <ImageSelector />
      <div className="Controls">
        <button
          className="btn_round"
          onClick={() => {
            setMode(MODES.SELECT);
          }}
        >
          SELECT
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setMode(MODES.DRAG);
          }}
        >
          Drag
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setMode(MODES.DRAW);
          }}
        >
          Draw
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setMode(MODES.DRAGELEMENTS);
          }}
        >
          Drag Stuff
        </button>
        <button className="btn_round" onClick={zoomOut}>
          -
        </button>
        <button className="btn_round" onClick={zoomIn}>
          +
        </button>
        {zoom}
        ||
        {mode}
      </div>
    </div>
  );
};
