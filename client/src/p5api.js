//"API" to receive custom objects and send them to the shadow realm

export const storeShape = (strokeWeight, strokeColor, fillColor, points) => {
  return {
    type: "SHAPE",
    stroke: {
      weight: strokeWeight || 0,
      color: {
        r: strokeColor.r || 0,
        g: strokeColor.g || 0,
        b: strokeColor.b || 0
      }
    },
    shape_close: fillColor ? true : false, //If fillColor is provided, close the Shape
    fill: {
      color: fillColor,
    },
    points: points
  };
};

export const storeLine = (strokeWeight, strokeColor, points) => {
  return {
    type: "LINE",
    stroke: {
      weight: strokeWeight || 0,
      color: {
        r: strokeColor.r || 0,
        g: strokeColor.g || 0,
        b: strokeColor.b || 0
      }
    },
    points: [points[0], points[1]] //Store only the first two points
  };
};

export const storeEllipse = (
  strokeWeight,
  strokeColor,
  fillColor,
  width,
  height,
  point
) => {
  return {
    type: "ELLIPSE",
    stroke: {
      weight: strokeWeight || 0,
      color: {
        r: strokeColor.r || 0,
        g: strokeColor.g || 0,
        b: strokeColor.b || 0
      }
    },
    fill: {
      color: {
        r: fillColor.r || 0,
        g: fillColor.g || 0,
        b: fillColor.b || 0
      }
    },
    height: width || 0,
    width: height || 0,
    point: {
      x: point.x || 0,
      y: point.y || 0
    }
  };
};

export const storeRectangle = (
  strokeWeight,
  strokeColor,
  fillColor,
  points
) => {
  return {
    type: "RECTANLGE",
    stroke: {
      weight: strokeWeight || 0,
      color: {
        r: strokeColor.r || 0,
        g: strokeColor.g || 0,
        b: strokeColor.b || 0
      }
    },
    fill: {
      color: {
        r: fillColor.r || 0,
        g: fillColor.g || 0,
        b: fillColor.b || 0
      }
    },
    points: [points[0], points[1]] // 2 Points
  };
};
