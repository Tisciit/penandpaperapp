import React, { useState, useEffect } from "react";
import P5Wrapper from "react-p5-wrapper";
import { subscribeCanvas, unsubscribeCanvas, updateCanvas } from "../api";
import { storeShape, storeRectangle, storeLine, storeEllipse } from "../p5api";
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

      //#region VARIABLES WHICH HOLD PROPS
      let mode;
      let zoom;
      let drawings;

      //default Size for Tiles
      const RADIUS = 50;

      p.setup = () => {
        console.log("SETUP");
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
        p.frameRate(20);
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
              case "SHAPE": {
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
                  console.log(p);
                }
                if (shape_close) drawingLayer.endShape(drawingLayer.CLOSE);
                else drawingLayer.endShape();
                break;
              }
              // case "VERTEX":
              //   drawingLayer.vertex(x, y);
              //   break;
              // case "BEGIN":
              //   const { strokeColor, strokeWidth } = obj;
              //   drawingLayer.beginShape();
              //   drawingLayer.stroke(
              //     drawingLayer.color(
              //       strokeColor.r,
              //       strokeColor.g,
              //       strokeColor.b
              //     )
              //   );
              //   drawingLayer.strokeWeight(strokeWidth);
              //   drawingLayer.vertex(x, y);
              //   break;
              // case "END":
              //   drawingLayer.vertex(x, y);
              //   drawingLayer.endShape();
              //   break;
            }
            drawingLayer.pop();
          }
        })();
        //#endregion
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
            });

            tempLayer.ellipse(x, y, 5);
            break;
        }
      };

      p.mouseReleased = function() {
        //TODO: https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm

        if (points.length > 3) {
          const obj = storeShape(3, { r: 255, g: 0, b: 0 }, null, points);
          updateCanvas(obj);
          points = [];
          tempLayer.clear();
        }
      };
    };
  }

  useEffect(() => {
    subscribeCanvas(drawing => {
      setDrawings([...drawings, drawing]);
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
