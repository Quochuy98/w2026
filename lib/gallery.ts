import { getLocalAlbumState } from "./local-album";
import {
  FALLBACK_ALBUM,
  WEDDING_SLOTS,
  type AlbumImage,
  type WeddingSlot,
  type AvatarCropConfig,
} from "@/content/wedding";

export interface PublicAlbumState {
  images: AlbumImage[];
  slots: Record<WeddingSlot, AlbumImage>;
  isFallback: boolean;
  groomCrop?: AvatarCropConfig;
  brideCrop?: AvatarCropConfig;
}

/**
 * Trả về danh sách ảnh album hiển thị trên website công khai.
 * Tự động ưu tiên ảnh trong thư mục public/images/album/ (đã lọc ảnh ẩn)
 * và fallback về bộ ảnh minh họa nếu thư mục album trống.
 */
export async function getPublicAlbumState(): Promise<PublicAlbumState> {
  try {
    const local = await getLocalAlbumState();
    if (local && local.images.length > 0) {
      return {
        images: local.images,
        slots: local.slots,
        isFallback: false,
        groomCrop: local.groomCrop,
        brideCrop: local.brideCrop,
      };
    }
  } catch {
    // Fallback nếu có lỗi đọc thư mục local
  }

  const slots = Object.fromEntries(
    WEDDING_SLOTS.map((slot) => [
      slot,
      FALLBACK_ALBUM.find((image) => image.slot === slot) || FALLBACK_ALBUM[0],
    ])
  ) as Record<WeddingSlot, AlbumImage>;

  return {
    images: FALLBACK_ALBUM,
    slots,
    isFallback: true,
  };
}

export async function getPublicAlbum(): Promise<AlbumImage[]> {
  const state = await getPublicAlbumState();
  return state.images;
}

export {
  getLocalAlbumState,
  scanLocalAlbumFiles,
  getSavedBannerSrc,
  setSavedBannerSrc,
  getSavedSlotsConfig,
  setSavedSlotConfig,
  toggleImageVisibility,
  setSavedCropConfig,
} from "./local-album";

export type { LocalAlbumState, SavedSlotsConfig } from "./local-album";
export type { AlbumImage, AlbumLayout, AlbumSource, WeddingSlot, AvatarCropConfig } from "@/content/wedding";
