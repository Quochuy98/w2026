import type ImageKit from "@imagekit/nodejs";
import type { AlbumImage, WeddingSlot, AvatarCropConfig } from "../../content/wedding";

import {
  FALLBACK_ALBUM,
  SLOT_LAYOUTS,
  WEDDING_SLOTS,
  weddingConfig,
} from "../../content/wedding";
import { GENERATED_ALBUM } from "../../content/gallery.generated";
import {
  getImageKitConfig,
  IMAGEKIT_MAX_ALBUM_IMAGES,
  type ImageKitConfig,
} from "./config";
import { createImageKitClient } from "./client";
import { getAlbumImageSource } from "./url";
import { getLocalAlbumState } from "../local-album";

export const IMAGEKIT_CACHE_TTL_MS = 60_000;

/** The subset of ImageKit's file response used by the public album. */
export interface ImageKitAsset {
  fileId?: string;
  filePath?: string;
  url?: string;
  thumbnail?: string;
  name?: string;
  width?: number;
  height?: number;
  tags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
  fileType?: string;
  type?: string;
}

export interface ListImageKitAlbumOptions {
  config?: ImageKitConfig | null;
  limit?: number;
  forceRefresh?: boolean;
  /** Admin callers can opt into surfacing API failures instead of fallback. */
  throwOnError?: boolean;
  /** Injectable client for tests and local integrations. */
  client?: Pick<ImageKit, "assets">;
}

export interface PublicAlbumOptions extends ListImageKitAlbumOptions {
  fallback?: AlbumImage[];
}

export interface PublicAlbumState {
  images: AlbumImage[];
  slots: Record<WeddingSlot, AlbumImage>;
  isFallback: boolean;
  groomCrop?: AvatarCropConfig;
  brideCrop?: AvatarCropConfig;
}


const assetCache = new Map<string, { expiresAt: number; assets: ImageKitAsset[] }>();

function cacheKey(config: ImageKitConfig, limit: number): string {
  return `${config.urlEndpoint}|${config.folder}|${limit}`;
}

function naturalCompare(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function safeDimension(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) > 0 ? Math.round(value as number) : fallback;
}

function parseSlotTag(tag: string): WeddingSlot | undefined {
  const normalized = tag.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized.startsWith("wedding-slot-")) return undefined;
  const candidate = normalized.slice("wedding-slot-".length);
  return (WEDDING_SLOTS as readonly string[]).includes(candidate)
    ? (candidate as WeddingSlot)
    : undefined;
}

export function getSlotFromTags(tags: readonly string[] | null | undefined): WeddingSlot | undefined {
  for (const tag of tags ?? []) {
    const slot = parseSlotTag(tag);
    if (slot) return slot;
  }
  return undefined;
}

function defaultAlt(index: number, slot: WeddingSlot | undefined): string {
  if (slot) {
    const labels: Record<WeddingSlot, string> = {
      hero: "ảnh bìa",
      opening: "ảnh mở album",
      "portrait-one": "ảnh chân dung",
      "portrait-two": "ảnh chân dung",
      "detail-one": "ảnh chi tiết",
      "detail-two": "ảnh chi tiết",
      closing: "ảnh kết album",
    };
    return `Ảnh cưới Quốc Huy và Hoài Thương, ${labels[slot]}`;
  }
  return `Ảnh cưới Quốc Huy và Hoài Thương, ảnh ${index + 1}`;
}

function orderFromAsset(asset: ImageKitAsset, index: number): number {
  const name = asset.name || asset.filePath || "";
  const match = name.match(/(?:^|[^0-9])(\d{1,4})(?:[^0-9]|$)/);
  if (match) return Number(match[1]);
  return index + 1;
}

function assetIdentity(asset: ImageKitAsset, index: number): string {
  return asset.fileId || asset.filePath || asset.url || asset.name || `image-${index + 1}`;
}

/** Normalize one ImageKit API response into the UI-facing AlbumImage shape. */
export function normalizeImageKitAsset(
  asset: ImageKitAsset,
  index = 0,
  config = getImageKitConfig(),
): AlbumImage | null {
  const path = asset.filePath?.trim() || undefined;
  const url = asset.url?.trim() || undefined;
  const source = path || url;
  if (!source) return null;

  const tags = Array.from(
    new Set((asset.tags ?? []).map((tag) => tag.trim()).filter(Boolean)),
  );
  const slot = getSlotFromTags(tags);
  const width = safeDimension(asset.width, 1200);
  const height = safeDimension(asset.height, 1500);
  const id = assetIdentity(asset, index);
  const src = getAlbumImageSource({ src: url || path || "", url, path }, {}, config);

  return {
    id,
    src,
    url,
    path,
    thumbnail: asset.thumbnail,
    width,
    height,
    alt: defaultAlt(index, slot),
    tags,
    slot,
    order: orderFromAsset(asset, index),
    layout: slot ? SLOT_LAYOUTS[slot] : "grid",
    source: "imagekit",
    updatedAt: asset.updatedAt || asset.createdAt,
  };
}

/** Normalize and de-duplicate a list returned by ImageKit. */
export function normalizeImageKitAssets(
  assets: readonly ImageKitAsset[],
  config = getImageKitConfig(),
): AlbumImage[] {
  const byIdentity = new Map<string, AlbumImage>();

  assets.forEach((asset, index) => {
    if (asset.fileType && asset.fileType !== "image") return;
    const normalized = normalizeImageKitAsset(asset, index, config);
    if (!normalized) return;
    const existing = byIdentity.get(normalized.id);
    if (!existing || compareUpdatedAt(normalized.updatedAt, existing.updatedAt) > 0) {
      byIdentity.set(normalized.id, normalized);
    }
  });

  return [...byIdentity.values()].sort(compareAlbumOrder);
}

function compareUpdatedAt(left: string | undefined, right: string | undefined): number {
  const parsedLeft = left ? Date.parse(left) : Number.NaN;
  const parsedRight = right ? Date.parse(right) : Number.NaN;
  const leftTime = Number.isFinite(parsedLeft) ? parsedLeft : Number.NEGATIVE_INFINITY;
  const rightTime = Number.isFinite(parsedRight) ? parsedRight : Number.NEGATIVE_INFINITY;
  if (leftTime !== rightTime) return leftTime - rightTime;
  return 0;
}

function compareAlbumOrder(left: AlbumImage, right: AlbumImage): number {
  if (left.order !== right.order) return left.order - right.order;
  const nameOrder = naturalCompare(left.path || left.src, right.path || right.src);
  if (nameOrder !== 0) return nameOrder;
  return compareUpdatedAt(left.updatedAt, right.updatedAt);
}

function compareTaggedCandidates(left: AlbumImage, right: AlbumImage): number {
  const updated = compareUpdatedAt(right.updatedAt, left.updatedAt);
  if (updated !== 0) return updated;
  return compareAlbumOrder(left, right);
}

function compareAdditionalImages(left: AlbumImage, right: AlbumImage): number {
  const updated = compareUpdatedAt(left.updatedAt, right.updatedAt);
  if (updated !== 0) return updated;
  return compareAlbumOrder(left, right);
}

function imageKeys(image: Pick<AlbumImage, "id" | "src" | "url" | "path">): string[] {
  return [image.id, image.path, image.url, image.src].filter(
    (value): value is string => Boolean(value?.trim()),
  );
}

/**
 * Keep the numbered CLI manifest as the canonical first portion of the
 * album, then append assets uploaded later through the admin screen. Matching
 * by id, path, URL, or delivery source makes the merge resilient to an
 * ImageKit response that changes one of those identifiers.
 */
export function mergeManifestOrder(
  remote: readonly AlbumImage[],
  manifest: readonly AlbumImage[] = GENERATED_ALBUM,
): AlbumImage[] {
  // A manifest is ordering metadata, not an offline delivery cache. If
  // ImageKit is unavailable or the folder is empty, let the public resolver
  // select the local demo album instead of returning stale CDN URLs.
  if (remote.length === 0) return [];
  if (manifest.length === 0) return [...remote].sort(compareAlbumOrder);

  const remoteByKey = new Map<string, AlbumImage>();
  for (const image of remote) {
    for (const key of imageKeys(image)) {
      if (!remoteByKey.has(key)) remoteByKey.set(key, image);
    }
  }

  const usedRemote = new Set<string>();
  const ordered: AlbumImage[] = [];
  for (const entry of manifest) {
    const match = imageKeys(entry).map((key) => remoteByKey.get(key)).find(Boolean);
    // Do not surface stale manifest rows whose files no longer exist in
    // ImageKit. They would otherwise produce broken CDN images after a
    // replacement or manual Media Library cleanup.
    if (!match) continue;
    usedRemote.add(match.id);
    if (!ordered.some((candidate) => candidate.id === match.id)) ordered.push(match);
  }

  const extras = remote
    .filter((image) => !usedRemote.has(image.id) && !ordered.some((candidate) => candidate.id === image.id))
    .sort(compareAdditionalImages);

  return [...ordered, ...extras].map((image, index) => ({ ...image, order: index + 1 }));
}

function cloneForSlot(image: AlbumImage, slot: WeddingSlot): AlbumImage {
  return {
    ...image,
    slot,
    layout: SLOT_LAYOUTS[slot],
    tags: Array.from(new Set([...image.tags, `wedding-slot-${slot}`])),
  };
}

function cloneFallbackForSlot(fallback: readonly AlbumImage[], slot: WeddingSlot): AlbumImage | undefined {
  const image = fallback.find((candidate) => candidate.slot === slot);
  return image ? cloneForSlot(image, slot) : undefined;
}

/**
 * Assign seven editorial slots without repeating a highlighted image in the
 * remaining grid. Tagged assets win; duplicate tagged assets use the newest
 * `updatedAt` value. Missing slots are filled by unused assets, then fallback
 * demo images.
 */
export function resolveAlbumSlots(
  images: readonly AlbumImage[],
  fallback: readonly AlbumImage[] = FALLBACK_ALBUM,
): AlbumImage[] {
  const remote = images
    // Callers may provide lightweight test/adapter objects without a source;
    // only explicitly marked fallback entries should be excluded here.
    .filter((image) => image.source !== "fallback")
    .slice(0, IMAGEKIT_MAX_ALBUM_IMAGES)
    .sort(compareAlbumOrder);

  if (remote.length === 0) {
    const source = fallback.length ? fallback : GENERATED_ALBUM;
    return source.slice(0, IMAGEKIT_MAX_ALBUM_IMAGES).map((image, index) => ({
      ...image,
      order: index + 1,
    }));
  }

  const selected = new Set<string>();
  const result: AlbumImage[] = [];
  const unused = () => remote.filter((image) => !selected.has(image.id));

  for (const slot of WEDDING_SLOTS) {
    const tagged = remote
      .filter((image) => !selected.has(image.id) && image.slot === slot)
      .sort(compareTaggedCandidates);
    // Keep an asset tagged for another slot available for that slot. Prefer an
    // explicitly untagged image for a missing slot; tagged duplicates remain in
    // the ordinary grid rather than silently taking a different featured slot.
    const untagged = unused().filter((image) => !image.slot);
    const candidate = tagged[0] || untagged[0];
    if (candidate) {
      selected.add(candidate.id);
      result.push(cloneForSlot(candidate, slot));
      continue;
    }

    const fallbackImage = cloneFallbackForSlot(fallback, slot);
    if (fallbackImage) result.push(fallbackImage);
  }

  const grid = remote
    .filter((image) => !selected.has(image.id))
    .map((image) => ({ ...image, slot: undefined, layout: "grid" as const }));
  const combined = [...result, ...grid];
  return combined.map((image, index) => ({ ...image, order: index + 1 }));
}

/** Clear in-memory list cache, primarily useful in tests and admin previews. */
export function clearImageKitAlbumCache(): void {
  assetCache.clear();
}

/** List image assets under the configured wedding folder. */
export async function listImageKitAlbum(
  options: ListImageKitAlbumOptions = {},
): Promise<ImageKitAsset[]> {
  const config = options.config === undefined ? getImageKitConfig() : options.config;
  if (!config) return [];

  const limit = Math.min(
    IMAGEKIT_MAX_ALBUM_IMAGES,
    Math.max(1, Math.round(options.limit ?? IMAGEKIT_MAX_ALBUM_IMAGES)),
  );
  const key = cacheKey(config, limit);
  const cached = assetCache.get(key);
  if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) return cached.assets;

  try {
    const client = options.client || createImageKitClient(config);
    const response = await client.assets.list({
      type: "file",
      fileType: "image",
      path: config.folder,
      limit,
      sort: "ASC_NAME",
    });
    const assets = Array.isArray(response) ? (response as ImageKitAsset[]) : [];
    assetCache.set(key, { assets, expiresAt: Date.now() + IMAGEKIT_CACHE_TTL_MS });
    return assets;
  } catch (error) {
    // A transient ImageKit outage should not take down the wedding page.
    if (options.throwOnError) throw error;
    return [];
  }
}

/**
 * Public server-facing contract used by the landing page. It always resolves
 * to a renderable album, even with missing credentials or a failed API call.
 */
export async function getPublicAlbum(options: PublicAlbumOptions = {}): Promise<AlbumImage[]> {
  try {
    const local = await getLocalAlbumState();
    if (local && local.images.length > 0) {
      return local.images;
    }
  } catch {
    // Fallback nếu có lỗi đọc thư mục local
  }

  const fallback = options.fallback?.length ? options.fallback : FALLBACK_ALBUM;
  const config = options.config === undefined ? getImageKitConfig() : options.config;
  const assets = await listImageKitAlbum({ ...options, config });
  const normalized = normalizeImageKitAssets(assets, config);
  const ordered = mergeManifestOrder(normalized);
  return resolveAlbumSlots(ordered, fallback);
}

/** Object-shaped variant for admin/layout callers that need slot lookup. */
export async function getPublicAlbumState(options: PublicAlbumOptions = {}): Promise<PublicAlbumState> {
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

  const images = await getPublicAlbum(options);
  const fallback = options.fallback?.length ? options.fallback : FALLBACK_ALBUM;
  const slots = Object.fromEntries(
    WEDDING_SLOTS.map((slot) => [
      slot,
      images.find((image) => image.slot === slot) || fallback.find((image) => image.slot === slot) || fallback[0],
    ]),
  ) as Record<WeddingSlot, AlbumImage>;
  return {
    images,
    slots,
    isFallback: images.some((image) => image.source === "fallback"),
  };
}

export const getAlbum = getPublicAlbum;
export const getAlbumState = getPublicAlbumState;
export const listAlbumAssets = listImageKitAlbum;
export const resolveGallerySlots = resolveAlbumSlots;

export default getPublicAlbum;

