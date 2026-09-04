import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  type AlbumImage,
  type WeddingSlot,
  type AvatarCropConfig,
  FALLBACK_ALBUM,
  SLOT_LAYOUTS,
  WEDDING_SLOTS,
  weddingConfig,
} from "@/content/wedding";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic"]);

const ALBUM_DIR = path.join(process.cwd(), "public/images/album");
const BANNER_CONFIG_PATH = path.join(process.cwd(), "content/banner.json");
const SETTINGS_ALBUM_KEY = "album_config";

export interface LocalAlbumState {
  images: AlbumImage[];
  slots: Record<WeddingSlot, AlbumImage>;
  isFallback: boolean;
  bannerSrc: string;
  groomCrop?: AvatarCropConfig;
  brideCrop?: AvatarCropConfig;
}

export interface SavedSlotsConfig {
  bannerSrc?: string;
  openingSrc?: string;
  groomAvatarSrc?: string;
  brideAvatarSrc?: string;
  groomCrop?: AvatarCropConfig;
  brideCrop?: AvatarCropConfig;
  hiddenImages?: string[];
}

/**
 * Natural sort comparing filenames (e.g. 1.jpg, 2.jpg, 10.jpg).
 */
export function naturalCompare(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Đọc cấu hình các vị trí ảnh từ Supabase (bảng settings).
 */
async function fetchSlotsConfigFromSupabase(): Promise<SavedSlotsConfig | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", SETTINGS_ALBUM_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return null;
    }

    const val = data.value as Record<string, unknown>;
    return {
      bannerSrc: typeof val?.bannerSrc === "string" ? val.bannerSrc : undefined,
      openingSrc: typeof val?.openingSrc === "string" ? val.openingSrc : undefined,
      groomAvatarSrc: typeof val?.groomAvatarSrc === "string" ? val.groomAvatarSrc : undefined,
      brideAvatarSrc: typeof val?.brideAvatarSrc === "string" ? val.brideAvatarSrc : undefined,
      groomCrop: (val?.groomCrop as AvatarCropConfig) || undefined,
      brideCrop: (val?.brideCrop as AvatarCropConfig) || undefined,
      hiddenImages: Array.isArray(val?.hiddenImages) ? (val.hiddenImages as string[]) : [],
    };
  } catch (err) {
    console.error("Lỗi khi đọc cấu hình album từ Supabase:", err);
    return null;
  }
}

/**
 * Lưu cấu hình các vị trí ảnh vào Supabase (bảng settings).
 */
async function saveSlotsConfigToSupabase(config: SavedSlotsConfig): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: SETTINGS_ALBUM_KEY,
          value: {
            ...config,
            updatedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("Lỗi khi lưu cấu hình album lên Supabase:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Lỗi khi kết nối Supabase để lưu cấu hình:", err);
    return false;
  }
}

/**
 * Lưu cấu hình đồng thời lên Supabase và cập nhật file banner.json (nếu có thể).
 */
async function persistSlotsConfig(config: SavedSlotsConfig): Promise<void> {
  // 1. Lưu vào Supabase (nếu đã cấu hình)
  await saveSlotsConfigToSupabase(config);

  // 2. Cập nhật local file banner.json làm cache / offline fallback
  try {
    const dir = path.dirname(BANNER_CONFIG_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      BANNER_CONFIG_PATH,
      JSON.stringify({ ...config, updatedAt: new Date().toISOString() }, null, 2),
      "utf-8"
    );
  } catch {
    // Bỏ qua lỗi ghi file local nếu môi trường chỉ đọc
  }
}

/**
 * Lấy cấu hình các vị trí ảnh đã chọn (Banner, Avatar Nhà Trai, Avatar Nhà Gái, Crop, Danh sách ảnh ẩn).
 * Ưu tiên:
 * 1. Supabase (Bảng settings, key = 'album_config')
 * 2. File local (content/banner.json) cho môi trường offline / dev
 * 3. Fallback mặc định từ weddingConfig
 */
export async function getSavedSlotsConfig(): Promise<SavedSlotsConfig> {
  // 1. Thử lấy từ Supabase
  const remote = await fetchSlotsConfigFromSupabase();
  if (remote) {
    return {
      bannerSrc: remote.bannerSrc || weddingConfig.bannerImage || undefined,
      openingSrc: remote.openingSrc || undefined,
      groomAvatarSrc: remote.groomAvatarSrc || weddingConfig.family.groom.avatarImage || undefined,
      brideAvatarSrc: remote.brideAvatarSrc || weddingConfig.family.bride.avatarImage || undefined,
      groomCrop: remote.groomCrop || weddingConfig.family.groom.avatarCrop || { x: 50, y: 25, zoom: 1 },
      brideCrop: remote.brideCrop || weddingConfig.family.bride.avatarCrop || { x: 50, y: 25, zoom: 1 },
      hiddenImages: Array.isArray(remote.hiddenImages) ? remote.hiddenImages : [],
    };
  }

  // 2. Fallback sang file content/banner.json
  try {
    const raw = await fs.readFile(BANNER_CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw);
    return {
      bannerSrc: data?.bannerSrc || weddingConfig.bannerImage || undefined,
      openingSrc: data?.openingSrc || undefined,
      groomAvatarSrc: data?.groomAvatarSrc || weddingConfig.family.groom.avatarImage || undefined,
      brideAvatarSrc: data?.brideAvatarSrc || weddingConfig.family.bride.avatarImage || undefined,
      groomCrop: data?.groomCrop || weddingConfig.family.groom.avatarCrop || { x: 50, y: 25, zoom: 1 },
      brideCrop: data?.brideCrop || weddingConfig.family.bride.avatarCrop || { x: 50, y: 25, zoom: 1 },
      hiddenImages: Array.isArray(data?.hiddenImages) ? data.hiddenImages : [],
    };
  } catch {
    // 3. Fallback mặc định
    return {
      bannerSrc: weddingConfig.bannerImage || undefined,
      openingSrc: undefined,
      groomAvatarSrc: weddingConfig.family.groom.avatarImage || undefined,
      brideAvatarSrc: weddingConfig.family.bride.avatarImage || undefined,
      groomCrop: weddingConfig.family.groom.avatarCrop || { x: 50, y: 25, zoom: 1 },
      brideCrop: weddingConfig.family.bride.avatarCrop || { x: 50, y: 25, zoom: 1 },
      hiddenImages: [],
    };
  }
}


/**
 * Lấy đường dẫn ảnh Banner đã chọn.
 */
export async function getSavedBannerSrc(): Promise<string | null> {
  const config = await getSavedSlotsConfig();
  return config.bannerSrc || null;
}

/**
 * Lưu lựa chọn ảnh Banner vào Supabase & content/banner.json.
 */
export async function setSavedBannerSrc(src: string): Promise<void> {
  await setSavedSlotConfig("banner", src);
}

/**
 * Lưu vị trí ảnh (banner | opening | groom | bride).
 */
export async function setSavedSlotConfig(
  type: "banner" | "opening" | "groom" | "bride",
  src: string
): Promise<SavedSlotsConfig> {
  const current = await getSavedSlotsConfig();
  if (type === "banner") current.bannerSrc = src;
  if (type === "opening") current.openingSrc = src;
  if (type === "groom") current.groomAvatarSrc = src;
  if (type === "bride") current.brideAvatarSrc = src;

  await persistSlotsConfig(current);
  return current;
}

/**
 * Ẩn / Hiện một bức ảnh trong album công khai.
 */
export async function toggleImageVisibility(src: string): Promise<{ hiddenImages: string[]; isHidden: boolean }> {
  const current = await getSavedSlotsConfig();
  const hidden = new Set(current.hiddenImages || []);
  let isHidden = false;

  if (hidden.has(src)) {
    hidden.delete(src);
    isHidden = false;
  } else {
    hidden.add(src);
    isHidden = true;
  }

  current.hiddenImages = Array.from(hidden);
  await persistSlotsConfig(current);

  return { hiddenImages: current.hiddenImages, isHidden };
}

/**
 * Lưu vị trí căn chỉnh khuôn mặt (crop/position/zoom) cho Nhà Trai hoặc Nhà Gái.
 */
export async function setSavedCropConfig(
  side: "groom" | "bride",
  crop: AvatarCropConfig
): Promise<SavedSlotsConfig> {
  const current = await getSavedSlotsConfig();
  if (side === "groom") current.groomCrop = crop;
  if (side === "bride") current.brideCrop = crop;

  await persistSlotsConfig(current);
  return current;
}




/**
 * Quét toàn bộ file ảnh trong thư mục public/images/album/
 */
export async function scanLocalAlbumFiles(): Promise<AlbumImage[]> {
  try {
    await fs.mkdir(ALBUM_DIR, { recursive: true });
    const entries = await fs.readdir(ALBUM_DIR, { withFileTypes: true });

    const imageFiles = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        const base = path.parse(name).name.toLowerCase();
        if (base.startsWith("og-") || base.startsWith("banner") || base.startsWith(".")) return false;
        return SUPPORTED_EXTENSIONS.has(ext);
      })
      .sort(naturalCompare);

    if (imageFiles.length === 0) {
      return [];
    }

    const images: AlbumImage[] = await Promise.all(
      imageFiles.map(async (filename, index) => {
        const filePath = path.join(ALBUM_DIR, filename);
        const fileSrc = `/images/album/${filename}`;

        let width = 1200;
        let height = 800;

        try {
          const metadata = await sharp(filePath).metadata();
          if (metadata.width && metadata.height) {
            width = metadata.width;
            height = metadata.height;
          }
        } catch {
          // Sharp fallback nếu file không thể đọc metadata
        }

        const baseName = path.parse(filename).name.toLowerCase();
        const detectedSlot = (WEDDING_SLOTS as readonly string[]).includes(baseName)
          ? (baseName as WeddingSlot)
          : undefined;

        return {
          id: `local-${baseName}`,
          src: fileSrc,
          width,
          height,
          alt: `Ảnh cưới Quốc Huy & Hoài Thương - ${filename}`,
          tags: ["wedding-album", ...(detectedSlot ? [`wedding-slot-${detectedSlot}`] : [])],
          slot: detectedSlot,
          order: index + 1,
          layout: detectedSlot ? SLOT_LAYOUTS[detectedSlot] : "grid",
          source: "fallback",
        };
      })
    );

    return images;
  } catch (err) {
    console.error("Error scanning local album:", err);
    return [];
  }
}

/**
 * Lấy trạng thái album local hoàn chỉnh cho trang hiển thị:
 * - Banner: Lấy theo ảnh đã chọn hoặc hero.* trong folder
 * - Các ảnh dưới: Tự động quét và phân bổ vào album grid
 * - Tự động fallback về demo nếu folder album chưa có ảnh
 */
export async function getLocalAlbumState(): Promise<LocalAlbumState | null> {
  const localImages = await scanLocalAlbumFiles();
  const savedConfig = await getSavedSlotsConfig();

  if (localImages.length === 0) {
    return null;
  }

  // 1. Xác định ảnh banner
  let bannerImage: AlbumImage | undefined;
  if (savedConfig.bannerSrc) {
    bannerImage = localImages.find((img) => img.src === savedConfig.bannerSrc);
  }

  if (!bannerImage) {
    bannerImage =
      localImages.find((img) => img.slot === "hero") ||
      localImages.find((img) => path.parse(img.src).name.toLowerCase().startsWith("hero")) ||
      localImages[0];
  }

  const selectedForSlots = new Set<string>();
  if (bannerImage) {
    selectedForSlots.add(bannerImage.id);
  }

  // 2. Gán các slots nổi bật
  const slots = {} as Record<WeddingSlot, AlbumImage>;

  // Slot hero
  slots.hero = {
    ...bannerImage,
    slot: "hero",
    layout: "hero",
  };

  // Gán avatar Nhà Gái (portrait-one) nếu đã chọn riêng
  if (savedConfig.brideAvatarSrc) {
    const brideImg = localImages.find((img) => img.src === savedConfig.brideAvatarSrc);
    if (brideImg) {
      selectedForSlots.add(brideImg.id);
      slots["portrait-one"] = {
        ...brideImg,
        slot: "portrait-one",
        layout: SLOT_LAYOUTS["portrait-one"],
      };
    }
  }

  // Gán avatar Nhà Trai (portrait-two) nếu đã chọn riêng
  if (savedConfig.groomAvatarSrc) {
    const groomImg = localImages.find((img) => img.src === savedConfig.groomAvatarSrc);
    if (groomImg) {
      selectedForSlots.add(groomImg.id);
      slots["portrait-two"] = {
        ...groomImg,
        slot: "portrait-two",
        layout: SLOT_LAYOUTS["portrait-two"],
      };
    }
  }

  const unusedImages = () => localImages.filter((img) => !selectedForSlots.has(img.id));

  // Gán ảnh Mở Đầu Album (opening) - Luôn ưu tiên ảnh ngang (Landscape)
  if (savedConfig.openingSrc) {
    const openingImg = localImages.find((img) => img.src === savedConfig.openingSrc);
    if (openingImg) {
      selectedForSlots.add(openingImg.id);
      slots.opening = {
        ...openingImg,
        slot: "opening",
        layout: "wide",
      };
    }
  }

  if (!slots.opening) {
    const landscapeImg =
      unusedImages().find((img) => img.width > img.height) ||
      localImages.find((img) => img.width > img.height && img.id !== bannerImage?.id) ||
      localImages.find((img) => img.width > img.height);

    if (landscapeImg) {
      selectedForSlots.add(landscapeImg.id);
      slots.opening = {
        ...landscapeImg,
        slot: "opening",
        layout: "wide",
      };
    }
  }

  for (const slot of WEDDING_SLOTS) {
    if (slot === "hero") continue;
    if (slots[slot]) continue; // Đã được gán ở trên

    // Tìm ảnh có slot tương ứng hoặc tên trùng với slot
    const matching = unusedImages().find(
      (img) => img.slot === slot || path.parse(img.src).name.toLowerCase() === slot
    );


    if (matching) {
      selectedForSlots.add(matching.id);
      slots[slot] = {
        ...matching,
        slot,
        layout: SLOT_LAYOUTS[slot],
      };
      continue;
    }

    // Nếu còn ảnh chưa gán slot trong album local, lấy 1 ảnh
    const nextAvailable = unusedImages()[0];
    if (nextAvailable) {
      selectedForSlots.add(nextAvailable.id);
      slots[slot] = {
        ...nextAvailable,
        slot,
        layout: SLOT_LAYOUTS[slot],
      };
      continue;
    }

    // Nếu hết ảnh local, fallback sang ảnh demo
    const demoFallback = FALLBACK_ALBUM.find((candidate) => candidate.slot === slot) || FALLBACK_ALBUM[0];
    slots[slot] = demoFallback;
  }

  // Toàn bộ ảnh hiển thị trong album bên dưới (lọc bỏ các ảnh đã bị ẨN)
  const hiddenSet = new Set(savedConfig.hiddenImages || []);
  const visibleImages = localImages.filter((img) => !hiddenSet.has(img.src));

  const albumDisplayImages: AlbumImage[] = visibleImages.map((img, idx) => {
    const isSlot = Object.values(slots).find((s) => s.id === img.id);
    return {
      ...img,
      order: idx + 1,
      slot: isSlot?.slot,
      layout: isSlot?.layout || "grid",
    };
  });

  return {
    images: albumDisplayImages,
    slots,
    isFallback: false,
    bannerSrc: slots.hero.src,
    groomCrop: savedConfig.groomCrop,
    brideCrop: savedConfig.brideCrop,
  };
}


