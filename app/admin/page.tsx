import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAlbum } from "@/lib/imagekit/admin";
import { getSessionTokenFromCookieHeader, verifyAdminSession } from "@/lib/auth/session";
import { scanLocalAlbumFiles, getSavedSlotsConfig } from "@/lib/local-album";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Quản lý thiệp cưới & album | Quốc Huy & Hoài Thương",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  const cookieHeader = store.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
  if (!verifyAdminSession(getSessionTokenFromCookieHeader(cookieHeader))) redirect("/admin/login");

  const [album, localImages, slotsConfig] = await Promise.all([
    getAdminAlbum(),
    scanLocalAlbumFiles(),
    getSavedSlotsConfig(),
  ]);

  return (
    <AdminDashboard
      initialAlbum={album}
      initialLocalImages={localImages}
      initialBannerSrc={slotsConfig.bannerSrc}
      initialGroomAvatarSrc={slotsConfig.groomAvatarSrc}
      initialBrideAvatarSrc={slotsConfig.brideAvatarSrc}
      initialHiddenImages={slotsConfig.hiddenImages}
      initialGroomCrop={slotsConfig.groomCrop}
      initialBrideCrop={slotsConfig.brideCrop}
    />
  );
}




