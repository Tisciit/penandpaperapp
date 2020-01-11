import React, { useState, useEffect } from "react";
import P5Wrapper from "react-p5-wrapper";
import {
  subscribeCanvas,
  updateCanvas,
  getCanvas,
  subscribeDeletions,
  deleteDrawing,
  unsubscribeCanvas,
  unsubscribeDeletions
} from "../api";
import {
  storeShape /*, storeRectangle, storeLine, storeEllipse*/
} from "../p5api";
import "./Tabletop.css";

import joker from "./tokens/card-joker.svg";
import dist from "react-p5-wrapper";

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
      let tokens = [];
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

      //Point Buffer for Drawing
      const points = [];

      //contains selected drawing
      const selection = {
        current: undefined,
        token: undefined
      };

      //x,y variables for the centers of tiles
      const anchors = [];

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
            calculateEdges(x, y);
            anchors.push({ x, y });
          }
        }

        function calculateEdges(x, y) {
          backgroundLayer.noFill();
          backgroundLayer.stroke(255, 255, 10);
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
        drawingLayer.noLoop();
        tempLayer = p.createGraphics(width, height);
        tempLayer.noLoop();

        p.loadImage(joker, data => {
          //+1 So that Canvas has an odd with, making it easier to center
          const c = p.createGraphics(RADIUS * 1.5 + 1, RADIUS * 1.5 + 1);
          c.noLoop();
          c.image(data, 0, 0, c.width, c.height);
          tokens.push({
            canvas: c,
            x: getNextAnchor(0, 0).x / 2,
            y: getNextAnchor(0, 0).y / 2
          });
        });
        p.frameRate(30);
      };

      p.myCustomRedrawAccordingToNewPropsHandler = props => {
        mode = props.mode;
        zoom = props.zoom;
        drawings = props.drawings;
        selection.current = undefined;

        //#region REDRAW DRAWING LAYER WHEN PROPS CHANGE
        (function() {
          if (!drawingLayer) return;
          drawingLayer.clear();

          for (const drawing of drawings) {
            drawDrawing(drawing);
          }
        })();
        //#endregion
      };

      p.draw = () => {
        p.clear();
        const w = p.width * zoom;
        const h = p.height * zoom;

        p.image(backgroundLayer, xOff, yOff, w, h);
        p.image(drawingLayer, xOff, yOff, w, h);
        p.image(tempLayer, xOff, yOff, w, h);

        for (let token of tokens) {
          p.image(
            token.canvas,
            token.x + xOff / zoom,
            token.y + yOff / zoom,
            token.canvas.width * zoom,
            token.canvas.height * zoom
          );
        }

        const x = p.mouseX / zoom;
        const y = p.mouseY / zoom;
        const prevX = p.pmouseX / zoom;
        const prevY = p.pmouseY / zoom;

        const relXOff = xOff / zoom;
        const relYOff = yOff / zoom;

        switch (mode) {
          case MODES.DRAW:
            if (p.mouseIsPressed) {
              //If drawing off canvas return
              if (x < 0 || y < 0) return;
              points.push({ x: x - relXOff, y: y - relYOff });
              tempLayer.ellipse(x - xOff / zoom, y - yOff / zoom, 5);
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

          case MODES.SELECT:
            if (p.mouseIsPressed) {
              const selectedDrawing = getSelectedDrawing(
                x - xOff / zoom,
                y - yOff / zoom
              );
              const copy = JSON.parse(JSON.stringify(selectedDrawing));
              if (copy.type !== "none") {
                //Redraw previuosly selected drawing
                drawSelected();
                copy.stroke.color = { r: 0, g: 0, b: 255 };
                drawDrawing(copy);
                selection.current = selectedDrawing;
              }
            }
            break;

          case MODES.DRAGELEMENTS:
            if (p.mouseIsPressed) {
              if (!selection.token) {
                const token = getToken(x, y);
                if (token) {
                  selection.token = token;
                }
              } else {
                //token has been selected;
                // selection.token.x += x - prevX;
                // selection.token.y += y - prevY;

                //OR SNAP
                const newPoint = getNextAnchor(
                  Math.ceil(x + selection.token.x + selection.token.canvas.width) / 2,
                  Math.ceil(y + selection.token.y + selection.token.canvas.height) / 2
                );

                selection.token.x = newPoint.x - (selection.token.canvas.width / 2);
                selection.token.y = newPoint.y - (selection.token.canvas.height / 2);
              }
            }
            if (!p.mouseIsPressed) {
              selection.token = undefined;
            }
            break;

          default:
            break;
        }
      };

      p.keyPressed = e => {
        switch (mode) {
          case MODES.SELECT:
            //46 is Delete key
            if (e.keyCode === 46 && selection.current) {
              deleteDrawing(selection.current.id);
            }
            break;

          default:
            break;
        }
      };

      function getSelectedDrawing(x, y) {
        let tolerance = 1;

        for (let obj of drawings) {
          if (obj === undefined) continue;
          const { type } = obj;

          drawingLayer.push();
          switch (type) {
            case "SHAPE":
              const { stroke, points } = obj;

              if (stroke) {
                tolerance += stroke.weight;
              }

              for (let p of points) {
                if (
                  p.x < x + tolerance &&
                  p.x > x - tolerance &&
                  p.y < y + tolerance &&
                  p.y > y - tolerance
                ) {
                  return obj;
                }
              }
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
        }

        return { type: "none" };
      }

      function drawDrawing(drawing) {
        if (drawing === undefined) return;
        const { type } = drawing;

        drawingLayer.push();
        switch (type) {
          case "SHAPE":
            const { stroke, fill, points, shape_close } = drawing;
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

      function drawSelected() {
        if (selection.current) {
          drawDrawing(selection.current);
        }
      }

      function getToken(x, y) {
        //Controls when to select and when to drag
        let tolerance = 5;

        for (const token of tokens) {
          if (
            x >= token.x &&
            x <= token.x + token.canvas.width &&
            y >= token.y &&
            y <= token.y + token.canvas.height
          ) {
            console.log("Clicked on Token!");
            return token;
          }
        }

        return undefined;
      }

      function getNextAnchor(x, y) {
        let minDist = Infinity;
        let minDistIndex = -1;
        for (let i = 0; i < anchors.length; i++) {
          let anchor = anchors[i];
          let distance = Math.pow(anchor.x - x, 2) + Math.pow(anchor.y - y, 2);
          distance = Math.sqrt(distance);

          if (distance < minDist) {
            minDist = distance;
            minDistIndex = i;
          }
        }
        return anchors[minDistIndex];
      }
    };
  }

  useEffect(() => {
    getCanvas(drawings => {
      setDrawings(drawings);
    });
  }, []);

  useEffect(() => {
    function updateDrawingState(drawing) {
      setDrawings([...drawings, drawing]);
    }

    subscribeCanvas(updateDrawingState);
    subscribeDeletions(id => {
      const elt = drawings.find(elt => elt.id === id);
      if (elt) {
        const index = drawings.indexOf(elt);
        const copy = [...drawings];
        copy.splice(index, 1);
        setDrawings(copy);
      }
    });

    function onReturn() {
      unsubscribeCanvas(updateDrawingState);
      unsubscribeDeletions();
    }
    return onReturn;
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
            setMode(MODES.DRAGELEMENTS);
          }}
        >
          Drag Stuff
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
        {zoom}
        //
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
