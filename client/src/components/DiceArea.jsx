import React, { useState } from "react";
import "./DiceArea.css";

export const DiceArea = () => {

    const [gm, setGM] = useState(false);
    const [explode, setExplode] = useState(false);

    return (
        <div className="DiceWrapper">
            <div className="Grid Options">
                <div className={gm ? "Active" : ""} onClick={() => { setGM(!gm) }}>GM</div>
                <div className={explode ? "Active" : ""} onClick={() => { setExplode(!explode) }}>!</div>
            </div>
            <div className="Grid Dice">
                <div className="">d4</div>
                <div className="">1</div>
                <div className="">2</div>
                <div className="">3</div>
                <div className="">4</div>
            </div>
            <div className="Grid Dice">
                <div className="">d6</div>
                <div className="">1</div>
                <div className="">2</div>
                <div className="">3</div>
                <div className="">4</div>
            </div>
        </div>);

}