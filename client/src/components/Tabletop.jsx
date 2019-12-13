import React, { useRef, useState, useEffect } from "react";
import P5Wrapper from "react-p5-wrapper";
import { subscribeCanvas, unsubscribeCanvas, updateCanvas } from "../api";
import { storeShape, storeRectangle, storeLine, storeEllipse } from "../p5api";
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
  const [drawings, setDrawings] = useState([]);
  // const [xOffset, setXOffset] = useState(0);
  // const [yOffset, setYOffset] = useState(0);

  const sketch = p => {
    let backgroundLayer;
    let drawingLayer;
    let tempLayer;
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

      //#region Set up the background
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
      //#endregion

      //#region Set up Drawing Layer
      drawingLayer = p.createGraphics(width, height);
      drawingLayer.noFill();
      drawingLayer.frameRate(20);
      for (let obj of drawings) {
        if (obj === undefined) continue;
        const { x, y, type } = obj;
        switch (type) {
          case "VERTEX":
            drawingLayer.vertex(x, y);
            break;
          case "BEGIN":
            const { strokeColor, strokeWidth } = obj;
            drawingLayer.beginShape();
            drawingLayer.stroke(
              drawingLayer.color(strokeColor.r, strokeColor.g, strokeColor.b)
            );
            drawingLayer.strokeWeight(strokeWidth);
            drawingLayer.vertex(x, y);
            break;
          case "END":
            drawingLayer.vertex(x, y);
            drawingLayer.endShape();
            break;
        }
      }
      //#endregion

      tempLayer = p.createGraphics(width, height);
      p.frameRate(20);
    };

    p.draw = () => {
      p.clear();
      const w = p.width * zoom;
      const h = p.height * zoom;

      p.image(backgroundLayer, 0, 0, w, h);
      p.image(drawingLayer, 0, 0, w, h);
      p.image(tempLayer, 0, 0, w, h);
    };

    let points = [];
    p.mouseDragged = function() {
      switch (mode) {
        case MODES.DRAW:
          const x = p.mouseX / zoom;
          const y = p.mouseY / zoom;

          if (x < 0 || y < 0) return;

          points.push({
            x: x,
            y: y,
            type: "VERTEX"
          });

          tempLayer.ellipse(x, y, 5);
          break;
      }
    };

    p.mouseReleased = function() {
      //TODO: https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm

      if (points.length > 3) {
        points[0].type = "BEGIN";
        points[0].strokeWidth = 5;
        points[0].strokeColor = { r: 255, g: 0, b: 0 };
        points[points.length - 1].type = "END";

        updateCanvas(points);
        points = [];
      }
    };
  };

  useEffect(() => {
    subscribeCanvas(point => {
      setDrawings([...drawings, ...point]);
    });

    return () => {
      console.log("UNSUBBED");
      unsubscribeCanvas();
    };
  }, [drawings]);

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
            setZoom(zoom + 0.01);
          }}
        >
          -
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setZoom(zoom - 0.01);
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
