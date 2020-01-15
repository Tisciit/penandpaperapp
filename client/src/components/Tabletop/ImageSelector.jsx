import React, { useState, useEffect } from "react";
import { assetURL } from "../../api";

export const ImageSelector = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(assetURL)
      .then(res => res.json())
      .then(json => {
        console.log(json);
        setImages(json);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);
  return (
    <div className="ImageSelector">
      I AM IMAGE SELECTOR
      {images.map((elt, id) => {
        return (
          <img
            key={id}
            src={`${assetURL}/${elt}`}
            onDoubleClick={e => console.log(e.target)}
          />
        );
      })}
    </div>
  );
};
