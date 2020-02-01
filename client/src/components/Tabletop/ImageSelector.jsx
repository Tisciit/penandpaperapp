import React, { useState, useEffect } from "react";
import { assetURL, addToken } from "../../api";

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
      {images.map((elt, id) => {
        return (
          <img
            key={id}
            src={`${assetURL}/${elt}`}
            alt="Alt Prop"
            onDoubleClick={e => {
              console.log(e.target);
              if (e.target.src) {
                const token = {};
                token.image = e.target.src;
                addToken(token);
              }
            }}
          />
        );
      })}
    </div>
  );
};
