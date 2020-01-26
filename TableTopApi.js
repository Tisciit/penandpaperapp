function moduleLog(...message) {
  if (logging) {
    console.log(`TABLETOPAPI: ${message[0]}`);
    for (let i = 0; i < message.length; i++) {
      console.log(message[i]);
    }
  }
}
//#region -------------------------- Module Constants --------------------------
const TABLETOPELEMENTS = [];
let TABLETOPID = 1;

let logging = true;
//#endregion
//#region -------------------------- Helper Functions --------------------------
function checkColor(arr) {
  if (arr.length > 4 || arr.length < 3) {
    return false;
  }
  //3 or 4 points, {r,g,b,a}

  if (!arrayNumeric(arr)) {
    return false;
  }

  for (const color of arr) {
    if (color < 0 || color > 255) {
      return false;
    }
  }

  return true;
}

function arrayNumeric(arr) {
  if (!Array.isArray(arr))
    return moduleLog(`Arr is not iterable`, arr) && false;
  for (const elt of arr) {
    if (!Number.isInteger(elt)) return false;
  }
  return true;
}
//#endregion
//#region -------------------------- Exports --------------------------
exports.analysePoints = pnts => {
  const points = [...pnts];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = 1;
  let maxY = 1;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  for (let p of points) {
    p.x -= minX;
    p.y -= minY;
  }
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  return {
    points,
    width,
    height,
    minX,
    minY,
    maxX,
    maxY
  };
};

exports.convertIncomingDrawing = drawing => {
  /*
    Drawing consists of
        type
        either stroke or fill (or both)
        points
  */
  if (!drawing.type) return moduleLog("Drawing type not set") && false;
  if (!drawing.stroke && !drawing.fill)
    return moduleLog("Neither Stroke nor Fill are defined") && false;
  if (drawing.stroke.color && !checkColor(drawing.stroke.color))
    return moduleLog("Stroke Color is defined in wrong format") && false;
  if (drawing.fill.color && !checkColor(drawing.fill.color))
    return moduleLog("Fill Color is defined in wrong format") && false;
  if (drawing.stroke.weight && !arrayNumeric([drawing.stroke.weight]))
    return moduleLog("Stroke Weight is not numeric") && false;
  if (!drawing.points) return moduleLog("No Points defined") && false;
  if (drawing.points.length < 2)
    return moduleLog("Too few points!", drawing.points) && false;
  //tmp array before cleanup
  const points = [];
  for (const p of drawing.points) {
    if (!p.x || !p.y) {
      return moduleLog("Point did not contain x and y coords") && false;
    }
    //Only save x and y of each individual point
    points.push({
      x: p.x,
      y: p.y
    });
  }

  return {
    type: "DRAWING",
    subType: drawing.type,
    stroke: drawing.stroke || undefined,
    fill: drawing.fill || undefined,
    points: points
  };
};

exports.storeTableTopElement = elt => {
  elt.id = TABLETOPID++;
  TABLETOPELEMENTS.push(elt);
  moduleLog(`New Element of type ${elt.type} stored`);
  return elt;
};

exports.getTableTopElements = (type = undefined) => {
  if (type) {
    return TABLETOPELEMENTS.find(elt => elt.type === type);
  }
  //Return all TTElements
  return TABLETOPELEMENTS;
};

exports.deleteTableTopElement = index => {
  TABLETOPELEMENTS.splice(index, 1);
};
//#endregion
