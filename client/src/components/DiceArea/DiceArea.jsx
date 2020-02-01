import React, { useState, useEffect, useRef } from "react";
import { subscribeDice, unsubscribeDice, rollDice } from "../../api";
import { Row } from "./Row";
import "./DiceArea.css";

export const DiceArea = () => {
  const [gm, setGM] = useState(false);
  const [self, setSelf] = useState(false);
  const [exploding, setExploding] = useState(false);
  const [compounding, setCompounding] = useState(false);
  const refHistory = useRef(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const callback = data => {
      console.log(data);
      setHistory([...history, <p key={data.id}>{data.user}: {data.roll.output}</p>]);
    };
    subscribeDice(callback, true);
  }, [history]);

  const executeRoll = diceStr => {
    let dStr = diceStr;
    if (exploding) {
      dStr += "!";
    } else if (compounding) {
      dStr += "!!";
    }
    rollDice(dStr);
  };

  return (
    <div className="DiceWrapper">
      <div className="Grid Options">
        <div
          className={gm ? "Active" : ""}
          onClick={() => {
            setGM(!gm);
          }}
        >
          GM
        </div>
        <div
          className={self ? "Active" : ""}
          onClick={() => {
            setSelf(!self);
          }}
        >
          Self
        </div>
        <div
          className={exploding ? "Active" : ""}
          onClick={() => {
            setExploding(!exploding);
            if (compounding) {
              setCompounding(false);
            }
          }}
        >
          !
        </div>
        <div
          className={compounding ? "Active" : ""}
          onClick={() => {
            setCompounding(!compounding);
            if (exploding) {
              setExploding(false);
            }
          }}
        >
          !!
        </div>
      </div>

      <Row diceType={4} columns={4} rollFunction={executeRoll} />
      <Row diceType={6} columns={4} rollFunction={executeRoll} />
      <Row diceType={8} columns={4} rollFunction={executeRoll} />
      <Row diceType={10} columns={4} rollFunction={executeRoll} />
      <Row diceType={12} columns={4} rollFunction={executeRoll} />
      <div ref={refHistory} className="DiceResults">
        {history.map(elt => elt)}
      </div>
    </div>
  );
};
