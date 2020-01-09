import React, { useState, useEffect } from "react";
import P5Wrapper from "react-p5-wrapper";
import {
  subscribeCanvas,
  unsubscribeCanvas,
  updateCanvas,
  getCanvas
} from "../api";
import {
  storeShape /*, storeRectangle, storeLine, storeEllipse*/
} from "../p5api";
import "./Tabletop.css";

export const Tabletop = props => {
  const MODES = {
    SELECT: 0,
    DRAG: 1,
    DRAW: 2,
    DRAGELEMENTS: 3
  };

  const [mode, setMode] = useState(MODES.SELECT);
  const [zoom, setZoom] = useState(1);
  const [drawings, setDrawings] = useState([]);
  const [sketch] = useState(getSketch);

  function getSketch() {
    return function sketch(p) {
      //#region LAYERS FOR THE CANVAS
      let backgroundLayer;
      let drawingLayer;
      let tempLayer;
      //#endregion

      //#region OFFSETS WHEN MOVING THE CANVAS
      let xOff = 0;
      let yOff = 0;
      //#endregion

      //#region VARIABLES WHICH HOLD PROPS
      let mode;
      let zoom;
      let drawings;

      //default Size for Tiles
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
        drawingLayer = p.createGraphics(width, height);
        drawingLayer.noFill();
        drawingLayer.frameRate(0);
        tempLayer = p.createGraphics(width, height);
        p.frameRate(30);
      };

      p.myCustomRedrawAccordingToNewPropsHandler = props => {
        mode = props.mode;
        zoom = props.zoom;
        drawings = props.drawings;

        //#region REDRAW DRAWING LAYER WHEN PROPS CHANGE
        (function() {
          if (!drawingLayer) return;
          drawingLayer.clear();

          for (let obj of drawings) {
            if (obj === undefined) continue;
            const { type } = obj;

            drawingLayer.push();
            switch (type) {
              case "SHAPE":
                const { stroke, fill, points, shape_close } = obj;
                drawingLayer.beginShape();

                if (stroke) {
                  drawingLayer.strokeWeight(stroke.weight);
                  drawingLayer.stroke(
                    stroke.color.r,
                    stroke.color.g,
                    stroke.color.b
                  );
                }
                if (fill.color) {
                  drawingLayer.fill(fill.color.r, fill.color.g, fill.color.b);
                }

                for (let p of points) {
                  drawingLayer.vertex(p.x, p.y);
                }
                if (shape_close) drawingLayer.endShape(drawingLayer.CLOSE);
                else drawingLayer.endShape();
                break;

              case "RECTANGLE":
                break;

              case "ELLIPSE":
                break;

              case "LINE":
                break;

              default:
                console.error(`Unrecognized shape ${type}`);
                break;
            }
            drawingLayer.pop();
          }
        })();
        //#endregion
      };

      const points = [];
      p.draw = () => {
        p.clear();
        const w = p.width * zoom;
        const h = p.height * zoom;

        p.image(backgroundLayer, xOff, yOff, w, h);
        p.image(drawingLayer, xOff, yOff, w, h);
        p.image(tempLayer, xOff, yOff, w, h);

        const x = p.mouseX / zoom;
        const y = p.mouseY / zoom;
        const prevX = p.pmouseX / zoom;
        const prevY = p.pmouseY / zoom;

        switch (mode) {
          case MODES.DRAW:
            if (p.mouseIsPressed) {
              //If drawing off canvas return
              if (x < 0 || y < 0) return;
              points.push({ x: x - xOff, y: y - yOff });
              tempLayer.ellipse(x - xOff, y - yOff, 5);
            } else {
              if (points.length > 0) {
                const obj = storeShape(3, { r: 255, g: 0, b: 0 }, null, points);
                updateCanvas(obj);
                points.splice(0, points.length);
                tempLayer.clear();
              }
            }

            break;

          case MODES.DRAG:
            if (p.mouseIsPressed) {
              xOff += x - prevX;
              yOff += y - prevY;
            }
            break;

          default:
            break;
        }
      };
    };
  }

  useEffect(() => {
    getCanvas(drawings => {
      setDrawings(drawings);
    });
  }, []);

  useEffect(() => {
    subscribeCanvas(drawing => {
      setDrawings([...drawings, drawing]);
    });

    return () => {
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
      <div className="sketchContainer">
        <P5Wrapper
          mode={mode}
          zoom={zoom}
          drawings={drawings}
          sketch={sketch}
        />
      </div>
    </div>
  );
};
