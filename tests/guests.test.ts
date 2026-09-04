import { describe, expect, it } from "vitest";
import {
  getGuestByCode,
  createGuest,
  updateGuest,
  deleteGuest,
  generateGuestCode,
  generateUniqueGuestCode,
  FALLBACK_GUESTS,
} from "@/lib/guests";
import { ALL_NATURE_CODES } from "@/lib/nature-codes";
import { getWeddingEvent } from "@/content/wedding";

describe("Guests Data & Invitation Logic", () => {
  it("tra cứu khách mời mặc định theo mã 232388 thành công", async () => {
    const guest = await getGuestByCode("232388");
    expect(guest).not.toBeNull();
    expect(guest?.name).toBe("Nam & Bạn Gái");
    expect(guest?.salutation).toBe("Anh");
    expect(guest?.eventType).toBe("reception");

  });

  it("tra cứu khách mời theo mã không phân biệt hoa thường và khoảng trắng", async () => {
    const guest = await getGuestByCode("  232388  ");
    expect(guest).not.toBeNull();
    expect(guest?.code).toBe("232388");
  });

  it("trả về null nếu mã khách mời không tồn tại", async () => {
    const guest = await getGuestByCode("ma-khong-ton-tai-9999");
    expect(guest).toBeNull();
  });

  it("hàm generateGuestCode tạo ra mã tên thiên nhiên tiếng Anh hợp lệ", () => {
    const code = generateGuestCode();
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(2);
    expect(code).toMatch(/^[a-z]+(-[a-z0-9]+)*$/);
  });

  it("generateUniqueGuestCode không bao giờ chọn mã đã tồn tại", () => {
    const existing = new Set(["rose", "swan", "lotus"]);
    for (let i = 0; i < 50; i++) {
      const code = generateUniqueGuestCode(existing);
      expect(existing.has(code)).toBe(false);
    }
  });

  it("generateUniqueGuestCode tự động thêm hậu tố số khi tất cả từ đơn đã được dùng", () => {
    const allUsed = new Set(ALL_NATURE_CODES.map((c: string) => c.toLowerCase()));
    const code = generateUniqueGuestCode(allUsed);
    expect(code).toMatch(/^[a-z]+-\d{2}$/);
  });

  it("tạo mới và xóa khách mời thành công trong fallback mode", async () => {
    const newGuestCode = "test-guest-code";
    const result = await createGuest({
      code: newGuestCode,
      name: "Nguyễn Văn A",
      salutation: "Anh",
      eventType: "wedding",
      side: "groom",
      note: "Khách test",
    });

    expect(result.success).toBe(true);
    expect(result.guest?.code).toBe(newGuestCode);

    const fetched = await getGuestByCode(newGuestCode);
    expect(fetched?.name).toBe("Nguyễn Văn A");

    const deleted = await deleteGuest(newGuestCode);
    expect(deleted).toBe(true);

    const fetchedAfterDelete = await getGuestByCode(newGuestCode);
    expect(fetchedAfterDelete).toBeNull();
  });

  it("tra cứu khách mời mời cả 2 sự kiện (both) thành công", async () => {
    const guest = await getGuestByCode("ca-hai");
    expect(guest).not.toBeNull();
    expect(guest?.eventType).toBe("both");
    expect(guest?.name).toBe("Chú Năm & Thím Năm");
  });

  it("tạo khách mời với eventType='both' thành công", async () => {
    const code = "test-both-event";
    const res = await createGuest({
      code,
      name: "Khách Mời Cả Hai Sự Kiện",
      salutation: "Chị",
      eventType: "both",
      side: "bride",
    });
    expect(res.success).toBe(true);
    expect(res.guest?.eventType).toBe("both");

    const fetched = await getGuestByCode(code);
    expect(fetched?.eventType).toBe("both");

    await deleteGuest(code);
  });

  it("trả về thông tin Lễ Vu Quy (Nhà Gái - 21/09/2026 tại Ấp Tân Thị, Xã Tân Hào) khi side='bride'", () => {
    const brideEvent = getWeddingEvent("bride");
    expect(brideEvent.badge).toBe("Lễ Vu Quy");
    expect(brideEvent.venue).toBe("Tư Gia Nhà Gái");
    expect(brideEvent.shortDate).toBe("21.09.2026");
    expect(brideEvent.dateLabel).toContain("Thứ Hai, ngày 21 tháng 09 năm 2026");
    expect(brideEvent.timeLabel).toBe("14:00");
    expect(brideEvent.dateIso).toContain("14:00:00");
    expect(brideEvent.lunarDate).toContain("11 tháng 08");
    expect(brideEvent.address).toContain("Ấp Tân Thị, Xã Tân Hào, Tỉnh Vĩnh Long");
  });

  it("trả về thông tin Lễ Thành Hôn (Nhà Trai - 22/09/2026 tại Ấp Hưng An Tây) khi side='groom' hoặc không truyền", () => {
    const groomEvent = getWeddingEvent("groom");
    expect(groomEvent.badge).toBe("Lễ Thành Hôn");
    expect(groomEvent.venue).toBe("Tư Gia Nhà Trai");
    expect(groomEvent.shortDate).toBe("22.09.2026");
    expect(groomEvent.dateLabel).toContain("Thứ Ba, ngày 22 tháng 09 năm 2026");
    expect(groomEvent.lunarDate).toContain("12 tháng 08");
    expect(groomEvent.address).toContain("Hưng An Tây");

    const defaultEvent = getWeddingEvent();
    expect(defaultEvent.venue).toBe("Tư Gia Nhà Trai");
    expect(defaultEvent.shortDate).toBe("22.09.2026");
  });

  it("cập nhật thông tin khách mời thành công và giữ nguyên mã code", async () => {
    const editCode = "test-edit-guest";
    // Tạo khách ban đầu
    const created = await createGuest({
      code: editCode,
      name: "Khách Cũ",
      salutation: "Bạn",
      eventType: "wedding",
      side: "groom",
      note: "Ghi chú ban đầu",
    });
    expect(created.success).toBe(true);

    // Chỉnh sửa sang thông tin mới (đổi tên, danh xưng, sự kiện, nhà gái, ghi chú)
    const updateResult = await updateGuest(editCode, {
      name: "Khách Đã Sửa",
      salutation: "Anh",
      eventType: "reception",
      side: "bride",
      note: "Ghi chú đã cập nhật",
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.guest?.code).toBe(editCode);
    expect(updateResult.guest?.name).toBe("Khách Đã Sửa");
    expect(updateResult.guest?.salutation).toBe("Anh");
    expect(updateResult.guest?.eventType).toBe("reception");
    expect(updateResult.guest?.side).toBe("bride");
    expect(updateResult.guest?.note).toBe("Ghi chú đã cập nhật");

    // Kiểm tra tra cứu lại bằng getGuestByCode
    const fetched = await getGuestByCode(editCode);
    expect(fetched?.name).toBe("Khách Đã Sửa");
    expect(fetched?.side).toBe("bride");
    expect(fetched?.eventType).toBe("reception");

    // Dọn dẹp
    await deleteGuest(editCode);
  });

  it("cập nhật khách mời không tồn tại trả về lỗi", async () => {
    const result = await updateGuest("ma-khong-ton-tai-12345", {
      name: "Tên Mới",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Không tìm thấy");
  });
});

