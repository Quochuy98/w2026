import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getGuestByCode: vi.fn(),
  getPublicAlbumState: vi.fn(),
  incrementGuestView: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/guests", () => ({
  getGuestByCode: mocks.getGuestByCode,
  incrementGuestView: mocks.incrementGuestView,
}));
vi.mock("@/lib/gallery", () => ({
  getPublicAlbumState: mocks.getPublicAlbumState,
}));
vi.mock("@/components/wedding/wedding-landing", () => ({
  WeddingLanding: () => null,
}));

import GuestInvitationPage from "@/app/[code]/page";

describe("guest invitation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicAlbumState.mockResolvedValue({
      images: [],
      slots: {},
      isFallback: true,
    });
  });

  it("uses the not-found boundary for an unknown guest code", async () => {
    mocks.getGuestByCode.mockResolvedValue(null);

    await expect(
      GuestInvitationPage({ params: Promise.resolve({ code: "khong-ton-tai" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalledOnce();
    expect(mocks.incrementGuestView).not.toHaveBeenCalled();
  });
});
