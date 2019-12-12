import React, { useEffect, useRef, useState } from "react";
import "./Tabletop.css";

export const Tabletop = props => {
  const refGrid = useRef(null);

  const MODES = {
    SELECT: 0,
    DRAG: 1,
    DRAW: 2,
    DRAGELEMENTS: 3
  };

  const [mode, setMode] = useState(MODES.SELECT);
  const [zoom, setZoom] = useState(1);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [viewBox, setViewBox] = useState(
    `${xOffset} ${yOffset} ${zoom * 100} ${zoom * 100}`
  );
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    setViewBox(`${xOffset} ${yOffset} ${zoom * 100} ${zoom * 100}`);
  }, [yOffset, xOffset, zoom]);

  useEffect(() => {
    const classList = {
      CURSORPOINTER: "cursorPointer",
      CURSORMOVE: "cursorMove"
    };

    //Remove all classes
    for (let o in Object.getOwnPropertyNames(classList)) {
      refGrid.current.classList.remove(classList[o]);
    }

    switch (mode) {
      case MODES.SELECT:
        refGrid.current.classList.add("cursorDefault");
        break;
      case MODES.DRAG:
        refGrid.current.classList.add("cursorMove");
        break;
    }
  }, [mode]);
  //Thanks to https://stackoverflow.com/a/56823542/12512574 for basically providing the SVG Hex Layout creation script!
  //Create Hex Grid on mount
  useEffect(() => {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const R = 5;
    const COLS = props.cols || 20;
    const ROWS = props.rows || 20;
    const SVGWIDTH = COLS * (R * 1.5);
    const SVGHEIGHT = ROWS * (R * 1.5);

    const H = SVGHEIGHT,
      W = SVGWIDTH;
    const h = R * Math.sin(Math.PI / 3);
    const offset = 1.5 * R;

    let i = 0;
    for (let y = 0; y < H; y += h) {
      i++;
      const o = i % 2 === 0 ? offset : 0;
      for (let x = o; x < W; x += 3 * R) {
        calulcateEdges(x, y);
      }
    }

    function calulcateEdges(x, y) {
      let points = "";

      //for a given xy, calculate the points for the 6 edges at 0 - 6 pi / 3
      for (let a = 0; a < 6; a++) {
        let obj = {};
        obj.x = x + R * Math.cos((a * Math.PI) / 3);
        obj.y = y + R * Math.sin((a * Math.PI) / 3);
        points += `${obj.x}, ${obj.y} `;
      }
      const cell = appendSVGelmt(
        { points: points },
        "polygon",
        refGrid.current
      );
      //cell.addEventListener("click", () => {
      //  console.log(x / R, y / R);
      //});
      cell.classList.add("static");
    }

    function appendSVGelmt(o, tag, parent) {
      let elmt = document.createElementNS(SVG_NS, tag);
      for (let name in o) {
        if (o.hasOwnProperty(name)) {
          elmt.setAttributeNS(null, name, o[name]);
        }
      }
      parent.appendChild(elmt);
      return elmt;
    }
  }, []);
  //

  const SVGMOUSEDOWN = e => {
    switch (mode) {
      case MODES.SELECT:
        setSelection(e.target);
        break;

      case MODES.DRAG:
        e.stopPropagation();
        setSelection(e.target);
        console.log("I am here");
        console.log(e.clientX, e.clientY);
        break;

      default:
        break;
    }
  };

  const SVGMOUSEDRAG = e => {
    console.log("dragging");
    switch (mode) {
      case MODES.SELECT:
        break;

      case MODES.DRAG:
        if (selection !== null) {
          const coords = getMousePosition(e, selection);
          console.log(coords);
          setXOffset(coords.x);
          setYOffset(coords.y);
        }
        break;

      default:
        break;
    }

    function getMousePosition(evt, svg) {
      const CTM = svg.getScreenCTM();
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
      };
    }
  };

  const SVGMOUSEUP = e => {
    switch (mode) {
      case MODES.SELECT:
        break;

      case MODES.DRAG:
        e.stopPropagation();
        setSelection(null);
        break;

      default:
        break;
    }
  };

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
            setZoom(zoom + 0.2);
          }}
        >
          -
        </button>
        <button
          className="btn_round"
          onClick={() => {
            setZoom(zoom - 0.2);
          }}
        >
          +
        </button>
        {mode}
      </div>
      <div
        className="svgContainer"
        onMouseDown={SVGMOUSEDOWN}
        onMouseUp={SVGMOUSEUP}
        onDrag={SVGMOUSEDRAG}
      >
        <svg className="svgGrid" ref={refGrid} viewBox={viewBox} />
      </div>
    </div>
  );
};
