import React, { useRef } from "react";

import { subscribeAudio, unsubscribeAudio, audioURL } from "../api";

export const AudioPlayer = () => {
  const audioRef = useRef(null);

  const handlePlayPause = e => {
    console.log(e.target.paused);
    return audioRef.current.paused
      ? audioRef.current.play()
      : audioRef.current.pause();
  };
  const handleVolume = e => {
    console.log(e.target.value / 100);
    audioRef.current.volume = e.target.value / 100;
  };
  return (
    <div className="AudioPlayerWrapper">
      <div className="AudioPlayer">
        <audio ref={audioRef} controls>
          <source src={audioURL} />
        </audio>
        <p>Now Playing</p>
        <span>
          <button onClick={handlePlayPause}>Play / Pause</button>
          <input
            onChange={handleVolume}
            type="range"
            min="0"
            max="100"
            step="1"
          />
        </span>
      </div>
    </div>
  );
};
