"use client";

import React from "react";

// Config cho từng trái tim bay lên: vị trí, kích thước, độ trễ, thời gian và hướng bay
const HEARTS = [
  { left: "12%", size: 14, delay: "0s", duration: "3.2s", anim: "1", color: "#e11d48", opacity: 0.9 },
  { left: "78%", size: 18, delay: "0.7s", duration: "3.8s", anim: "2", color: "#dc2626", opacity: 0.85 },
  { left: "28%", size: 12, delay: "1.4s", duration: "3.4s", anim: "3", color: "#f43f5e", opacity: 0.95 },
  { left: "84%", size: 16, delay: "2.1s", duration: "4.1s", anim: "1", color: "#e11d48", opacity: 0.8 },
  { left: "8%", size: 20, delay: "2.8s", duration: "3.6s", anim: "2", color: "#dc2626", opacity: 0.9 },
  { left: "48%", size: 13, delay: "0.3s", duration: "3.9s", anim: "3", color: "#fb7185", opacity: 0.85 },
  { left: "68%", size: 11, delay: "1.9s", duration: "3.3s", anim: "1", color: "#e11d48", opacity: 0.75 },
  { left: "20%", size: 15, delay: "3.3s", duration: "3.7s", anim: "2", color: "#f43f5e", opacity: 0.9 },
  { left: "40%", size: 22, delay: "2.5s", duration: "4.3s", anim: "3", color: "#dc2626", opacity: 0.85 },
  { left: "90%", size: 13, delay: "1.0s", duration: "3.5s", anim: "1", color: "#e11d48", opacity: 0.8 },
  { left: "4%", size: 17, delay: "1.7s", duration: "4.0s", anim: "2", color: "#f43f5e", opacity: 0.85 },
  { left: "60%", size: 15, delay: "3.0s", duration: "3.4s", anim: "3", color: "#dc2626", opacity: 0.9 },
];

export function HeartBubbles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-6 -bottom-4 -top-8 z-10 overflow-visible"
    >
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className={`absolute block heart-bubble-${h.anim}`}
          style={{
            left: h.left,
            bottom: "10px",
            animationDelay: h.delay,
            animationDuration: h.duration,
            filter: "drop-shadow(0 2px 4px rgba(225, 29, 72, 0.4))",
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.color}
            style={{ opacity: h.opacity }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
