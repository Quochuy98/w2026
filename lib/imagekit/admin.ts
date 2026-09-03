import "server-only";

import { clearImageKitAlbumCache, listImageKitAlbum, normalizeImageKitAssets } from "./gallery";
import { createImageKitClient } from "./client";
import { getImageKitConfig } from "./config";
import { WEDDING_SLOTS, type AlbumImage, type WeddingSlot } from "@/content/wedding";

const SLOT_TAG_PREFIX = "wedding-slot-";

function isSlotTag(tag: string) {
  return tag.toLowerCase().startsWith(SLOT_TAG_PREFIX);
}

function tagsWithoutSlots(tags: readonly string[]) {
  return tags.filter((tag) => !isSlotTag(tag));
}

export interface AdminAlbumState {
  configured: boolean;
  images: AlbumImage[];
  error?: string;
}

export async function getAdminAlbum(): Promise<AdminAlbumState> {
  const config = getImageKitConfig();
  if (!config) return { configured: false, images: [] };

  try {
    const raw = await listImageKitAlbum({ config, forceRefresh: true, throwOnError: true });
    return { configured: true, images: normalizeImageKitAssets(raw, config) };
  } catch {
    return { configured: true, images: [], error: "Không thể đọc Media Library lúc này." };
  }
}

export async function assignAlbumSlot(fileId: string | null, slot: WeddingSlot): Promise<void> {
  const config = getImageKitConfig();
  if (!config) throw new Error("ImageKit chưa được cấu hình.");
  if (!(WEDDING_SLOTS as readonly string[]).includes(slot)) throw new Error("Vị trí ảnh không hợp lệ.");

  const client = createImageKitClient(config);
  const raw = await listImageKitAlbum({ config, forceRefresh: true });
  const normalized = normalizeImageKitAssets(raw, config);
  const target = fileId ? normalized.find((image) => image.id === fileId) : undefined;

  if (fileId && !target) throw new Error("Không tìm thấy ảnh được chọn.");

  const previous = normalized.filter((image) => image.slot === slot && image.id !== fileId);
  for (const image of previous) {
    await client.files.update(image.id, { tags: tagsWithoutSlots(image.tags) });
  }

  if (target) {
    // A file represents one editorial slot at a time. Remove any previous
    // slot tag before adding the new one, otherwise ImageKit can return the
    // same file for two slots and tag order would decide the winner.
    const targetTags = tagsWithoutSlots(target.tags);
    await client.files.update(target.id, {
      tags: [...targetTags, `${SLOT_TAG_PREFIX}${slot}`],
    });
  }

  clearImageKitAlbumCache();
}

export async function refreshPublicAlbum(): Promise<void> {
  clearImageKitAlbumCache();
}
