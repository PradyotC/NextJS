"use client";

import React, { useRef, useState, useEffect } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

const Waveform: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressWrapperRef = useRef<HTMLDivElement | null>(null);

  // minimal state: current time and duration (progress derived from those)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // wavesurfer hook for waveform rendering
  const { isReady, wavesurfer } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    cursorWidth: 1,
    waveColor: "teal",
    progressColor: "white",
    cursorColor: "white",
    barWidth: 2,
    barGap: 1,
    barRadius: 1,
    barHeight: 0.75,
    height: 50,
    hideScrollbar: true,
    barAlign: "bottom",
    dragToSeek: false,
  });

  // attach media element to wavesurfer when ready
  useEffect(() => {
    if (!wavesurfer || !audioRef.current) return;

    wavesurfer.setMediaElement(audioRef.current);

    const d = wavesurfer.getDuration();
    if (d && !isNaN(d) && d > 0) {
      const t = setTimeout(() => setDuration(d), 0);
      return () => clearTimeout(t);
    }
  }, [wavesurfer]);

  // attach audio event listeners (use browser APIs for time/duration/play/pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  // Play / Pause mapped to audio element's API
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        // isPlaying updated by the "play" event listener
      } catch (err) {
        // playback rejected (autoplay policies, etc.) — you can handle if necessary
        console.warn("Playback failed:", err);
      }
    } else {
      audio.pause();
    }
  };

  // clicking on progress bar seeks using audio.currentTime (uses built-in time update)
  const handleSeek = (e: React.MouseEvent) => {
    const audio = audioRef.current;
    const wrapper = progressWrapperRef.current;
    if (!audio || !wrapper || !duration || duration === 0) return;

    const rect = wrapper.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const ratio = Math.min(Math.max(offsetX / rect.width, 0), 1);
    audio.currentTime = ratio * duration;

    // keep wavesurfer in sync if present
    if (wavesurfer) wavesurfer.seekTo(ratio);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // compact time formatter mm:ss or hh:mm:ss if needed
  const formatTime = (t: number) => {
    if (!isFinite(t) || t <= 0) return "00:00";
    const hrs = Math.floor(t / 3600);
    const mins = Math.floor((t % 3600) / 60);
    const secs = Math.floor(t % 60);
    const two = (n: number) => String(n).padStart(2, "0");
    return hrs > 0 ? `${two(hrs)}:${two(mins)}:${two(secs)}` : `${two(mins)}:${two(secs)}`;
  };

  return (
    <div className="flex items-center gap-3">
      <button
        className="btn bg-teal-800 border-0 rounded-full aspect-square p-2 m-auto"
        onClick={handlePlayPause}
        disabled={!isReady}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-xl text-white" />
      </button>

      <div
        ref={progressWrapperRef}
        className={`custom_progress flex flex-col w-full gap-0 rounded-2xl border-teal-500 border overflow-hidden bg-teal-950 ${!isReady ? "animate-pulse" : ""}`}
        onClick={handleSeek}
        role="button"
        aria-label="Seek audio"
      >
        {/* waveform container (wavesurfer will draw here) */}
        <div ref={containerRef} />

        {/* progress + time overlay */}
        <div className="flex flex-col items-center relative">
          <progress className="progress progress-secondary w-full h-4 m-0 p-0" value={progressPercent} max={100} />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold mix-blend-exclusion pointer-events-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* audio element used for playback; not showing native controls */}
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        </div>
      </div>
    </div>
  );
};

export default Waveform;
