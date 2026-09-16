"use client";

import { Mascot } from "page-mascot";

export function NotFoundMascot() {
  return (
    <Mascot
      directions="/mascots/bunny-directions.webp"
      reactions="/mascots/bunny-reactions.webp"
      size={112}
      label="wedding bunny mascot"
      className="drop-shadow-[0_14px_24px_rgb(36_50_59_/_0.2)]"
    />
  );
}
