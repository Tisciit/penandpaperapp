import {
  subscribeDrawings,
  sendNewDrawing,
  getExistingTableTop,
  subscribeDeletions,
  deleteDrawing,
  drawCard,
  updateTokenCard,
  subscribeTokenCards
} from "../../api";
import {
  storeShape /*, storeRectangle, storeLine, storeEllipse*/
} from "../../p5api";

import { MODES } from "./Tabletop";

export const sketch = p => {
  //#region ---------------------- Helper Functions ----------------------
  function getTokenOrCardIndex(token_or_card) {
    const elt = tokenAndCards.find(elt => elt.id === token_or_card.id);
    return tokenAndCards.indexOf(elt);
  }

  function loadTokenOrCard(token_or_card) {
    p.loadImage(token_or_card.image, data => {
      token_or_card.pImage = data;
      token_or_card.aspectRatio = data.height / data.width;
      const sizeMod = token_or_card.type === "CARD" ? 0.4 : 0.4;
      token_or_card.width = data.width * sizeMod;
      token_or_card.height = data.height * sizeMod;
      token_or_card.x = token_or_card.x || 0;
      token_or_card.y = token_or_card.y || 0;
      tokenAndCards.push(token_or_card);
      drawTokenOrCards();
    });
  }

  function updateLocalTokenCard(index, x, y) {
    tokenAndCards[index].x = x;
    tokenAndCards[index].y = y;
    drawTokenOrCards();
  }

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
          drawingLayer.stroke(stroke.color.r, stroke.color.g, stroke.color.b);
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

  function drawTokenOrCards() {
    tokenAndCardLayer.clear();
    for (const token_or_card of tokenAndCards) {
      tokenAndCardLayer.image(
        token_or_card.pImage,
        token_or_card.x + xOff / zoom,
        token_or_card.y + yOff / zoom,
        token_or_card.width / zoom,
        token_or_card.height / zoom
      );
    }
  }

  function drawSelected() {
    if (selection.current) {
      drawDrawing(selection.current);
    }
  }

  function getTokenCard(x, y) {
    for (const elt of tokenAndCards) {
      if (
        x >= elt.x &&
        x <= elt.x + elt.width &&
        y >= elt.y &&
        y <= elt.y + elt.height
      ) {
        return elt;
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

  function redrawSketch() {
    p.clear();
    const w = tableTopWidth * zoom;
    const h = tableTopHeight * zoom;

    p.image(backgroundLayer, xOff, yOff, w, h);
    p.image(drawingLayer, xOff, yOff, w, h);
    p.image(tempLayer, xOff, yOff, w, h);
    p.image(tokenAndCardLayer, xOff, yOff, w, h);
    p.image(tempLayer, xOff, yOff, w, h);
  }

  function getRelativeCoords() {
    const x = p.mouseX / zoom;
    const y = p.mouseY / zoom;
    const prevX = p.pmouseX / zoom;
    const prevY = p.pmouseY / zoom;

    const relXOff = xOff / zoom;
    const relYOff = yOff / zoom;
    return {
      x,
      y,
      prevX,
      prevY,
      relXOff,
      relYOff
    };
  }

  function mouseWithInParent() {
    const x = p.mouseX;
    const y = p.mouseY;
    return x >= 0 && x <= parentWidth && y >= 0 && y <= parentHeight;
  }
  //#endregion
  //#region ---------------------- API EVents       ----------------------
  subscribeTokenCards(array => {
    //If only one token or card comes in, make the value iterable
    const iterable = Array.isArray(array) ? array : [array];

    console.log(iterable);
    for (const elt of iterable) {
      /* Check if token or card is available locally */
      const index = getTokenOrCardIndex(elt);
      if (index !== -1) {
        console.log("Updating card");
        updateLocalTokenCard(index, elt.x, elt.y);
      } else {
        console.log("Loading new card");
        loadTokenOrCard(elt);
      }
    }
  });

  subscribeDrawings(data => {
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
  //#endregion
  //#region ---------------------- Sketch Variables ----------------------

  //#region CANVAS Related objects

  const RADIUS = 40; //default Size for Hex-Tiles
  let tableTopWidth;
  let tableTopHeight;
  let parentWidth;
  let parentHeight;
  let backgroundLayer; //Contains the hex-grid
  const anchors = []; //Center points of tiles in backgroundLayer
  let drawingLayer; //Contains the drawings
  let tempLayer; //Temporary layer for drawing-preview
  let tokenAndCardLayer; //Contains tokens and cards
  let xOff = 0; //X Offset for when sketch is moved
  let yOff = 0; //Y Offset for when sketch is moved
  //#endregion

  //#region VARIABLES WHICH HOLD PROPS
  let mode;
  let zoom;
  let fZoomIn;
  let fZoomOut;
  let fChangeMode;
  //#endregion

  //Drawing Array & Point Buffer for Drawing
  const drawings = []; //Objects describing the drawings on the cavas
  const points = []; // Point Buffer when drawing new points
  const tokenAndCards = []; //Objects describing tokens and cards

  //contains selection info
  const selection = {
    current: undefined,
    mouseInfo: { x: undefined, y: undefined, button: undefined }
  };
  //#endregion
  //#region ---------------------- Canvas Events    ----------------------
  p.setup = () => {
    const COLS = 160;
    const ROWS = 90;
    const width = RADIUS * COLS;
    const height = RADIUS * ROWS;
    tableTopWidth = width;
    tableTopHeight = height;
    p.createCanvas(parentWidth, parentHeight);
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

    //#region Set up Other Layers aka Graphics Bufffers
    drawingLayer = p.createGraphics(width, height);
    drawingLayer.noFill();
    tempLayer = p.createGraphics(width, height);
    tokenAndCardLayer = p.createGraphics(width, height);
    //#endregion

    //Initially get all content from server
    getExistingTableTop(allContent => {
      const { drawing, tokenCards } = allContent;

      console.log("Drawings", drawing);
      console.log("Tokens and Cards", tokenCards);

      drawings.splice(0, drawings.length);
      drawings.push(...drawing);

      for (const d of drawings) {
        drawDrawing(d);
      }

      for (const tC of tokenCards) {
        //As this is all new stuff, we needn´t check if tokens or cards already exist
        loadTokenOrCard(tC);
      }
    });

    p.frameRate(30);
  };

  p.myCustomRedrawAccordingToNewPropsHandler = props => {
    console.log("PROPS HANDLER");
    mode = props.mode;
    zoom = props.zoom;
    fZoomIn = props.zoomIn;
    fZoomOut = props.zoomOut;
    fChangeMode = props.changeMode;
    const container = document.querySelector(props.container);
    parentWidth = container.clientWidth;
    parentHeight = container.clientHeight;
    selection.current = undefined;
  };

  p.draw = () => {
    redrawSketch();
    p.EventWithinFrameFired = false;
    // const { x, y, prevX, prevY, relXOff, relYOff } = getRelativeCoords();

    // switch (mode) {
    //   //#region MODES.DRAW
    //   case MODES.DRAW:
    //     if (p.mouseIsPressed) {
    //       //If drawing off canvas return
    //       if (x < 0 || y < 0) return;
    //       points.push({ x: x - relXOff, y: y - relYOff });
    //       tempLayer.ellipse(x - xOff / zoom, y - yOff / zoom, 5);
    //     } else {
    //       if (points.length > 0) {
    //         const obj = storeShape(3, { r: 255, g: 0, b: 0 }, null, points);
    //         sendNewDrawing(obj);
    //         points.splice(0, points.length);
    //         tempLayer.clear();
    //       }
    //     }
    //     break;
    //   //#endregion
    //   //#region MODES.DRAG
    //   case MODES.DRAG:
    //     if (p.mouseIsPressed) {
    //       xOff += x - prevX;
    //       yOff += y - prevY;
    //     }
    //     break;
    //   //#endregion
    //   //#region MODES.SELECT
    //   case MODES.SELECT:
    //     if (p.mouseIsPressed) {
    //       tempLayer.clear();
    //       tempLayer.fill(p.color(0, 0, 20, 50));
    //       tempLayer.rect(0, 0, x, y);
    //       const selectedDrawing = getSelectedDrawing(
    //         x - xOff / zoom,
    //         y - yOff / zoom
    //       );
    //       const copy = JSON.parse(JSON.stringify(selectedDrawing));
    //       if (copy.type !== "none") {
    //         //Redraw previuosly selected drawing
    //         drawSelected();
    //         copy.stroke.color = { r: 0, g: 0, b: 255 };
    //         drawDrawing(copy);
    //         selection.current = selectedDrawing;
    //       }
    //     }
    //     break;
    //   //#endregion
    //   //#region MODES.DRAGELEMENTS
    //   case MODES.DRAGELEMENTS:
    //     if (p.mouseIsPressed) {
    //       if (!selection.current) {
    //         const elt = getTokenCard(x, y);
    //         if (elt.type) {
    //           selection.current = elt;
    //         }
    //       } else {
    //         const { type } = selection.current;
    //         //SNAP TO ANCHORS
    //         switch (type) {
    //           case "TOKEN":
    //             const newPoint = getNextAnchor(x, y);
    //             selection.current.x = newPoint.x - selection.current.width / 2;
    //             selection.current.y = newPoint.y - selection.current.height / 2;
    //             break;

    //           case "CARD":
    //             selection.current.x += x - prevX;
    //             selection.current.y += y - prevY;
    //             break;

    //           default:
    //             break;
    //         }
    //         drawTokenOrCards();
    //       }
    //     } else {
    //       //If an object has been selected, send changes to the server
    //       if (selection.current) {
    //         const { x, y, id } = selection.current;
    //         updateTokenCard({
    //           x,
    //           y,
    //           id
    //         });
    //       }
    //       selection.current = undefined;
    //     }
    //     break;
    //   //#endregion

    //   default:
    //     break;
    // }
  };

  p.mouseWheel = e => {
    if (!mouseWithInParent()) return;
    if (e.delta > 0) {
      //SCROLLING DOWN
      fZoomIn();
    } else {
      fZoomOut();
    }
  };

  p.keyPressed = e => {
    switch (mode) {
      case MODES.SELECT:
        //46 is Delete key
        if (e.keyCode === 46 && selection.current) {
          deleteDrawing(selection.current.id);
          selection.current = undefined;
        } else if (e.keyCode === 68) {
          //Draw card
          drawCard(() => {});
        }
        break;

      default:
        break;
    }
  };

  p.mousePressed = e => {
    if (!mouseWithInParent()) return;

    tempLayer.clear();
    //Set Info Object where Mouse has been pressed.
    selection.mouseInfo.x = p.mouseX;
    selection.mouseInfo.y = p.mouseY;
    selection.mouseInfo.button = p.mouseButton;

    if (p.mouseButton === p.CENTER) {
      //Toggle between select and draw
      if (mode === MODES.SELECT) {
        fChangeMode(MODES.DRAW);
      } else if (mode === MODES.DRAW) {
        fChangeMode(MODES.SELECT);
      }
    }
  };

  p.mouseReleased = e => {
    //Clean up mousepressedorigin

    //#region Handle Draw
    if (points.length > 0) {
      const obj = storeShape(3, { r: 255, g: 0, b: 0 }, null, points);
      sendNewDrawing(obj);
      points.splice(0, points.length);
      tempLayer.clear();
    }
    //#endregion

    selection.mouseInfo.x = undefined;
    selection.mouseInfo.y = undefined;
    selection.mouseInfo.button = undefined;
  };

  p.mouseDragged = e => {
    //Limit event Firing to frameRate for performance
    if (!mouseWithInParent() || p.EventWithinFrameFired) return;
    p.EventWithinFrameFired = true;

    const { x, y, relXOff, relYOff } = getRelativeCoords();
    const originX = selection.mouseInfo.x;
    const originY = selection.mouseInfo.y;
    const button = selection.mouseInfo.button;

    //MOVE
    if (button === "right") {
      xOff = x - originX;
      yOff = y - originY;
      return;
    }

    if (mode === MODES.SELECT) {
      if (!originX || !originY) return;

      tempLayer.clear();
      tempLayer.fill(p.color(0, 0, 100, 50));
      tempLayer.rect(originX - xOff, originY - yOff, x - originX, y - originY);
      return;
    }

    if (mode === MODES.DRAW) {
      points.push({ x: x - relXOff, y: y - relYOff });
      tempLayer.ellipse(x - xOff / zoom, y - yOff / zoom, 5);
      return;
    }
  };
};
//#endregion
