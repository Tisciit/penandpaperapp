import React, { useState, useEffect } from "react";

export const ColorSelector = () => {
  const [r, setR] = useState(100);
  const [g, setG] = useState(100);
  const [b, setB] = useState(100);
  const [a, setA] = useState(100);

  useEffect(() => {
      //TODO: Set Canvas Color here
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
    </div>
  );
};
