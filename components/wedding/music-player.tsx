"use client";

import { useEffect, useRef, useState } from "react";
import { weddingConfig } from "@/content/wedding";
import { SpeakerHigh, SpeakerSlash, MusicNotes } from "@phosphor-icons/react";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const music = weddingConfig.music;

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  // Attempt auto-play on first user interaction anywhere on the window
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current && !isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {
            // Autoplay blocked, wait for explicit click on player button
          });
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [hasInteracted, isPlaying]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={music.src}
        preload="auto"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Button */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        className={`group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/90 shadow-xl backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95 ${
          isPlaying ? "border-[var(--accent)]/60 ring-2 ring-[var(--accent)]/20" : ""
        }`}
      >
        {/* Vinyl disc spinning visual */}
        <div
          className={`absolute inset-1 rounded-full border border-dashed border-[var(--accent)]/40 transition-transform duration-1000 ${
            isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
          }`}
        />

        {/* Center Icon */}
        <div className="relative z-10 text-[var(--accent-strong)] transition-transform group-hover:scale-110">
          {isPlaying ? (
            <SpeakerHigh size={20} weight="fill" className="animate-pulse" />
          ) : (
            <SpeakerSlash size={20} weight="duotone" className="text-[var(--muted)]" />
          )}
        </div>

        {/* Small floating badge */}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
            <MusicNotes size={10} weight="bold" />
          </span>
        )}
      </button>
    </div>
  );
}
