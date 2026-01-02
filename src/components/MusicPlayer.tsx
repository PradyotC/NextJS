"use client";
import Waveform from "@/components/Waveform"; // Reusing your existing component

export default function MusicPlayer({ audioUrl }: { audioUrl: string }) {
  // We can add more complex client logic here later (autoplay, playlists, etc.)
  return <Waveform audioUrl={audioUrl} />;
}