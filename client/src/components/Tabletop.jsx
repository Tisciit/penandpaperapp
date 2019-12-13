import React, { useRef, useState } from "react";
import P5Wrapper from "react-p5-wrapper";
import "./Tabletop.css";

export const Tabletop = props => {
  const sketchContainer = useRef(null);

  const MODES = {
    SELECT: 0,
    DRAG: 1,
    DRAW: 2,
    DRAGELEMENTS: 3
  };

  const [mode, setMode] = useState(MODES.SELECT);
  const [zoom, setZoom] = useState(1);
  // const [xOffset, setXOffset] = useState(0);
  // const [yOffset, setYOffset] = useState(0);

  const sketch = p => {
    let backgroundLayer;
    let drawingLayer;
    //Zoom is based on component-state
    //#region
    const RADIUS = 50;

    p.setup = () => {
      const COLS = props.COLS || 160;
      const ROWS = props.ROWS || 90;
      const width = RADIUS * COLS;
      const height = RADIUS * ROWS;
      p.createCanvas(width, height);
      backgroundLayer = p.createGraphics(width, height);

      const h = RADIUS * Math.sin(Math.PI / 3);
      const offset = 1.5 * RADIUS;

      let i = 0;
      for (let y = 0; y < height; y += h) {
        i++;
        const o = i % 2 === 0 ? offset : 0;
        for (let x = o; x < width; x += 3 * RADIUS) {
          backgroundLayer.fill(backgroundLayer.color(255, 0, 0));
          backgroundLayer.noStroke();
          backgroundLayer.strokeWeight(1);
          backgroundLayer.ellipse(x, y, 2);
          calculateEdges(x, y);
        }
      }

      function calculateEdges(x, y) {
        backgroundLayer.noFill();
        backgroundLayer.stroke(255);
        backgroundLayer.beginShape();
        for (let a = 0; a < 6; a++) {
          let x_ = x + RADIUS * Math.cos((a * Math.PI) / 3);
          let y_ = y + RADIUS * Math.sin((a * Math.PI) / 3);
          backgroundLayer.vertex(x_, y_);
        }

        backgroundLayer.endShape(p.CLOSE);
      }

      drawingLayer = p.createGraphics(width, height);
      p.image(backgroundLayer, 0, 0);
    };

    p.draw = () => {
      p.clear();
      if (p.mouseIsPressed) {
        drawingLayer.ellipse(p.mouseX, p.mouseY, 10);
      }

      const w = p.width * zoom;
      const h = p.height * zoom;

      p.image(backgroundLayer, 0, 0, w, h);
      p.image(drawingLayer, 0, 0, w, h);
    };
  };

  return (
    <div className="tabletopWrapper">
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
            setZoom(zoom + 0.2);
          }}
        >
          -
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setZoom(zoom - 0.2);
          }}
        >
          +
        </button>
        {mode}
      </div>
      <div className="svgContainer">
        <P5Wrapper ref={sketchContainer} sketch={sketch} />
      </div>
    </div>
  );
};
