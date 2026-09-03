"use client";

import { motion } from "motion/react";

// Chỉ 3-4 trái tim nhẹ nhàng bay so le nhau từ dưới lên trên
const HEARTS = [
  {
    id: 1,
    size: 16,
    color: "#e11d48",
    left: "22%",
    duration: 4.8,
    delay: 0,
    swayX: [0, -12, 10, -6],
  },
  {
    id: 2,
    size: 18,
    color: "#dc2626",
    left: "72%",
    duration: 5.4,
    delay: 1.6,
    swayX: [0, 14, -10, 8],
  },
  {
    id: 3,
    size: 13,
    color: "#f43f5e",
    left: "46%",
    duration: 5.0,
    delay: 3.2,
    swayX: [0, -10, 12, -4],
  },
  {
    id: 4,
    size: 15,
    color: "#e11d48",
    left: "82%",
    duration: 5.2,
    delay: 4.6,
    swayX: [0, 8, -8, 6],
  },
];

export function HeartBubbles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
    >
      {HEARTS.map((h) => (
        <motion.span
          key={h.id}
          className="absolute block"
          style={{
            left: h.left,
            bottom: "8px",
            filter: "drop-shadow(0 2px 6px rgba(225, 29, 72, 0.45))",
          }}
          initial={{ opacity: 0, y: 0, scale: 0.3 }}
          animate={{
            y: [0, -50, -120, -220],
            x: h.swayX,
            opacity: [0, 0.95, 0.8, 0],
            scale: [0.3, 1, 1.15, 0.85],
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
