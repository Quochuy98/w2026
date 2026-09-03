"use client";

import { motion, useInView } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { useWeddingReducedMotion } from "./use-reduced-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

export function Reveal({ children, className, delay = 0, y = 22, once = true }: RevealProps) {
  const reduce = useWeddingReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.18 });
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  // Keep the server and first client render identical. Motion can then hide
  // below-the-fold content after hydration and reveal it as it enters view,
  // without a reduced-motion hydration mismatch.
  const animated = ready && !reduce;
  const visible = !animated || inView;

  return (
    <motion.div
      ref={ref}
      data-reveal="true"
      className={className}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={animated ? { duration: 0.68, delay, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
