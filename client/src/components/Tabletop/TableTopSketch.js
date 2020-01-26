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
    const elt = tableTopElements.find(elt => elt.id === token_or_card.id);
    return tableTopElements.indexOf(elt);
  }

  function loadTokenOrCard(token_or_card) {
    p.loadImage(token_or_card.image, data => {
      const gb = p.createGraphics(data.width, data.height);
      gb.image(data, 0, 0, data.width, data.height);
      token_or_card.originalData = data; //TO redraw the stuff!
      token_or_card.image = gb;
      const sizeMod = token_or_card.type === "CARD" ? 0.4 : 0.4;
      token_or_card.width = data.width * sizeMod;
      token_or_card.height = data.height * sizeMod;
      token_or_card.x = token_or_card.x || 0;
      token_or_card.y = token_or_card.y || 0;
      tableTopElements.push(token_or_card);
      drawTableTopElement(token_or_card);
    });
  }

  function updateLocalTokenCard(index, x, y) {
    tableTopElements[index].x = x;
    tableTopElements[index].y = y;
    drawTableTopElement(tableTopElements[index]);
  }

  function getSelectedTableTopElements(x, y, w, h) {
    console.clear();

    function getTableTopElements(
      selectionX,
      selectionY,
      selectionWidth,
      selectionHeight
    ) {
      const found = [];

      for (const elt of tableTopElements) {
        if (elt === undefined) continue;
        console.log(elt);
        const { x, y, width, height } = elt;
        const xLeft = x;
        const xRight = x + width;
        const yTop = y;
        const yBottom = y + height;

        if (
          selectionX < xLeft &&
          selectionX + selectionWidth > xRight &&
          selectionY < yTop &&
          selectionY + selectionHeight > yBottom
        ) {
          //elt found
          found.push(elt);
        }
      }
      return found;
    }
    function getSingleElement(selectionX, selectionY) {
      const found = [];
      console.log(tableTopElements);
      for (const elt of tableTopElements) {
        if (elt === undefined) continue;
        console.log(elt);
        const { x, y, width, height } = elt;
        const xLeft = x;
        const xRight = x + width;
        const yTop = y;
        const yBottom = y + height;

        if (
          xLeft < selectionX &&
          xRight > selectionX &&
          yTop < selectionY &&
          yBottom > selectionY
        ) {
          //elt found
          found.push(elt);
        }
      }
      return found;
    }

    const left = w >= 0 ? x : Math.floor(x + w);
    const top = h >= 0 ? y : Math.floor(y + h);
    const width = Math.abs(w);
    const height = Math.abs(h);
    console.log(left, top);
    console.log(width, height);

    if (!w || !h) return getSingleElement(left, top);

    return getTableTopElements(left, top, width, height);
  }

  function drawTableTopElement(element) {
    if (element === undefined) return;

    const canvas =
      element.type === "Drawing" ? drawingLayer : tokenAndCardLayer;
    canvas.image(
      element.image,
      element.x,
      element.y,
      element.width,
      element.height
    );
  }

  function drawSelected() {
    if (selection.current) {
      if (Array.isArray(selection.current)) {
        for (const elt of selection.current) {
          drawTableTopElement(elt);
        }
      } else {
        drawTableTopElement(selection.current);
      }
    }
  }

  function highlight(element) {
    //As the image attr of all the things is an graphic buffer, we can draw on it!
    const canvas = element.image;
    canvas.fill(p.color(0, 100));
    canvas.rect(0, 0, canvas.width, canvas.height);
  }

  function getNewDrawingImage(drawing) {
    const width = drawing.width;
    const height = drawing.height;
    const points = drawing.points;

    //Outside strokes would be cut off, therefore we need to add them to the width

    const gb = p.createGraphics(width, height);

    //TODO: Drawing options
    if (drawing.stroke.color) {
      gb.stroke(
        p.color(
          drawing.stroke.color[0],
          drawing.stroke.color[1],
          drawing.stroke.color[2]
        )
      );
    }
    if (drawing.stroke.weight) {
      gb.strokeWeight(drawing.stroke.weight);
    }

    if (drawing.fill.color) {
      gb.fill(
        p.color(
          drawing.fill.color[0],
          drawing.fill.color[1],
          drawing.fill.color[2]
        )
      );
    } else {
      gb.noFill();
    }

    gb.beginShape();
    for (const p of points) {
      gb.vertex(p.x, p.y);
    }
    gb.endShape();

    return gb;
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

    for (const elt of iterable) {
      /* Check if token or card is available locally */
      const index = getTokenOrCardIndex(elt);
      if (index !== -1) {
        updateLocalTokenCard(index, elt.x, elt.y);
      } else {
        loadTokenOrCard(elt);
      }
    }
  });

  subscribeDrawings(data => {
    const drawing = getNewDrawingImage(data);
    data.image = drawing;
    tableTopElements.push(data);
    drawTableTopElement(data);
  });

  subscribeDeletions(id => {
    const elt = tableTopElements.find(elt => elt.id === id);
    if (elt) {
      const index = tableTopElements.indexOf(elt);
      tableTopElements.splice(index, 1);

      drawingLayer.clear();
      tokenAndCardLayer.clear();
      for (const elt of tableTopElements) {
        drawTableTopElement(elt);
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
  const tableTopElements = []; //Objects for the TableTopElements
  const points = []; // Point Buffer when drawing new points

  //contains selection info
  const selection = {
    current: undefined,
    mouseInfo: { x: undefined, y: undefined, button: undefined },
    offset: { x: undefined, y: undefined }
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
      //Clear TT array
      tableTopElements.splice(0, tableTopElements.length);

      for (const elt of allContent) {
        if (elt.type === "Drawing") {
          const image = getNewDrawingImage(elt);
          elt.image = image;
          tableTopElements.push(elt);
          drawTableTopElement(elt);
        } else {
          //As this is all new stuff, we needn´t check if tokens or cards already exist
          loadTokenOrCard(elt);
        }
      }
    });

    p.frameRate(30);

    //disable right click for canvas
    p.canvas.oncontextmenu = event => {
      event.preventDefault();
    };
  };

  p.myCustomRedrawAccordingToNewPropsHandler = props => {
    mode = props.mode;
    zoom = props.zoom;
    fZoomIn = props.zoomIn;
    fZoomOut = props.zoomOut;
    fChangeMode = props.changeMode;
    const container = document.querySelector(props.container);
    parentWidth = container.clientWidth;
    parentHeight = container.clientHeight;
    selection.current = undefined;
    console.log(tableTopElements);
  };

  p.draw = () => {
    redrawSketch();
    p.EventWithinFrameFired = false;
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
          for (let elt of selection.current) {
            deleteDrawing(elt.id);
          }
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
    const { x, y } = getRelativeCoords();
    selection.mouseInfo.x = x;
    selection.mouseInfo.y = y;
    selection.mouseInfo.button = p.mouseButton;
    selection.offset.x = xOff;
    selection.offset.y = yOff;

    if (p.mouseButton === p.CENTER) {
      //Toggle between select and draw
      if (mode === MODES.SELECT) {
        fChangeMode(MODES.DRAW);
      } else if (mode === MODES.DRAW) {
        fChangeMode(MODES.SELECT);
      }

      return;
    }

    if (p.mouseButton === p.RIGHT) {
      //const selected = getSelectedDrawing();
    }
  };

  p.mouseReleased = e => {
    const originX = selection.mouseInfo.x;
    const originY = selection.mouseInfo.y;
    const { x, y } = getRelativeCoords();

    tempLayer.clear();

    //#region Handle Draw
    if (points.length > 1) {
      //const img = pointsToImage(points);
      const obj = storeShape(3, [255, 0, 0], null, points);
      sendNewDrawing(obj);
      points.splice(0, points.length);
    }
    //#endregion

    if (mode === MODES.SELECT) {
      selection.current = getSelectedTableTopElements(
        originX,
        originY,
        x - originX,
        y - originY
      );
      for (const elt of selection.current) {
        highlight(elt);
        drawTableTopElement(elt);
      }
    }

    selection.mouseInfo.x = undefined;
    selection.mouseInfo.y = undefined;
    selection.mouseInfo.button = undefined;

    selection.offset.x = undefined;
    selection.offset.y = undefined;
  };

  p.mouseDragged = e => {
    //Limit event Firing to frameRate for performance
    if (!mouseWithInParent() || p.EventWithinFrameFired) return;
    p.EventWithinFrameFired = true;

    const { x, y, prevX, prevY, relXOff, relYOff } = getRelativeCoords();
    const originX = selection.mouseInfo.x;
    const originY = selection.mouseInfo.y;
    const button = selection.mouseInfo.button;
    const originXOff = selection.offset.x;
    const originYOff = selection.offset.y;

    //MOVE
    if (button === "right") {
      xOff = originXOff + x - originX;
      yOff = originYOff + y - originY;
      return;
    }

    if (mode === MODES.SELECT) {
      if (!originX || !originY) return;

      tempLayer.clear();
      tempLayer.fill(p.color(0, 0, 100, 50));
      tempLayer.rect(
        originX - relXOff,
        originY - relYOff,
        x - originX,
        y - originY
      );
      return;
    }

    if (mode === MODES.DRAW) {
      points.push({ x: x - relXOff, y: y - relYOff });
      tempLayer.ellipse(x - xOff / zoom, y - yOff / zoom, 5);
      return;
    }
  };

  //#endregion
};
