import React, { useState, useEffect } from "react";

import { strokeColor } from "./Tabletop";

export const ColorSelector = () => {
  const [r, setR] = useState(100);
  const [g, setG] = useState(100);
  const [b, setB] = useState(100);
  const [a, setA] = useState(255);
  const [colorHistory, setColorHistory] = useState([]);
  const historyLen = 30;

  useEffect(() => {
    strokeColor.r = parseInt(r);
    strokeColor.g = parseInt(g);
    strokeColor.b = parseInt(b);
    strokeColor.a = parseInt(a);

    const tmp = [{ ...strokeColor }, ...colorHistory];
    tmp.splice(historyLen, 1);
    setColorHistory(tmp);
  }, [r, g, b, a]);

  return (
    <div className="ColorSelectorWrapper">
      <div className="Inputs">
        <input
          type="range"
          value={r}
          min="0"
          max="255"
          step="1"
          onChange={e => setR(e.target.value)}
        />
        <p>R: {r}</p>
        <input
          type="range"
          value={g}
          min="0"
          max="255"
          step="1"
          onChange={e => setG(e.target.value)}
        />
        <p>G: {g}</p>
        <input
          type="range"
          value={b}
          min="0"
          max="255"
          step="1"
          onChange={e => setB(e.target.value)}
        />
        <p>B: {b}</p>
        <input
          type="range"
          value={a}
          min="0"
          max="255"
          step="1"
          onChange={e => setA(e.target.value)}
        />
        <p>A: {a}</p>
      </div>
      <div
        className="ColorPreview"
        style={{ background: `rgba(${r}, ${g}, ${b}, ${a})` }}
      ></div>
      <div className="ColorHistory">
        {colorHistory.map((elt, index) => (
          <div
            key={index}
            className="ColorPreview Circular"
            style={{
              background: `rgba(${elt.r}, ${elt.g}, ${elt.b}, ${elt.a})`
            }}
            onClick={() => {
              setR(elt.r);
              setG(elt.g);
              setB(elt.b);
              setA(elt.a);
            }}
          />
        ))}
      </div>
    </div>
  );
};
