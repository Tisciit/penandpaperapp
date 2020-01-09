import React, { useState, useEffect } from "react";

import { subscribeAudio, unsubscribeAudio, audioURL } from "../api";

export const AudioPlayer = () => {
  const [audio, setAudio] = useState(new Audio(audioURL));
  const [audioName, setAudioName] = useState("Track!");

  useEffect(() => {
    audio.play();
    subscribeAudio(track => {
      audio.pause();
      setAudio(new Audio(audioURL));
      setAudioName(track);
    });

    function onAudioEnded() {
      //When Audio ends, restart for infinite loop :)
      setAudio(new Audio(audioURL));
    }

    audio.addEventListener("ended", onAudioEnded);

    return () => {
      unsubscribeAudio();
      audio.removeEventListener("ended", onAudioEnded);
    };
  }, [audio]);

  const handlePlayPause = e => {
    console.log(e.target.paused);
    return audio.paused ? audio.play() : audio.pause();
  };
  const handleVolume = e => {
    console.log(e.target.value / 100);
    audio.volume = e.target.value / 100;
  };
  return (
    <div className="AudioPlayerWrapper">
      <div className="AudioPlayer">
        <p>Now Playing {audioName}</p>
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
