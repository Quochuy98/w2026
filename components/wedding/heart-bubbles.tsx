"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { useWeddingReducedMotion } from "./use-reduced-motion";

// Chỉ 3-4 trái tim tinh tế, bay so le từng trái tim một, không bị dồn cục
const GENTLE_HEARTS = [
  {
    id: 1,
    size: 14,
    color: "#e11d48",
    left: "24%",
    top: "70%",
    swayX: [0, -12, 8, -6],
    duration: 4.6,
    delay: 0,
  },
  {
    id: 2,
    size: 16,
    color: "#dc2626",
    left: "70%",
    top: "75%",
    swayX: [0, 14, -8, 10],
    duration: 5.2,
    delay: 1.5,
  },
  {
    id: 3,
    size: 12,
    color: "#f43f5e",
    left: "48%",
    top: "80%",
    swayX: [0, -8, 10, -4],
    duration: 4.8,
    delay: 3.0,
  },
  {
    id: 4,
    size: 13,
    color: "#e11d48",
    left: "35%",
    top: "65%",
    swayX: [0, 10, -6, 8],
    duration: 5.0,
    delay: 4.2,
  },
];

export function HeartBubbles() {
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const reduce = useWeddingReducedMotion();
  const animated = ready && !reduce;

  if (!animated) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-visible"
    >
      {GENTLE_HEARTS.map((h) => (
        <motion.span
          key={h.id}
          className="absolute block"
          style={{
            left: h.left,
            top: h.top,
            filter: "drop-shadow(0 2px 4px rgba(225, 29, 72, 0.4))",
          }}
          initial={{ opacity: 0, y: 0, scale: 0.3 }}
          animate={{
            y: [0, -45, -110, -180],
            x: h.swayX,
            opacity: [0, 0.9, 0.75, 0],
            scale: [0.3, 0.95, 1.15, 0.9],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.color}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.span>
      ))}
    </div>
  );
}
