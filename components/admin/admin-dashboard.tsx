"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowClockwise, Check, ImageSquare, SignOut, UploadSimple, X, Users, Images } from "@phosphor-icons/react";
import { upload } from "@imagekit/next";
import { assignSlotAction, logoutAction, refreshAlbumAction } from "@/app/admin/actions";
import { IMAGEKIT_MAX_PIXELS, IMAGEKIT_MAX_UPLOAD_BYTES, IMAGEKIT_UPLOAD_TRANSFORMATION } from "@/lib/imagekit/config";
import { SLOT_LABELS, WEDDING_SLOTS, weddingConfig, type AlbumImage, type WeddingSlot, type AvatarCropConfig } from "@/content/wedding";

import type { AdminAlbumState } from "@/lib/imagekit/admin";
import { GuestManager } from "./guest-manager";
import { LocalAlbumManager } from "./local-album-manager";

type UploadStatus = "queued" | "validating" | "uploading" | "success" | "error";
type UploadItem = { id: string; file: File; progress: number; status: UploadStatus; message?: string };
type UploadAuth = { token: string; expire: number; signature: string; publicKey: string };

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

async function validateFile(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Chỉ nhận file ảnh.");
  if (file.size > IMAGEKIT_MAX_UPLOAD_BYTES) throw new Error(`Ảnh phải không quá ${formatBytes(IMAGEKIT_MAX_UPLOAD_BYTES)}.`);
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const pixels = bitmap.width * bitmap.height;
    bitmap.close();
    if (pixels > IMAGEKIT_MAX_PIXELS) throw new Error("Độ phân giải ảnh vượt quá 25 megapixel.");
  }
}

export function AdminDashboard({
  initialAlbum,
  initialLocalImages = [],
  initialBannerSrc,
  initialGroomAvatarSrc,
  initialBrideAvatarSrc,
  initialHiddenImages = [],
  initialGroomCrop,
  initialBrideCrop,
}: {
  initialAlbum: AdminAlbumState;
  initialLocalImages?: AlbumImage[];
  initialBannerSrc?: string | null;
  initialGroomAvatarSrc?: string | null;
  initialBrideAvatarSrc?: string | null;
  initialHiddenImages?: string[];
  initialGroomCrop?: AvatarCropConfig;
  initialBrideCrop?: AvatarCropConfig;
}) {

  const [activeTab, setActiveTab] = useState<"guests" | "album">("guests");



  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const slotImages = useMemo(() => {
    const map = new Map<WeddingSlot, AlbumImage>();
    initialAlbum.images.forEach((image) => image.slot && map.set(image.slot, image));
    return map;
  }, [initialAlbum.images]);

  async function getUploadAuth(): Promise<UploadAuth> {
    const authResponse = await fetch("/api/imagekit/upload-auth", { method: "POST", cache: "no-store" });
    if (!authResponse.ok) throw new Error("Phiên đăng nhập hoặc ImageKit không khả dụng.");
    return await authResponse.json() as UploadAuth;
  }

  async function uploadItem(item: UploadItem): Promise<boolean> {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "validating", message: undefined } : entry));
    try {
      await validateFile(item.file);
      // ImageKit upload tokens are single-use. Request a fresh signed tuple
      // for every file so a multi-file batch does not replay the first token.
      const auth = await getUploadAuth();
      const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      await upload({
        file: item.file,
        fileName: `${Date.now()}-${safeName}`,
        folder: weddingConfig.imageKitFolder,
        tags: ["wedding-album"],
        useUniqueFileName: true,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        publicKey: auth.publicKey,
        transformation: { pre: IMAGEKIT_UPLOAD_TRANSFORMATION },
        onProgress: (event) => {
          const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploading", progress } : entry));
        },
      });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "success", progress: 100, message: undefined } : entry));
      return true;
    } catch (error) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "error", message: error instanceof Error ? error.message : "Upload thất bại." } : entry));
      return false;
    }
  }

  async function finishUploads(itemsToRefresh: UploadItem[], allSucceeded: boolean) {
    if (itemsToRefresh.length === 0) return;
    startTransition(async () => {
      try {
        await refreshAlbumAction();
        if (allSucceeded) {
          window.location.reload();
        } else {
          setNotice("Một số ảnh chưa tải được. Bạn có thể thử lại từng ảnh lỗi hoặc bấm Làm mới sau khi hoàn tất.");
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Phiên quản trị đã hết hạn.");
      }
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !initialAlbum.configured) return;
    const queued = Array.from(files).map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`, file, progress: 0, status: "queued" as const }));
    setItems(queued);
    setNotice(null);
    let allSucceeded = true;
    let uploadedAny = false;
    for (const item of queued) {
      const succeeded = await uploadItem(item);
      allSucceeded = allSucceeded && succeeded;
      uploadedAny = uploadedAny || succeeded;
    }
    await finishUploads(queued, allSucceeded && uploadedAny);
  }

  async function retryItem(itemId: string) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item || item.status !== "error" || !initialAlbum.configured) return;
    setNotice(null);
    try {
      const succeeded = await uploadItem(item);
      await finishUploads([item], succeeded);
    } catch (error) {
      setItems((current) => current.map((entry) => entry.id === itemId ? { ...entry, status: "error", message: error instanceof Error ? error.message : "Phiên đăng nhập hoặc ImageKit không khả dụng." } : entry));
    }
  }

  function selectSlot(fileId: string, value: string) {
    const image = initialAlbum.images.find((candidate) => candidate.id === fileId);
    const previousSlot = image?.slot;
    const nextSlot = value as WeddingSlot;
    setNotice(null);
    startTransition(async () => {
      try {
        await assignSlotAction(value ? fileId : null, value ? nextSlot : (previousSlot as WeddingSlot));
        window.location.reload();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Không thể cập nhật vị trí ảnh.");
      }
    });
  }

  return (
    <main className="min-h-[100dvh] px-5 py-8 sm:px-8 lg:px-12 bg-[var(--background)]">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">H&amp;T Wedding Admin</p>

            <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.05em]">Quản Trị Thiệp Cưới &amp; Album</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Hệ thống quản lý khách mời, tạo link thiệp cá nhân hóa và quản trị album ảnh.</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] px-4 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"><SignOut size={18} /> Đăng xuất</button>
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
            <span>Quản Lý Ảnh Album ({initialLocalImages.length > 0 ? initialLocalImages.length : initialAlbum.images.length})</span>
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


