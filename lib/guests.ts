import { type GuestInfo, type EventType } from "@/content/wedding";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import { ALL_NATURE_CODES, getRandomNatureCode } from "./nature-codes";

/**
 * Fallback mock guests for offline testing or when Supabase is not configured yet.
 */
export const FALLBACK_GUESTS: Record<string, GuestInfo> = {
  "232388": {
    code: "232388",
    name: "Nam & Bạn Gái",
    salutation: "Anh",
    eventType: "reception",
    side: "groom",
    note: "Bạn thân thời đại học - Tiệc báo hỷ",
    viewCount: 1,
  },
  "tu-gia": {
    code: "tu-gia",
    name: "Bác Hai & Gia Đình",
    salutation: "Gia đình",
    eventType: "wedding",
    side: "groom",
    note: "Khách nhà trai - Lễ cưới tư gia",
    viewCount: 1,
  },
  "bao-hy": {
    code: "bao-hy",
    name: "Hoàng Yến & Đồng Nghiệp",
    salutation: "Bạn",
    eventType: "reception",
    side: "bride",
    note: "Khách nhà gái - Tiệc mừng báo hỷ",
    viewCount: 1,
  },
  "ca-hai": {
    code: "ca-hai",
    name: "Chú Năm & Thím Năm",
    salutation: "Gia đình",
    eventType: "both",
    side: "groom",
    note: "Khách VIP - Tham dự cả 2 sự kiện",
    viewCount: 1,
  },
};


/**
 * Tra cứu thông tin khách mời theo mã code.
 */
export async function getGuestByCode(code: string): Promise<GuestInfo | null> {
  const cleanCode = code.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    return FALLBACK_GUESTS[cleanCode] || null;
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return FALLBACK_GUESTS[cleanCode] || null;

    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_GUESTS[cleanCode] || null;
    }

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      salutation: data.salutation,
      eventType: (data.event_type as EventType) || "wedding",
      side: (data.side as "groom" | "bride") || "groom",
      note: data.note,
      viewCount: data.view_count,
      lastViewedAt: data.last_viewed_at,
    };

  } catch (err) {
    console.error("Error fetching guest from Supabase:", err);
    return FALLBACK_GUESTS[cleanCode] || null;
  }
}

/**
 * Cập nhật số lần xem thiệp khi khách mở link.
 */
export async function incrementGuestView(code: string): Promise<void> {
  const cleanCode = code.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    if (FALLBACK_GUESTS[cleanCode]) {
      FALLBACK_GUESTS[cleanCode].viewCount = (FALLBACK_GUESTS[cleanCode].viewCount || 0) + 1;
      FALLBACK_GUESTS[cleanCode].lastViewedAt = new Date().toISOString();
    }
    return;
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return;

    // Supabase RPC or direct increment
    const { data: current } = await supabase
      .from("guests")
      .select("view_count")
      .eq("code", cleanCode)
      .maybeSingle();

    const currentCount = current?.view_count || 0;
    await supabase
      .from("guests")
      .update({
        view_count: currentCount + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("code", cleanCode);
  } catch (err) {
    console.error("Error updating guest view count:", err);
  }
}

/**
 * Lấy toàn bộ danh sách khách mời (cho Admin).
 */
export async function listAllGuests(): Promise<GuestInfo[]> {
  if (!isSupabaseConfigured()) {
    return Object.values(FALLBACK_GUESTS);
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return Object.values(FALLBACK_GUESTS);

    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return Object.values(FALLBACK_GUESTS);
    }

    return data.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      salutation: d.salutation,
      eventType: (d.event_type as EventType) || "wedding",
      side: (d.side as "groom" | "bride") || "groom",
      note: d.note,
      viewCount: d.view_count,
      lastViewedAt: d.last_viewed_at,
    }));
  } catch (err) {
    console.error("Error listing guests:", err);
    return Object.values(FALLBACK_GUESTS);
  }
}

/**
 * Tự động tạo mã mời ngẫu nhiên từ danh sách tên thiên nhiên.
 * Ưu tiên chọn từ chưa dùng trong danh sách existingCodes.
 * Nếu đã dùng hết toàn bộ từ đơn (>= 84 khách), tự động thêm hậu tố số ngẫu nhiên.
 */
export function generateUniqueGuestCode(existingCodes: Set<string>): string {
  const unusedCodes = ALL_NATURE_CODES.filter((c) => !existingCodes.has(c.toLowerCase()));

  if (unusedCodes.length > 0) {
    const randomIndex = Math.floor(Math.random() * unusedCodes.length);
    return unusedCodes[randomIndex];
  }

  // Nếu đã dùng hết từ đơn, thêm hậu tố số 2 chữ số (VD: swan-26)
  return getRandomNatureCode(true);
}

/**
 * Thêm mới khách mời (cho Admin).
 */
export async function createGuest(
  guest: Omit<GuestInfo, "id" | "viewCount" | "lastViewedAt">
): Promise<{ success: boolean; guest?: GuestInfo; error?: string }> {
  const isCustomCode = Boolean(guest.code && guest.code.trim());
  const providedCode = (guest.code || "").trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    const existing = new Set(Object.keys(FALLBACK_GUESTS));
    const code = isCustomCode ? providedCode : generateUniqueGuestCode(existing);

    if (FALLBACK_GUESTS[code]) {
      return { success: false, error: `Mã mời "${code}" đã tồn tại, vui lòng chọn mã khác.` };
    }

    const newGuest: GuestInfo = {
      ...guest,
      code,
      viewCount: 0,
    };
    FALLBACK_GUESTS[code] = newGuest;
    return { success: true, guest: newGuest };
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase client not available");

    // 1. Trường hợp người dùng chủ động chỉ định mã tùy chọn:
    if (isCustomCode) {
      const { data, error } = await supabase
        .from("guests")
        .insert({
          code: providedCode,
          name: guest.name.trim(),
          salutation: guest.salutation || "Bạn",
          event_type: guest.eventType || "wedding",
          side: guest.side || "groom",
          note: guest.note || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: `Mã mời "${providedCode}" đã được sử dụng, vui lòng chọn mã khác.` };
        }
        return { success: false, error: error.message };
      }

      return {
        success: true,
        guest: {
          id: data.id,
          code: data.code,
          name: data.name,
          salutation: data.salutation,
          eventType: data.event_type as EventType,
          side: data.side as "groom" | "bride",
          note: data.note,
          viewCount: data.view_count,
          lastViewedAt: data.last_viewed_at,
        },
      };
    }

    // 2. Trường hợp hệ thống tự động sinh mã (để trống mã mời tùy chọn):
    // Lấy toàn bộ mã đang có trong database để lọc ra các mã CHƯA DÙNG
    const { data: existingList } = await supabase.from("guests").select("code");
    const existingCodes = new Set((existingList || []).map((row) => row.code.toLowerCase()));

    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const autoCode = generateUniqueGuestCode(existingCodes);
      existingCodes.add(autoCode); // Đánh dấu để lần lặp sau không chọn lại nếu có race condition

      const { data, error } = await supabase
        .from("guests")
        .insert({
          code: autoCode,
          name: guest.name.trim(),
          salutation: guest.salutation || "Bạn",
          event_type: guest.eventType || "wedding",
          side: guest.side || "groom",
          note: guest.note || null,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          success: true,
          guest: {
            id: data.id,
            code: data.code,
            name: data.name,
            salutation: data.salutation,
            eventType: data.event_type as EventType,
            side: data.side as "groom" | "bride",
            note: data.note,
            viewCount: data.view_count,
            lastViewedAt: data.last_viewed_at,
          },
        };
      }

      // Nếu gặp lỗi khác không phải trùng mã (23505), dừng ngay
      if (error && error.code !== "23505") {
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: "Không thể tạo mã mời tự động không trùng lặp. Vui lòng thử lại." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối cơ sở dữ liệu";
    return { success: false, error: message };
  }
}

/**
 * Xóa khách mời (cho Admin).
 */
export async function deleteGuest(code: string): Promise<boolean> {
  const cleanCode = code.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    delete FALLBACK_GUESTS[cleanCode];
    return true;
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return false;

    const { error } = await supabase.from("guests").delete().eq("code", cleanCode);
    return !error;
  } catch (err) {
    console.error("Error deleting guest:", err);
    return false;
  }
}

/**
 * Tự động tạo mã mời ngẫu nhiên theo tên các loài hoa, cá, chim, cây.
 */
export function generateGuestCode(): string {
  return getRandomNatureCode();
}
