import { WEDDING_INSTANT as CONFIGURED_WEDDING_INSTANT } from "@/content/wedding";

export const WEDDING_INSTANT = CONFIGURED_WEDDING_INSTANT;

export type CountdownState =
  | { status: "before"; days: number; hours: number; minutes: number; seconds: number }
  | { status: "today" }
  | { status: "after" };

export function getCountdownState(nowMs: number, targetMs = Date.parse(WEDDING_INSTANT)): CountdownState {
  const vietnamOffsetMs = 7 * 60 * 60 * 1_000;
  const targetInVietnam = new Date(targetMs + vietnamOffsetMs);
  const targetDay = Date.UTC(targetInVietnam.getUTCFullYear(), targetInVietnam.getUTCMonth(), targetInVietnam.getUTCDate());
  const nowInVietnam = new Date(nowMs + vietnamOffsetMs);
  const nowDay = Date.UTC(nowInVietnam.getUTCFullYear(), nowInVietnam.getUTCMonth(), nowInVietnam.getUTCDate());

  if (nowMs >= targetMs && nowDay === targetDay) return { status: "today" };
  if (nowMs > targetMs && nowDay > targetDay) return { status: "after" };

  const distance = Math.max(0, targetMs - nowMs);
  const days = Math.floor(distance / 86_400_000);
  const hours = Math.floor((distance % 86_400_000) / 3_600_000);
  const minutes = Math.floor((distance % 3_600_000) / 60_000);
  const seconds = Math.floor((distance % 60_000) / 1_000);
  return { status: "before", days, hours, minutes, seconds };
}

export function padCountdown(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}
