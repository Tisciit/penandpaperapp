import React, { useState } from "react";
import P5Wrapper from "react-p5-wrapper";
import { sketch } from "./TableTopSketch";
import "./Tabletop.css";

import pointer from "../../svg/touch_app-24px.svg";
import draw from "../../svg/gesture-24px.svg";
import zoomin from "../../svg/zoom_in-24px.svg";
import zoomout from "../../svg/zoom_out-24px.svg";
import { DrawingTypeSelector } from "./DrawingTypeSelector";

export const MODES = {
  SELECT: 0,
  DRAG: 1,
  DRAW: 2,
  DRAGELEMENTS: 3
};

export const strokeColor = {
  r: 255,
  g: 255,
  b: 255,
  a: 255
};

export const fillColor = {
  r: 255,
  g: 255,
  b: 255,
  a: 255
};

export const Tabletop = () => {
  const [mode, setMode] = useState(MODES.SELECT);
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => {
    setZoom(zoom + 0.01);
  };

  const zoomOut = () => {
    setZoom(zoom - 0.01);
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
          strokeColor={strokeColor}
          fillColor={fillColor}
        />
      </div>
      <div className="Controls">
        <button
          className="btn_round"
          onClick={() => {
            setMode(MODES.SELECT);
          }}
        >
          <img src={pointer} />
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setMode(MODES.DRAW);
          }}
        >
          <img src={draw} />
          <DrawingTypeSelector />
        </button>
        <button className="btn_round" onClick={zoomOut}>
          <img src={zoomout} />
        </button>
        <button className="btn_round" onClick={zoomIn}>
          <img src={zoomin} />
        </button>
        {Math.round(zoom * 100) / 100}
        ||
        {mode}
      </div>
    </div>
  );
};
