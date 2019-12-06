import React from "react";

import { subscribeAudio, unsubscribeAudio, audioURL } from "../api";

export const AudioPlayer = () => {
  return (
    <div className="AudioPlayerWrapper">
      <div className="AudioPlayer">
        <audio controls>
          <source src={audioURL} />
        </audio>
      </div>
    </div>
  );
};
