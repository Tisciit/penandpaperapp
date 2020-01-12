import React, { useState } from "react";
import P5Wrapper from "react-p5-wrapper";
import {
  subscribeDrawings,
  updateCanvas,
  getCanvas,
  subscribeDeletions,
  deleteDrawing,
  drawCard,
  subscribeCards,
  updateTokenCard,
  subscribeTokenCard
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

  console.log("TABLETOP RENDER!");

  const [mode, setMode] = useState(MODES.SELECT);
  const [zoom, setZoom] = useState(1);
  const [sketch] = useState(getSketch);

  function getSketch() {
    return function sketch(p) {
      //#region Event subscriptions. These should not only fire once but continously
      subscribeCards(cardArray => {
        console.log("New cards", cardArray);
        console.log("Local cards", cards);
        for (const card of cardArray) {
          p.loadImage(card.image, data => {
            //CARDS HAVE A .72 : 1 Aspect Ratio, so we create the Card this way. We can scale the cards size in draw function later
            card.pImage = data;
            card.aspectRatio = data.height / data.width;
            card.width = data.width;
            card.height = data.height;
            card.x = card.x || 0;
            card.y = card.y || 0;
            cards.push(card);
          });
        }
      });

      subscribeDrawings(data => {
        console.log(drawings);
        drawings.push(data);
        drawDrawing(data);
      });

      subscribeDeletions(id => {
        const elt = drawings.find(elt => elt.id === id);
        if (elt) {
          const index = drawings.indexOf(elt);
          drawings.splice(index, 1);

          drawingLayer.clear();
          for (const drawing of drawings) {
            drawDrawing(drawing);
          }
        }
      });

      subscribeTokenCard(data => {
        console.log(`A TOKEN HAS BEEN UPDATED`);
        console.log(data);
        if (data.type === "CARD") {
          const card = cards.find(elt => elt.id === data.id);
          console.log(card);
          card.x = data.x;
          card.y = data.y;
        }
      });

      //#endregion

      //#region LAYERS FOR THE CANVAS
      let backgroundLayer; //Contains the hex-grid
      let drawingLayer; //Contains the drawings
      let tempLayer; //Temporary layer for drawing-preview
      //#endregion

      //#region OFFSETS WHEN MOVING THE CANVAS
      let xOff = 0;
      let yOff = 0;
      //#endregion

      //#region VARIABLES WHICH HOLD PROPS
      let mode;
      let zoom;
      //#endregion

      //default Size for Tiles
      const RADIUS = 40;

      //Drawing Array & Point Buffer for Drawing
      const drawings = [];
      const points = [];
      const tokens = [];
      const cards = [];

      //contains selection info
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

        //#region set up DrawingLayer
        drawingLayer = p.createGraphics(width, height);
        drawingLayer.noFill();
        drawingLayer.noLoop();
        tempLayer = p.createGraphics(width, height);
        tempLayer.noLoop();

        //#endregion

        getCanvas(allDrawings => {
          drawings.splice(0, drawings.length);
          drawings.push([...allDrawings]);
        });

        p.frameRate(30);
      };

      p.myCustomRedrawAccordingToNewPropsHandler = props => {
        mode = props.mode;
        zoom = props.zoom;
        selection.current = undefined;
      };

      p.draw = () => {
        p.clear();
        const w = p.width * zoom;
        const h = p.height * zoom;

        p.image(backgroundLayer, xOff, yOff, w, h);
        p.image(drawingLayer, xOff, yOff, w, h);
        p.image(tempLayer, xOff, yOff, w, h);

        // for (const token of tokens) {
        //   p.image(
        //     token.canvas,
        //     token.x + xOff / zoom,
        //     token.y + yOff / zoom,
        //     token.width * zoom,
        //     token.height * zoom
        //   );
        // }

        for (const card of cards) {
          p.image(
            card.pImage,
            card.x + xOff / zoom,
            card.y + yOff / zoom,
            card.width / zoom,
            card.height / zoom
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
              if (!selection.current) {
                const elt = getTokenCard(x, y);
                if (elt.type) {
                  selection.current = elt;
                }
              } else {
                console.log("Dragging");
                const { type } = selection.current;
                //SNAP TO ANCHORS
                switch (type) {
                  case "TOKEN":
                    const newPoint = getNextAnchor(x, y);
                    selection.current.x = newPoint.x - selection.current.width / 2;
                    selection.current.y = newPoint.y - selection.current.height / 2;
                    break;

                  case "CARD":
                    selection.current.x += x - prevX;
                    selection.current.y += y - prevY;
                    console.log(selection.current);
                    console.log("Updating card locally");
                    break;

                  default:
                    break;
                }
              }
            } else {
              //If an object has been selected, send changes to the server
              if (selection.current) {
                const { x, y, id, type } = selection.current;
                console.log(x, y);
                console.log(id, type);
                console.log("Drag end, sending changes to server");
                updateTokenCard({
                  x,
                  y,
                  id,
                  type
                });
              }
              selection.current = undefined;
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
            } else if (e.keyCode === 68) {
              //Draw card
              drawCard(() => {});
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

      function getTokenCard(x, y) {
        for (const token of tokens) {
          if (
            x >= token.x &&
            x <= token.x + token.width &&
            y >= token.y &&
            y <= token.y + token.height
          ) {
            console.log("Clicked on Token!");
            return token;
          }
        }

        for (const card of cards) {
          if (
            x >= card.x &&
            x <= card.x + card.width &&
            y >= card.y &&
            y <= card.y + card.height
          ) {
            console.log("Clicked on Card!");
            return card;
          }
        }

        return { type: undefined };
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
        ||
        {mode}
      </div>
      <div className="sketchContainer">
        <P5Wrapper mode={mode} zoom={zoom} sketch={sketch} />
      </div>
    </div>
  );
};
