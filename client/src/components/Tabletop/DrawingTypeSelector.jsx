import React, { useDebugValue } from "react";

import freeHand from "../../svg/gesture-24px.svg";
import rectangle from "../../svg/texture-24px.svg";

export const DrawingTypeSelector = () => {
  return (
    <div className="DrawingTypeSelectorWrapper">
      <button className="Circular">
        <img src={freeHand} />
      </button>
      <button className="Circular">
        <img src={rectangle} />
      </button>
    </div>
  );
};
