import React from "react";

export const Row = props => {
  const { diceType, columns, rollFunction } = props;

  const onClickHandler = e => {
    const control = e.target;
    console.log(control);
    const num = control.getAttribute("datanum");
    if (num) {
      rollFunction(`${num}d${diceType}`);
    } else {
      throw new Error("Event target did not have datanum attribute!");
    }
  };

  const buildRow = () => {
    let result = [];
    for (let i = 2; i < columns + 1; i++) {
      result.push(
        <div key={i} datanum={i} onClick={onClickHandler}>
          {i}
        </div>
      );
    }
    return result;
  };

  return (
    <div className="Grid Dice">
      <div datanum={1} onClick={onClickHandler}>
        d{diceType}
      </div>
      {buildRow()}
    </div>
  );
};
