/**
 * Shared wedding content and album contracts.
 *
 * Keep this module free of server-only imports. It is intentionally safe to
 * import from client components when only the types or static copy is needed.
 */

export const WEDDING_INSTANT = "2026-09-22T00:00:00+07:00";
export const WEDDING_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type WeddingSlot =
  | "hero"
  | "opening"
  | "portrait-one"
  | "portrait-two"
  | "detail-one"
  | "detail-two"
  | "closing";

export type AlbumSource = "local" | "fallback";

/** Layout hints used by the editorial gallery. */
export type AlbumLayout =
  | "hero"
  | "wide"
  | "portrait"
  | "detail"
  | "grid"
  | "closing"
  | (string & {});

export interface AlbumImage {
  /** Định danh duy nhất của ảnh. */
  id: string;
  /** Đường dẫn file ảnh (public URL). */
  src: string;
  width: number;
  height: number;
  alt: string;
  tags: string[];
  slot?: WeddingSlot;
  order: number;
  layout: AlbumLayout;
  source: AlbumSource;
  updatedAt?: string;
  blurDataURL?: string;

}

export interface WeddingSeo {
  title: string;
  description: string;
  siteUrl?: string;
  ogImage?: string;
}

export interface ParentInfo {
  father: string;
  mother: string;
}

export interface AvatarCropConfig {
  x: number; // 0 - 100 (%)
  y: number; // 0 - 100 (%)
  zoom: number; // 1 - 3 (scale multiplier)
}

export interface FamilySide {
  parents: ParentInfo;
  fullName: string;
  shortName: string;
  roleTitle: string;
  avatarSlot?: WeddingSlot;
  avatarImage?: string;
  avatarCrop?: AvatarCropConfig;
}



export interface FamilyConfig {
  groom: FamilySide;
  bride: FamilySide;
}

export type EventType = "wedding" | "reception" | "both";

export interface WeddingEvent {
  type: "wedding" | "reception";
  title: string;
  subTitle: string;
  badge: string;
  shortDate: string;
  locationCity: string;
  dateLabel: string;
  dateIso: string;
  timeLabel: string;
  lunarDate?: string;
  welcomeTime?: string;
  ceremonyTime?: string;
  venue: string;
  hall?: string;
  address: string;
  mapUrl?: string;
  mapEmbedUrl?: string;
  note?: string;
}


export interface BankAccount {
  name: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  qrUrl: string;
}

export interface MusicConfig {
  title: string;
  artist: string;
  src: string;
}

export interface GuestInfo {
  id?: string;
  code: string;
  name: string;
  salutation: string;
  eventType: EventType;
  side: "groom" | "bride";
  note?: string;
  viewCount?: number;
  lastViewedAt?: string;
}

export interface WeddingConfig {
  groom: string;
  bride: string;
  monogram: string;
  dateLabel: string;
  dateIso: string;
  timeZone: string;
  bannerImage?: string;

  seo: WeddingSeo;
  slots: readonly WeddingSlot[];
  family: FamilyConfig;
  events: {
    wedding: WeddingEvent;
    reception: WeddingEvent;
  };
  gift: BankAccount;
  thankYouMessage: {
    title: string;
    content: string;
  };
  music: MusicConfig;
}

export const WEDDING_SLOTS: readonly WeddingSlot[] = [
  "hero",
  "opening",
  "portrait-one",
  "portrait-two",
  "detail-one",
  "detail-two",
  "closing",
] as const;

export const ALBUM_SLOTS = WEDDING_SLOTS;

export const weddingConfig: WeddingConfig = {
  groom: "Quốc Huy",
  bride: "Hoài Thương",
  monogram: "H&T",
  dateLabel: "22.09.2026",
  bannerImage: "/og/og-banner.jpg",

  dateIso: WEDDING_INSTANT,

  timeZone: WEDDING_TIME_ZONE,
  seo: {
    title: "Thiệp Cưới Online | Quốc Huy & Hoài Thương",
    description: "Trân trọng kính mời Quý khách & Gia đình đến chung vui cùng Quốc Huy và Hoài Thương trong ngày hạnh phúc.",
    siteUrl: "https://wedding.quochuy.me",
    ogImage: "/og/og-banner.jpg",
  },
  slots: WEDDING_SLOTS,
  family: {
    groom: {
      parents: {
        father: "Ông Trần Thanh Hải",
        mother: "Bà Phan Thị Mỹ Trinh",
      },
      fullName: "Trần Quốc Huy",
      shortName: "Quốc Huy",
      roleTitle: "Trưởng Nam",
      avatarSlot: "portrait-two",
      avatarImage: undefined, // Ví dụ: "/images/album/TART1172.webp"
    },
    bride: {
      parents: {
        father: "Ông Lê Hùng Cường",
        mother: "Bà Nguyễn Thị Thúy Liễu",
      },
      fullName: "Lê Hoài Thương",
      shortName: "Hoài Thương",
      roleTitle: "Trưởng Nữ",
      avatarSlot: "portrait-one",
      avatarImage: undefined, // Ví dụ: "/images/album/TART1074.webp"
    },
  },

  events: {
    wedding: {
      type: "wedding",
      title: "Lễ Thành Hôn & Tiệc Cưới Tư Gia",
      subTitle: "Hôn lễ cử hành tại tư gia nhà trai",
      badge: "Lễ Cưới Tư Gia",
      shortDate: "22.09.2026",
      locationCity: "Tỉnh Vĩnh Long",
      dateLabel: "Thứ Ba, ngày 22 tháng 09 năm 2026",
      dateIso: "2026-09-22T11:00:00+07:00",
      timeLabel: "10:00",
      lunarDate: "Ngày 12 tháng 08 năm Bính Ngọ",
      venue: "Tư Gia Nhà Trai",
      address: "139 Ấp Hưng An Tây, Xã Hưng Nhượng, Tỉnh Vĩnh Long",
      mapUrl: "https://maps.google.com/?q=Hưng+Nhượng,+Tỉnh+Vĩnh+Long",
      note: "Sự hiện diện của Quý khách là niềm vinh hạnh lớn cho toàn thể gia đình chúng tôi.",
    },
    reception: {
      type: "reception",
      title: "Tiệc Mừng Báo Hỷ",
      subTitle: "Chung vui cùng bạn bè thân hữu",
      badge: "Tiệc Báo Hỷ",
      shortDate: "26.09.2026",
      locationCity: "TP. Hồ Chí Minh",
      dateLabel: "Thứ Bảy, ngày 26 tháng 09 năm 2026",
      dateIso: "2026-09-26T18:00:00+07:00",
      timeLabel: "18:00",
      lunarDate: "Ngày 16 tháng 08 năm Bính Ngọ",
      welcomeTime: "17:00 (Đón khách)",
      ceremonyTime: "19:00 (Khai tiệc)",
      venue: "Trung Tâm Tiệc Cưới Unique (Quận 7)",
      hall: "Sảnh Unique 2",
      address: "Số 06 Nguyễn Thị Thập, Phường Bình Thuận, Quận 7, TP. Hồ Chí Minh",
      mapUrl: "https://maps.app.goo.gl/u3QZnMCfDRUGvrox9",
      mapEmbedUrl: "https://maps.google.com/maps?q=06+Nguy%E1%BB%85n+Th%E1%BB%8B+Th%E1%BA%ADp,+B%C3%ACnh+Thu%E1%BA%ADn,+Qu%E1%BA%ADn+7,+TP+H%E1%BB%93+Ch%C3%AD+Minh&output=embed",
      note: "Hân hạnh được đón tiếp Quý bạn bè, đồng nghiệp và người thân thương chung vui buổi tiệc thân mật.",
    },

  },
  gift: {
    name: "TRAN QUOC HUY",
    bankName: "TPBank",
    bankCode: "TPB",
    accountNumber: "04216774601",
    qrUrl: "https://img.vietqr.io/image/TPB-04216774601-compact2.png?amount=0&addInfo=Mung%20cuoi%20Quoc%20Huy%20Hoai%20Thuong&accountName=TRAN%20QUOC%20HUY",
  },


  thankYouMessage: {
    title: "Lời Cảm Ơn Chân Thành",
    content:
      "Cảm ơn bạn đã luôn là một phần thật đẹp trong hành trình trưởng thành và câu chuyện tình yêu của chúng mình. Sự hiện diện, lời chúc phúc và tình cảm yêu thương của bạn chính là món quà quý giá nhất trong ngày trọng đại này!",
  },
  music: {
    title: "You Are The Reason",
    artist: "Calum Scott",
    src: "/music/YouAreTheReason.mp3",
  },
};

/** Upper-case alias for callers that prefer constants. */
export const WEDDING_CONFIG = weddingConfig;
/** Semantic alias for server and metadata code. */
export const WEDDING = weddingConfig;
export const wedding = weddingConfig;
export const weddingContent = weddingConfig;


export const SLOT_LABELS: Record<WeddingSlot, string> = {
  hero: "Ảnh bìa",
  opening: "Ảnh mở album",
  "portrait-one": "Ảnh chân dung một",
  "portrait-two": "Ảnh chân dung hai",
  "detail-one": "Ảnh chi tiết một",
  "detail-two": "Ảnh chi tiết hai",
  closing: "Ảnh kết album",
};

export const SLOT_LAYOUTS: Record<WeddingSlot, AlbumLayout> = {
  hero: "hero",
  opening: "wide",
  "portrait-one": "portrait",
  "portrait-two": "portrait",
  "detail-one": "detail",
  "detail-two": "detail",
  closing: "closing",
};

const fallbackDefinitions: Array<
  Pick<AlbumImage, "id" | "src" | "width" | "height" | "alt" | "slot" | "layout"> & {
    filename: string;
  }
> = [
    {
      id: "fallback-hero",
      filename: "hero.webp",
      src: "/images/demo/hero.webp",
      width: 1122,
      height: 1402,
      alt: "Ảnh minh họa cô dâu chú rể nhìn về phía chân trời",
      slot: "hero",
      layout: "hero",
    },
    {
      id: "fallback-opening",
      filename: "opening.webp",
      src: "/images/demo/opening.webp",
      width: 1536,
      height: 1024,
      alt: "Ảnh minh họa đôi uyên ương bước đi bên nhau",
      slot: "opening",
      layout: "wide",
    },
    {
      id: "fallback-portrait-one",
      filename: "portrait-one.webp",
      src: "/images/demo/portrait-one.webp",
      width: 1122,
      height: 1402,
      alt: "Ảnh minh họa chân dung cô dâu",
      slot: "portrait-one",
      layout: "portrait",
    },
    {
      id: "fallback-portrait-two",
      filename: "portrait-two.webp",
      src: "/images/demo/portrait-two.webp",
      width: 1122,
      height: 1402,
      alt: "Ảnh minh họa chân dung chú rể",
      slot: "portrait-two",
      layout: "portrait",
    },
    {
      id: "fallback-detail-one",
      filename: "detail-one.webp",
      src: "/images/demo/detail-one.webp",
      width: 1536,
      height: 1024,
      alt: "Ảnh minh họa bàn tay và nhẫn cưới",
      slot: "detail-one",
      layout: "detail",
    },
    {
      id: "fallback-detail-two",
      filename: "detail-two.webp",
      src: "/images/demo/detail-two.webp",
      width: 1122,
      height: 1402,
      alt: "Ảnh minh họa hoa cưới trong ánh nắng dịu",
      slot: "detail-two",
      layout: "detail",
    },
    {
      id: "fallback-closing",
      filename: "closing.webp",
      src: "/images/demo/closing.webp",
      width: 1536,
      height: 1024,
      alt: "Ảnh minh họa đôi uyên ương trong buổi chiều lặng",
      slot: "closing",
      layout: "closing",
    },
  ];

/**
 * Demo images keep the public page useful before ImageKit is configured.
 * The paths intentionally point at local generated assets and can be replaced
 * without changing any gallery component.
 */
export const FALLBACK_ALBUM: AlbumImage[] = fallbackDefinitions.map((image, index) => ({
  id: image.id,
  src: image.src,
  width: image.width,
  height: image.height,
  alt: image.alt,
  tags: ["wedding-album", `wedding-slot-${image.slot}`, "fallback"],
  slot: image.slot,
  order: index + 1,
  layout: image.layout,
  source: "fallback",
}));

export const fallbackAlbum = FALLBACK_ALBUM;

export function getWeddingConfig(): WeddingConfig {
  return weddingConfig;
}
