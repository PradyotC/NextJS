// src/components/Waveform.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Helper: Format seconds to mm:ss
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// ----------------------------------------------------------------------
// 1. ACTIVE PLAYER (Loads only when clicked)
// ----------------------------------------------------------------------
const ActiveWaveform = ({ audioUrl }: { audioUrl: string }) => {
  const containerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  const { wavesurfer, isReady, isPlaying } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    waveColor: "white",
    progressColor: "#4fd1c5", // Teal-400
    cursorColor: "red",
    cursorWidth: 3,
    barWidth: 3,
    barGap: 3,
    barRadius: 2,
    height: 48,
    barAlign: "bottom",
  });

  // Track current playback time
  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on("timeupdate", (time) => setCurrentTime(time)),
    ];

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [wavesurfer]);

  const onPlayPause = useCallback(() => {
    wavesurfer?.playPause();
  }, [wavesurfer]);

  return (
    <div className="flex items-center gap-4 w-full animate-in fade-in duration-300">
      {/* Left Column: Play Button + Time */}
      <div className="flex flex-col items-center justify-center gap-1 min-w-[3rem]">
        <button
          onClick={onPlayPause}
          disabled={!isReady} // Disable interaction while loading
          className="btn btn-circle btn-primary btn-sm flex-shrink-0"
        >
          {!isReady ? (
            <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
          ) : (
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          )}
        </button>

        {/* Time Display: Only visible when fully loaded */}
        <div 
          className={`text-[10px] font-mono font-medium transition-opacity duration-300 ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Waveform Container: Dimmed & Pulsing until ready */}
      <div 
        className={`flex-1 min-w-0 bg-teal-950 rounded-lg p-1 border border-base-content/10 transition-all duration-500 ${
          isReady ? "opacity-100" : "opacity-50 animate-pulse"
        }`}
      >
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. LAZY PLACEHOLDER (Lightweight, 0 network usage)
// ----------------------------------------------------------------------
const LazyWaveform = ({ audioUrl }: { audioUrl: string }) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  if (shouldLoad) {
    return <ActiveWaveform audioUrl={audioUrl} />;
  }

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex flex-col items-center justify-center gap-1 min-w-[3rem]">
        <button
          onClick={() => setShouldLoad(true)}
          className="btn btn-circle btn-ghost btn-sm border border-base-content/20 flex-shrink-0 hover:border-primary hover:text-primary transition-colors"
          aria-label="Load and Play"
        >
          <FontAwesomeIcon icon={faPlay} className="ml-0.5" />
        </button>
        {/* Spacer to match ActiveWaveform height/alignment */}
        <div className="text-[10px] opacity-0">0:00</div>
      </div>

      <div className="flex-1 h-12 flex justify-center items-end gap-[2px] opacity-30 select-none pointer-events-none">
        {/* Fake visual bars for aesthetics */}
        {Array.from({ length: 37 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-current rounded-full"
            style={{
              height: `${Math.max(20, Math.abs(Math.sin(i * 13)) * 100).toFixed(1)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LazyWaveform;