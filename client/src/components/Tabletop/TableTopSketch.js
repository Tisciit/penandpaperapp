import {
  getExistingTableTop,
  sendNewDrawing,
  deleteDrawing,
  drawCard,
  updateTableTopElement,
  subscribeTableTopUpdates
} from "../../api";
import {
  storeShape /*, storeRectangle, storeLine, storeEllipse*/
} from "../../p5api";

import { MODES } from "./Tabletop";

export const sketch = p => {
  //#region ---------------------- Helper Functions ----------------------
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

  function loadDrawing(drawing) {
    const image = getNewDrawingImage(drawing);
    drawing.image = image;
    const img = p.createImage(image.width, image.height);
    img.copy(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      image.width,
      image.height
    );
    drawing.originalData = img;
    tableTopElements.push(drawing);
    drawTableTopElement(drawing);
  }

  function getSelectedTableTopElements(x, y, w, h) {
    function getTableTopElements(
      selectionX,
      selectionY,
      selectionWidth,
      selectionHeight
    ) {
      const found = [];

      for (const elt of tableTopElements) {
        if (elt === undefined) continue;
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
      return found.length > 0 ? found : undefined;
    }
    function getSingleElement(selectionX, selectionY) {
      const found = [];
      for (const elt of tableTopElements) {
        if (elt === undefined) continue;
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
      return found.length > 0 ? found : undefined;
    }

    const left = w >= 0 ? x : Math.floor(x + w);
    const top = h >= 0 ? y : Math.floor(y + h);
    const width = Math.abs(w);
    const height = Math.abs(h);

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

  function clearSelected() {
    if (!INTERACTIONINFO.selection) return;
    for (const elt of INTERACTIONINFO.selection) {
      elt.image.clear();
      elt.image.image(
        elt.originalData,
        0,
        0,
        elt.image.width,
        elt.image.height
      );
    }
    INTERACTIONINFO.selection = undefined;
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
          drawing.stroke.color[2],
          drawing.stroke.color[3]
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

  function redrawLayers() {
    drawingLayer.clear();
    tokenAndCardLayer.clear();
    for (const elt of tableTopElements) {
      drawTableTopElement(elt);
    }
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

  subscribeTableTopUpdates((operation, data) => {
    const ADD = () => {
      if (data.type === "DRAWING") {
        loadDrawing(data);
      } else {
        loadTokenOrCard(data);
      }
    };
    const UPDATE = (element, x, y, width, height) => {
      element.x = x;
      element.y = y;
      element.width = width;
      element.height = height;
    };
    const DELETE = id => {
      const elt = tableTopElements.find(elt => elt.id === id);
      if (elt) {
        const index = tableTopElements.indexOf(elt);
        tableTopElements.splice(index, 1);
      }
    };

    switch (operation) {
      case "ADD":
        ADD();
        break;

      case "UPDATE":
        const { id, x, y, width, height } = data;
        // Get element with id;
        const toUpdate = tableTopElements.find(elt => elt.id === id);
        if (toUpdate) {
          UPDATE(toUpdate, x, y, width, height);
        } else {
          //Object does not exist yet.
          console.log("Object does not exist yet", data);
          ADD();
        }
        break;

      case "DELETE":
        //Data contains the id to be deleted
        DELETE(data);
        break;

      default:
        return;
    }

    redrawLayers();
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
  let strokeColor;
  let fillColor;
  //#endregion

  //Drawing Array & Point Buffer for Drawing
  const tableTopElements = []; //Objects for the TableTopElements
  const points = []; // Point Buffer when drawing new points

  //contains selection info
  const INTERACTIONINFO = {
    selection: undefined,
    mouseInfo: { x: undefined, y: undefined, button: undefined },
    offset: { x: undefined, y: undefined },
    somethingdragged: false
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
      backgroundLayer.rect(0, 0, backgroundLayer.width, backgroundLayer.height);
    }

    function calculateEdges(x, y) {
      backgroundLayer.noFill();
      backgroundLayer.stroke(255, 255, 255);
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
      tableTopElements.splice(0, tableTopElements.length);

      for (const elt of allContent) {
        if (elt.type === "DRAWING") {
          loadDrawing(elt);
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
    strokeColor = props.strokeColor || { r: 255, g: 0, b: 0, a: 255 };
    fillColor = props.fillColor || { r: 255, g: 0, b: 0, a: 255 };
    clearSelected();
  };
  p.draw = () => {
    redrawSketch();
    p.EventWithinFrameFired = false;
  };
  p.mouseWheel = e => {
    if (!mouseWithInParent()) return;
    if (e.delta < 0) {
      //SCROLLING DOWN
      fZoomIn();
    } else {
      fZoomOut();
    }
  };
  p.keyPressed = e => {
    if (!mouseWithInParent()) return;
    switch (mode) {
      case MODES.SELECT:
        //46 is Delete key
        if (e.keyCode === 46 && INTERACTIONINFO.selection) {
          for (let elt of INTERACTIONINFO.selection) {
            deleteDrawing(elt.id);
          }
          clearSelected();
          redrawLayers();
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
    INTERACTIONINFO.mouseInfo.x = x;
    INTERACTIONINFO.mouseInfo.y = y;
    INTERACTIONINFO.mouseInfo.button = p.mouseButton;
    INTERACTIONINFO.offset.x = xOff;
    INTERACTIONINFO.offset.y = yOff;

    if (p.mouseButton === p.CENTER) {
      //Toggle between select and draw
      if (mode === MODES.SELECT) {
        fChangeMode(MODES.DRAW);
      } else if (mode === MODES.DRAW) {
        fChangeMode(MODES.SELECT);
      }

      return;
    }
  };
  p.mouseDragged = e => {
    //Limit event Firing to frameRate for performance
    if (!mouseWithInParent() || p.EventWithinFrameFired) return;
    p.EventWithinFrameFired = true;

    const { x, y, relXOff, relYOff } = getRelativeCoords();
    const originX = INTERACTIONINFO.mouseInfo.x;
    const originY = INTERACTIONINFO.mouseInfo.y;
    const button = INTERACTIONINFO.mouseInfo.button;
    const originXOff = INTERACTIONINFO.offset.x;
    const originYOff = INTERACTIONINFO.offset.y;

    //MOVE SELECTED
    if (button === "right" && INTERACTIONINFO.selection) {
      const elt = INTERACTIONINFO.selection[0];

      let nextX = x - relXOff;
      let nextY = y - relYOff;
      if (elt.subType === "TOKEN") {
        //TOKEN SNAP TO ANCHORS
        const newCoords = getNextAnchor(x, y);
        nextX = newCoords.x - elt.width / 2;
        nextY = newCoords.y - elt.height / 2;
      }
      elt.x = nextX;
      elt.y = nextY;
      INTERACTIONINFO.somethingdragged = true;
      redrawLayers();
      return;
    }
    //MOVE CANVAS
    if (button === "right" && !INTERACTIONINFO.selection) {
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
  p.mouseReleased = e => {
    const originX = INTERACTIONINFO.mouseInfo.x;
    const originY = INTERACTIONINFO.mouseInfo.y;
    const { x, y } = getRelativeCoords();

    tempLayer.clear();

    //#region Handle Draw
    if (points.length > 1) {
      //const img = pointsToImage(points);
      const { r, g, b, a } = strokeColor;
      const obj = storeShape(3, [r, g, b, a], null, points);
      sendNewDrawing(obj);
      points.splice(0, points.length);
    }
    //#endregion

    if (mode === MODES.SELECT) {
      if (INTERACTIONINFO.somethingdragged) {
        INTERACTIONINFO.somethingdragged = false;
        updateTableTopElement(INTERACTIONINFO.selection[0]);
      }
      clearSelected();
      redrawLayers();
      INTERACTIONINFO.selection = getSelectedTableTopElements(
        originX,
        originY,
        x - originX,
        y - originY
      );
      if (INTERACTIONINFO.selection) {
        for (const elt of INTERACTIONINFO.selection) {
          highlight(elt);
          drawTableTopElement(elt);
        }
      }
    }

    INTERACTIONINFO.mouseInfo.x = undefined;
    INTERACTIONINFO.mouseInfo.y = undefined;
    INTERACTIONINFO.mouseInfo.button = undefined;

    INTERACTIONINFO.offset.x = undefined;
    INTERACTIONINFO.offset.y = undefined;
  };

  //#endregion
};
