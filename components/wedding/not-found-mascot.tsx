"use client";

import { Mascot } from "page-mascot";

export function NotFoundMascot() {
  return (
    <Mascot
      directions="/mascots/bunny-directions.webp"
      reactions="/mascots/bunny-reactions.webp"
      size={224}
      label="wedding bunny mascot"
      className="drop-shadow-[0_18px_32px_rgb(36_50_59_/_0.18)]"
    />
  );
}
