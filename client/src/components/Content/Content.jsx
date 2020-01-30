import React from "react";
import "./Content.css";

const Content = props => {
  return (
    <div className="Horizontal">
      <div className="left">{props.children[0]}</div>
      <div className="right">{props.children[1]}</div>
    </div>
  );
};

export default Content;
