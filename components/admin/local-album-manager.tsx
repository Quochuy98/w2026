"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  UploadSimple,
  Trash,
  Star,
  CheckCircle,
  FolderSimplePlus,
  Image as ImageIcon,
  Sparkle,
  Info,
  User,
  Eye,
  EyeSlash,
  Crop,
  X,
  Check,
  ArrowsOutCardinal,
} from "@phosphor-icons/react";
import type { AlbumImage, AvatarCropConfig } from "@/content/wedding";

interface LocalAlbumManagerProps {
  initialImages: AlbumImage[];
  initialBannerSrc?: string | null;
  initialGroomAvatarSrc?: string | null;
  initialBrideAvatarSrc?: string | null;
  initialHiddenImages?: string[];
  initialGroomCrop?: AvatarCropConfig;
  initialBrideCrop?: AvatarCropConfig;
}

export function LocalAlbumManager({
  initialImages,
  initialBannerSrc,
  initialGroomAvatarSrc,
  initialBrideAvatarSrc,
  initialHiddenImages = [],
  initialGroomCrop,
  initialBrideCrop,
}: LocalAlbumManagerProps) {
  const [images, setImages] = useState<AlbumImage[]>(initialImages);
  const [slotsConfig, setSlotsConfig] = useState({
    bannerSrc: initialBannerSrc || null,
    groomAvatarSrc: initialGroomAvatarSrc || null,
    brideAvatarSrc: initialBrideAvatarSrc || null,
  });
  const [groomCrop, setGroomCrop] = useState<AvatarCropConfig>(initialGroomCrop || { x: 50, y: 25, zoom: 1 });
  const [brideCrop, setBrideCrop] = useState<AvatarCropConfig>(initialBrideCrop || { x: 50, y: 25, zoom: 1 });
  const [hiddenImages, setHiddenImages] = useState<string[]>(initialHiddenImages);
  const [notice, setNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Crop modal state
  const [editingCropSide, setEditingCropSide] = useState<"groom" | "bride" | null>(null);
  const [tempCrop, setTempCrop] = useState<AvatarCropConfig>({ x: 50, y: 25, zoom: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; cropX: number; cropY: number }>({ x: 0, y: 0, cropX: 50, cropY: 25 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBanner = images.find((img) => img.src === slotsConfig.bannerSrc) || images[0];
  const currentGroom = images.find((img) => img.src === slotsConfig.groomAvatarSrc) || images.find((img) => img.slot === "portrait-two") || images[2] || images[0];
  const currentBride = images.find((img) => img.src === slotsConfig.brideAvatarSrc) || images.find((img) => img.slot === "portrait-one") || images[3] || images[0];

  const visibleCount = images.filter((img) => !hiddenImages.includes(img.src)).length;
  const hiddenCount = images.length - visibleCount;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setNotice(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/album", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Tải ảnh lên thất bại");
      }

      setImages(data.images);
      setNotice(`✅ ${data.message || "Đã tải lên và tối ưu ảnh thành công!"}`);
    } catch (err) {
      setNotice(`❌ ${err instanceof Error ? err.message : "Có lỗi xảy ra khi tải ảnh."}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetSlot = async (type: "banner" | "groom" | "bride", src: string) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/album/slot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, src }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Không thể cập nhật ảnh vị trí");
        }

        setSlotsConfig({
          bannerSrc: data.config?.bannerSrc || slotsConfig.bannerSrc,
          groomAvatarSrc: data.config?.groomAvatarSrc || slotsConfig.groomAvatarSrc,
          brideAvatarSrc: data.config?.brideAvatarSrc || slotsConfig.brideAvatarSrc,
        });

        const labels = {
          banner: "Ảnh Banner chính",
          groom: "Avatar Nhà Trai",
          bride: "Avatar Nhà Gái",
        };
        setNotice(`✨ Đã chọn ảnh làm ${labels[type]} thành công!`);
      } catch (err) {
        setNotice(`❌ ${err instanceof Error ? err.message : "Lỗi khi cập nhật ảnh"}`);
      }
    });
  };

  const handleToggleVisibility = async (src: string) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/album/visibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ src }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Không thể đổi trạng thái hiển thị");
        }

        setHiddenImages(data.hiddenImages || []);
        setNotice(`✨ ${data.message}`);
      } catch (err) {
        setNotice(`❌ ${err instanceof Error ? err.message : "Có lỗi xảy ra"}`);
      }
    });
  };

  const handleDelete = async (src: string) => {
    const filename = src.replace("/images/album/", "");
    if (!confirm(`Bạn có chắc chắn muốn xóa file ảnh "${filename}" khỏi dự án không?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/album", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Không thể xóa ảnh");
        }

        setImages(data.images);
        setNotice(`🗑️ ${data.message || "Đã xóa ảnh thành công!"}`);
      } catch (err) {
        setNotice(`❌ ${err instanceof Error ? err.message : "Lỗi khi xóa ảnh"}`);
      }
    });
  };

  const openCropEditor = (side: "groom" | "bride") => {
    setEditingCropSide(side);
    setTempCrop(side === "groom" ? { ...groomCrop } : { ...brideCrop });
  };

  const handleSaveCrop = async () => {
    if (!editingCropSide) return;
    const side = editingCropSide;

    startTransition(async () => {
      try {
        const res = await fetch("/api/album/crop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ side, crop: tempCrop }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Không thể lưu vị trí khuôn mặt");
        }

        if (side === "groom") {
          setGroomCrop({ ...tempCrop });
        } else {
          setBrideCrop({ ...tempCrop });
        }

        setEditingCropSide(null);
        setNotice(`✨ ${data.message || "Đã lưu vị trí khuôn mặt thành công!"}`);
      } catch (err) {
        setNotice(`❌ ${err instanceof Error ? err.message : "Lỗi khi lưu vị trí"}`);
      }
    });
  };

  // Drag handlers for interactive circle
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: tempCrop.x,
      cropY: tempCrop.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Map pixel delta to percentage
    const newX = Math.min(100, Math.max(0, Math.round(dragStartRef.current.cropX - dx * 0.3)));
    const newY = Math.min(100, Math.max(0, Math.round(dragStartRef.current.cropY - dy * 0.3)));
    setTempCrop((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="mt-8 space-y-10">
      {notice && (
        <div
          role="status"
          className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface)] p-4 text-sm text-[var(--foreground)]"
        >
          {notice}
        </div>
      )}

      {/* Guide Box */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)]/60 p-5 text-sm text-[var(--muted)]">
        <Info size={20} className="text-[var(--accent)] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[var(--foreground)]">Cơ Chế Quản Lý Ảnh Trong Dự Án (Local Storage)</p>
          <p className="leading-relaxed">
            - <strong>Căn chỉnh mặt Nhà Trai / Nhà Gái</strong>: Bấm nút <strong>&quot;Căn Chỉnh Mặt&quot;</strong> để phóng to (Zoom) và kéo vị trí hiển thị đúng tâm khuôn mặt cô dâu / chú rể.
          </p>
          <p className="leading-relaxed">
            - <strong>Ẩn / Hiện ảnh</strong>: Bấm nút <strong>&quot;Đang hiện&quot; / &quot;Đang ẩn&quot;</strong> ở từng tấm ảnh để quyết định ảnh có xuất hiện trong album công khai hay không.
          </p>
        </div>
      </div>

      {/* Key Featured Positions (Banner & Avatars) */}
      <section aria-labelledby="featured-positions-title" className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)]/70 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
          <Sparkle size={22} weight="duotone" />
          <h2 id="featured-positions-title" className="font-display text-2xl text-[var(--foreground)] tracking-[-0.03em]">
            Ảnh Vị Trí Nổi Bật Đang Chọn
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Banner */}
          <div className="flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4 text-center">
            <div className="relative aspect-[4/5] w-28 sm:w-32 overflow-hidden rounded-xl bg-[var(--surface)] shadow-md mb-3">
              {currentBanner ? (
                <Image src={currentBanner.src} alt="Banner" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Chưa có ảnh</div>
              )}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 mb-1">
              <Star size={12} weight="fill" />
              <span>Banner Trang Chủ</span>
            </div>
            <p className="font-mono text-xs text-[var(--muted)] truncate max-w-[180px]" title={currentBanner?.src}>
              {currentBanner ? currentBanner.src.replace("/images/album/", "") : "--"}
            </p>
          </div>

          {/* Card 2: Groom Avatar with Face Crop */}
          <div className="flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4 text-center">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--surface)] shadow-md mb-3">
              {currentGroom ? (
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    transform: `scale(${groomCrop.zoom})`,
                    transformOrigin: `${groomCrop.x}% ${groomCrop.y}%`,
                  }}
                >
                  <Image
                    src={currentGroom.src}
                    alt="Nhà Trai"
                    fill
                    unoptimized
                    style={{
                      objectFit: "cover",
                      objectPosition: `${groomCrop.x}% ${groomCrop.y}%`,
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Chưa có ảnh</div>
              )}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 mb-1">
              <User size={12} weight="bold" />
              <span>Avatar Nhà Trai</span>
            </div>
            <p className="font-mono text-xs text-[var(--muted)] truncate max-w-[180px]" title={currentGroom?.src}>
              {currentGroom ? currentGroom.src.replace("/images/album/", "") : "--"}
            </p>

            <button
              type="button"
              onClick={() => openCropEditor("groom")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm"
              title="Căn chỉnh vị trí tâm khuôn mặt và độ zoom cho avatar Nhà Trai"
            >
              <Crop size={14} weight="bold" />
              <span>Căn Chỉnh Mặt</span>
            </button>
          </div>

          {/* Card 3: Bride Avatar with Face Crop */}
          <div className="flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4 text-center">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--surface)] shadow-md mb-3">
              {currentBride ? (
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    transform: `scale(${brideCrop.zoom})`,
                    transformOrigin: `${brideCrop.x}% ${brideCrop.y}%`,
                  }}
                >
                  <Image
                    src={currentBride.src}
                    alt="Nhà Gái"
                    fill
                    unoptimized
                    style={{
                      objectFit: "cover",
                      objectPosition: `${brideCrop.x}% ${brideCrop.y}%`,
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Chưa có ảnh</div>
              )}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 mb-1">
              <User size={12} weight="bold" />
              <span>Avatar Nhà Gái</span>
            </div>
            <p className="font-mono text-xs text-[var(--muted)] truncate max-w-[180px]" title={currentBride?.src}>
              {currentBride ? currentBride.src.replace("/images/album/", "") : "--"}
            </p>

            <button
              type="button"
              onClick={() => openCropEditor("bride")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm"
              title="Căn chỉnh vị trí tâm khuôn mặt và độ zoom cho avatar Nhà Gái"
            >
              <Crop size={14} weight="bold" />
              <span>Căn Chỉnh Mặt</span>
            </button>
          </div>
        </div>
      </section>

      {/* Face Crop & Zoom Modal */}
      {editingCropSide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--background)] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Crop size={20} className="text-[var(--accent)]" weight="bold" />
                <h3 className="font-display text-xl text-[var(--foreground)]">
                  Căn Chỉnh Khuôn Mặt ({editingCropSide === "groom" ? "Nhà Trai - Chú rể" : "Nhà Gái - Cô dâu"})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCropSide(null)}
                className="rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--surface-strong)] transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Live Circular Preview Frame */}
              <div className="flex flex-col items-center">
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="relative h-48 w-48 sm:h-56 sm:w-56 overflow-hidden rounded-full border-4 border-[var(--accent)] shadow-xl bg-neutral-900 cursor-grab active:cursor-grabbing select-none"
                  title="Giữ chuột và kéo để di chuyển vị trí khuôn mặt"
                >
                  <div
                    className="relative h-full w-full pointer-events-none"
                    style={{
                      transform: `scale(${tempCrop.zoom})`,
                      transformOrigin: `${tempCrop.x}% ${tempCrop.y}%`,
                    }}
                  >
                    <Image
                      src={editingCropSide === "groom" ? currentGroom.src : currentBride.src}
                      alt="Crop preview"
                      fill
                      unoptimized
                      style={{
                        objectFit: "cover",
                        objectPosition: `${tempCrop.x}% ${tempCrop.y}%`,
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 pointer-events-none rounded-full border border-dashed border-white/40" />
                </div>
                <p className="mt-2 text-[0.7rem] text-[var(--muted)] flex items-center gap-1">
                  <ArrowsOutCardinal size={12} /> Kéo trực tiếp trên hình để căn chỉnh
                </p>
              </div>

              {/* Sliders and Presets */}
              <div className="flex-1 w-full space-y-4 text-xs">
                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--foreground)]">🔍 Phóng to khuôn mặt (Zoom)</span>
                    <span className="font-mono text-[var(--accent)]">{tempCrop.zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={tempCrop.zoom}
                    onChange={(e) => setTempCrop((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Horizontal X Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--foreground)]">↔️ Vị trí Ngang (Trái - Phải)</span>
                    <span className="font-mono text-[var(--accent)]">{tempCrop.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={tempCrop.x}
                    onChange={(e) => setTempCrop((prev) => ({ ...prev, x: parseInt(e.target.value, 10) }))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Vertical Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--foreground)]">↕️ Vị trí Dọc (Trên - Dưới)</span>
                    <span className="font-mono text-[var(--accent)]">{tempCrop.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={tempCrop.y}
                    onChange={(e) => setTempCrop((prev) => ({ ...prev, y: parseInt(e.target.value, 10) }))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-[var(--line)]">
                  <p className="text-[0.7rem] font-semibold text-[var(--muted)] mb-1.5">Gợi ý chọn nhanh:</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTempCrop({ x: 50, y: 20, zoom: 1.8 })}
                      className="rounded-lg bg-[var(--surface-strong)] px-2 py-1 text-[0.7rem] hover:bg-[var(--accent)] hover:text-white transition"
                    >
                      👤 Cận mặt
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempCrop({ x: 50, y: 25, zoom: 1.3 })}
                      className="rounded-lg bg-[var(--surface-strong)] px-2 py-1 text-[0.7rem] hover:bg-[var(--accent)] hover:text-white transition"
                    >
                      👔 Bán thân
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempCrop({ x: 50, y: 50, zoom: 1.0 })}
                      className="rounded-lg bg-[var(--surface-strong)] px-2 py-1 text-[0.7rem] hover:bg-[var(--accent)] hover:text-white transition"
                    >
                      🔄 Toàn cảnh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setEditingCropSide(null)}
                className="rounded-full px-5 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-strong)] transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveCrop}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--accent-strong)] transition"
              >
                <Check size={14} weight="bold" />
                <span>{isPending ? "Đang lưu..." : "Lưu Vị Trí Khuôn Mặt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Photos Area */}
      <section aria-labelledby="upload-section-title" className="rounded-[1.25rem] border-2 border-dashed border-[var(--line)] hover:border-[var(--accent)] bg-[var(--surface)]/40 p-8 text-center transition">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="album-file-input"
        />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--accent)] mb-4">
          <FolderSimplePlus size={32} />
        </div>

        <h3 id="upload-section-title" className="font-display text-xl sm:text-2xl text-[var(--foreground)]">
          Tải Thêm Ảnh Vào Album Dự Án
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
          Hỗ trợ chọn nhiều ảnh cùng lúc (.jpg, .jpeg, .png, .webp). Hệ thống tự động nén sắc nét.
        </p>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:bg-[var(--accent-strong)] active:scale-[0.98] disabled:opacity-50"
        >
          <UploadSimple size={18} weight="bold" />
          <span>{isUploading ? "Đang nén và tải ảnh lên..." : "Chọn ảnh từ máy tính"}</span>
        </button>
      </section>

      {/* Album Photo Gallery Grid */}
      <section aria-labelledby="gallery-section-title" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <ImageIcon size={22} className="text-[var(--accent)]" />
            <h2 id="gallery-section-title" className="font-display text-2xl tracking-[-0.03em]">
              Tất Cả Ảnh Trong Album ({images.length})
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-700">
              <Eye size={13} weight="bold" /> {visibleCount} Đang Hiện
            </span>
            {hiddenCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 font-semibold text-amber-800">
                <EyeSlash size={13} weight="bold" /> {hiddenCount} Đang Ẩn
              </span>
            )}
          </div>
        </div>

        {images.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/50 p-12 text-center text-[var(--muted)]">
            <p className="text-base font-semibold text-[var(--foreground)]">Thư mục album hiện chưa có ảnh</p>
            <p className="text-xs mt-1">Trang chủ đang tự động dùng các ảnh minh họa. Hãy bấm &quot;Chọn ảnh từ máy tính&quot; ở trên hoặc copy file ảnh vào thư mục <code className="font-mono text-xs">public/images/album/</code>!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {images.map((img) => {
              const isCurrentBanner = img.src === slotsConfig.bannerSrc || (slotsConfig.bannerSrc === null && img.id === currentBanner?.id);
              const isCurrentGroom = img.src === slotsConfig.groomAvatarSrc || (slotsConfig.groomAvatarSrc === null && img.id === currentGroom?.id);
              const isCurrentBride = img.src === slotsConfig.brideAvatarSrc || (slotsConfig.brideAvatarSrc === null && img.id === currentBride?.id);
              const isHidden = hiddenImages.includes(img.src);
              const filename = img.src.replace("/images/album/", "");

              return (
                <div
                  key={img.id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border transition bg-[var(--surface)] ${
                    isHidden
                      ? "border-dashed border-amber-300 opacity-80"
                      : isCurrentBanner || isCurrentGroom || isCurrentBride
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-md"
                      : "border-[var(--line)] hover:border-[var(--accent)]/60 shadow-sm"
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--surface-strong)]">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />

                    {/* Hidden Overlay */}
                    {isHidden && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-2 text-center text-white backdrop-blur-[2px]">
                        <EyeSlash size={24} weight="bold" className="mb-1 text-amber-300" />
                        <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-200">
                          Đã Ẩn Khỏi Album
                        </span>
                      </div>
                    )}

                    {/* Active badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                      {isCurrentBanner && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">
                          <CheckCircle size={10} weight="fill" /> Banner
                        </div>
                      )}
                      {isCurrentGroom && (
                        <div className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">
                          <CheckCircle size={10} weight="fill" /> Nhà Trai
                        </div>
                      )}
                      {isCurrentBride && (
                        <div className="flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">
                          <CheckCircle size={10} weight="fill" /> Nhà Gái
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate font-mono text-xs font-semibold text-[var(--foreground)]" title={filename}>
                        {filename}
                      </p>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(img.src)}
                        className="inline-flex items-center justify-center h-6 w-6 shrink-0 rounded-full text-red-600 hover:bg-red-50 transition"
                        title="Xóa ảnh khỏi thư mục"
                      >
                        <Trash size={13} />
                      </button>
                    </div>

                    {/* Show/Hide Toggle Button */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleVisibility(img.src)}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                        isHidden
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                      }`}
                      title={isHidden ? "Nhấn để cho hiện ảnh này trên web" : "Nhấn để ẩn ảnh này trên web"}
                    >
                      {isHidden ? <EyeSlash size={14} weight="bold" /> : <Eye size={14} weight="bold" />}
                      <span>{isHidden ? "Đang Ẩn (Bấm để hiện)" : "Đang Hiện (Bấm để ẩn)"}</span>
                    </button>

                    {/* Quick selection toolbar */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-[var(--line)]/50 text-[0.65rem] font-medium">
                      <button
                        type="button"
                        disabled={isPending || isCurrentBanner}
                        onClick={() => handleSetSlot("banner", img.src)}
                        className={`rounded py-1 transition text-center ${
                          isCurrentBanner
                            ? "bg-amber-500/20 text-amber-800 font-bold"
                            : "bg-[var(--surface-strong)] hover:bg-[var(--accent)] hover:text-white text-[var(--foreground)]"
                        }`}
                        title="Đặt làm Banner trang chủ"
                      >
                        Banner
                      </button>

                      <button
                        type="button"
                        disabled={isPending || isCurrentGroom}
                        onClick={() => handleSetSlot("groom", img.src)}
                        className={`rounded py-1 transition text-center ${
                          isCurrentGroom
                            ? "bg-blue-500/20 text-blue-800 font-bold"
                            : "bg-[var(--surface-strong)] hover:bg-blue-600 hover:text-white text-[var(--foreground)]"
                        }`}
                        title="Đặt làm Avatar Nhà Trai"
                      >
                        Nhà Trai
                      </button>

                      <button
                        type="button"
                        disabled={isPending || isCurrentBride}
                        onClick={() => handleSetSlot("bride", img.src)}
                        className={`rounded py-1 transition text-center ${
                          isCurrentBride
                            ? "bg-rose-500/20 text-rose-800 font-bold"
                            : "bg-[var(--surface-strong)] hover:bg-rose-600 hover:text-white text-[var(--foreground)]"
                        }`}
                        title="Đặt làm Avatar Nhà Gái"
                      >
                        Nhà Gái
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
