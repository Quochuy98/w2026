import { describe, expect, it } from "vitest";
import {
  getGuestByCode,
  createGuest,
  deleteGuest,
  generateGuestCode,
  FALLBACK_GUESTS,
} from "@/lib/guests";

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
});
