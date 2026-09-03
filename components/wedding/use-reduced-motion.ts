"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  if ("addEventListener" in media) {
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  }

  // Safari versions that predate MediaQueryListEventTarget expose the
  // deprecated listener methods at runtime, even though modern DOM typings
  // no longer include them.
  const legacyMedia = media as MediaQueryList & {
    addListener: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
  };
  legacyMedia.addListener(callback);
  return () => legacyMedia.removeListener(callback);
}

function getSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** A standards-compliant reduced-motion preference hook for the wedding UI. */
export function useWeddingReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
