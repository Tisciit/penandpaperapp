import React, { useState } from "react";
import "./NavSelector.css";

export const NavSelector = props => {
  const buildImages = () => {
    const imgs = [];
    for (const child of props.children) {
      imgs.push(child.props.image);
    }
    return imgs;
  };
  console.log(props.children);
  const images = buildImages();
  console.log(images);
  const [currentActive, setCurrentActive] = useState(0);

  const switchActive = event => {
    const elt = event.target;
    const index = elt.getAttribute("data-id");
    setCurrentActive(index);
  };

  return (
    <div className="NavSelector">
      <div className="RibbonRow">
        {images.map((elt, id) => (
          <img
            key={id}
            data-id={id}
            src={elt}
            alt={"Woosh!"}
            onClick={switchActive}
          />
        ))}
      </div>
      <div>{props.children[currentActive]}</div>
    </div>
  );
};
