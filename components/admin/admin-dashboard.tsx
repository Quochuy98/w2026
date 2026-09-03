"use client";

import { useState } from "react";
import { SignOut, Users, Images } from "@phosphor-icons/react";
import { logoutAction } from "@/app/admin/actions";
import type { AlbumImage, AvatarCropConfig } from "@/content/wedding";
import { GuestManager } from "./guest-manager";
import { LocalAlbumManager } from "./local-album-manager";

export function AdminDashboard({
  initialLocalImages = [],
  initialBannerSrc,
  initialGroomAvatarSrc,
  initialBrideAvatarSrc,
  initialHiddenImages = [],
  initialGroomCrop,
  initialBrideCrop,
}: {
  initialLocalImages?: AlbumImage[];
  initialBannerSrc?: string | null;
  initialGroomAvatarSrc?: string | null;
  initialBrideAvatarSrc?: string | null;
  initialHiddenImages?: string[];
  initialGroomCrop?: AvatarCropConfig;
  initialBrideCrop?: AvatarCropConfig;
}) {
  const [activeTab, setActiveTab] = useState<"guests" | "album">("guests");

  return (
    <main className="min-h-[100dvh] px-5 py-8 sm:px-8 lg:px-12 bg-[var(--background)]">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              H&amp;T Wedding Admin
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.05em]">
              Quản Trị Thiệp Cưới &amp; Album
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Hệ thống quản lý khách mời, tạo link thiệp cá nhân hóa và quản trị album ảnh.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] px-4 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <SignOut size={18} /> Đăng xuất
            </button>
          </form>
        </header>

        {/* Tab Switcher */}
        <div className="mt-8 flex items-center gap-2 border-b border-[var(--line)] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("guests")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "guests"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Users size={18} weight={activeTab === "guests" ? "fill" : "regular"} />
            <span>Khách Mời &amp; Mã Thiệp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("album")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "album"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Images size={18} weight={activeTab === "album" ? "fill" : "regular"} />
            <span>Quản Lý Ảnh Album ({initialLocalImages.length})</span>
          </button>
        </div>

        {/* Tab 1: Guest Manager */}
        {activeTab === "guests" && <GuestManager />}

        {/* Tab 2: Local Album Manager */}
        {activeTab === "album" && (
          <LocalAlbumManager
            initialImages={initialLocalImages}
            initialBannerSrc={initialBannerSrc}
            initialGroomAvatarSrc={initialGroomAvatarSrc}
            initialBrideAvatarSrc={initialBrideAvatarSrc}
            initialHiddenImages={initialHiddenImages}
            initialGroomCrop={initialGroomCrop}
            initialBrideCrop={initialBrideCrop}
          />
        )}
      </div>
    </main>
  );
}
