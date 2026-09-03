import { expect, test, type Page } from "@playwright/test";

async function openPublicPage(page: Page, path = "/") {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator('section[aria-labelledby="countdown-title"] [aria-live="polite"] .font-display').first()).not.toHaveText("--");
}


async function openFirstGalleryImage(page: Page) {
  const firstImage = page.getByRole("button", { name: /^Mở / }).first();
  await expect(firstImage).toBeVisible();
  await firstImage.focus();
  await firstImage.press("Enter");
  return firstImage;
}

test.describe("wedding landing", () => {
  test("renders a bright full-bleed wedding hero and keeps its CTA visible", async ({ page }) => {
    await openPublicPage(page);

    await expect(page.getByRole("heading", { level: 1, name: /Quốc Huy.*Hoài Thương/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem Album ảnh" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Cùng đếm ngược đến ngày cưới" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Thông Tin Tiệc Cưới" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Hộp Mừng Cưới" })).toBeVisible();

    // Default without guest shows both locations and dates in Hero
    const hero = page.locator("#top");
    await expect(hero.getByText(/22\.09\.2026/i).first()).toBeVisible();
    await expect(hero.getByText(/Tỉnh Vĩnh Long/i).first()).toBeVisible();
    await expect(hero.getByText(/26\.09\.2026/i).first()).toBeVisible();
    await expect(hero.getByText(/TP\. Hồ Chí Minh/i).first()).toBeVisible();
    await expect(hero.getByRole("img", { name: "Ảnh minh họa cô dâu chú rể nhìn về phía chân trời" })).toBeVisible();
  });

  test("renders reception-only event for guest link /232388", async ({ page }) => {
    await openPublicPage(page, "/232388");

    const hero = page.locator("#top");
    await expect(hero.getByText(/Thiệp Mời Cá Nhân Hóa/i)).toBeVisible();
    await expect(hero.getByText(/Nam & Bạn Gái/i)).toBeVisible();
    await expect(hero.getByText(/26\.09\.2026/i).first()).toBeVisible();
    await expect(hero.getByText(/TP\. Hồ Chí Minh/i).first()).toBeVisible();
    await expect(hero.getByText(/Tỉnh Vĩnh Long/i)).toHaveCount(0);

    await expect(page.getByText(/Unique/i).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: /Lễ Thành Hôn/i })).toHaveCount(0);
  });

  test("renders wedding-only event for /tu-gia", async ({ page }) => {
    await openPublicPage(page, "/tu-gia");

    const hero = page.locator("#top");
    await expect(hero.getByText(/Bác Hai & Gia Đình/i)).toBeVisible();
    await expect(hero.getByText(/22\.09\.2026/i).first()).toBeVisible();
    await expect(hero.getByText(/Tỉnh Vĩnh Long/i).first()).toBeVisible();
    await expect(hero.getByText(/TP\. Hồ Chí Minh/i)).toHaveCount(0);

    await expect(page.getByText(/Tư Gia Nhà Trai/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tiệc Mừng Báo Hỷ/i })).toHaveCount(0);
  });

  test("renders both events for guest link /ca-hai", async ({ page }) => {
    await openPublicPage(page, "/ca-hai");

    const hero = page.locator("#top");
    await expect(hero.getByText(/Thiệp Mời Cá Nhân Hóa/i)).toBeVisible();
    await expect(hero.getByText(/Chú Năm & Thím Năm/i)).toBeVisible();
    // Both locations should be visible in Hero
    await expect(hero.getByText(/Tỉnh Vĩnh Long/i).first()).toBeVisible();
    await expect(hero.getByText(/TP\. Hồ Chí Minh/i).first()).toBeVisible();

    // Both event cards should be visible in EventDetails
    await expect(page.getByRole("heading", { name: /Lễ Thành Hôn/i })).toBeVisible();
    await expect(page.getByText(/Unique/i).first()).toBeVisible();
  });


  test("interacts with red wedding gift box to reveal QR code and account number", async ({ page }) => {
    await openPublicPage(page, "/#gifts");

    const giftBox = page.locator("#gifts");
    await expect(giftBox.getByText(/Mừng Hạnh Phúc Đôi Uyên Ương/i)).toBeVisible();

    // Click on the red gift box to open QR
    await giftBox.getByText(/Mở Hộp Mừng & Quét Mã QR/i).click();

    // QR & Bank details should become visible
    await expect(giftBox.getByText(/Quét Mã VietQR Chuyển Khoản/i)).toBeVisible();
    await expect(giftBox.getByText(/04216774601/i)).toBeVisible();
    await expect(giftBox.getByRole("button", { name: /Sao chép số tài khoản/i })).toBeVisible();

  });




  test("keeps mobile layout from overflowing and the CTA anchors to the album", async ({ page }) => {
    await openPublicPage(page);

    await expect(page.getByRole("link", { name: "Xem Album ảnh" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem Album ảnh" })).toBeInViewport();
    await page.getByRole("link", { name: "Xem Album ảnh" }).click();

    await expect(page).toHaveURL(/#album$/);

    const overflow = await page.evaluate(() => ({
      html: document.documentElement.scrollWidth <= window.innerWidth,
      body: document.body.scrollWidth <= window.innerWidth,
    }));

    expect(overflow.html).toBe(true);
    expect(overflow.body).toBe(true);
  });

  test("opens the lightbox, navigates, traps focus, and restores focus on close", async ({ page }) => {
    await openPublicPage(page, "/#album");

    const firstImage = await openFirstGalleryImage(page);
    const dialog = page.getByRole("dialog", { name: "Xem ảnh cưới" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "Ảnh minh họa đôi uyên ương bước đi bên nhau" })).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(dialog.locator("button:focus")).toHaveCount(1);

    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByRole("img", { name: "Ảnh minh họa chân dung cô dâu" })).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByRole("img", { name: "Ảnh minh họa đôi uyên ương bước đi bên nhau" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(firstImage).toBeFocused();
  });

  test("supports swipe navigation on mobile", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile", "swipe behavior is exercised in the mobile project");
    await openPublicPage(page, "/#album");

    await openFirstGalleryImage(page);
    const dialog = page.getByRole("dialog", { name: "Xem ảnh cưới" });
    await expect(dialog).toBeVisible();

    await dialog.evaluate((node) => {
      const start = new Event("touchstart", { bubbles: true, cancelable: true });
      Object.defineProperty(start, "touches", {
        value: [{ clientX: 320, clientY: 240 }],
      });
      node.dispatchEvent(start);

      const end = new Event("touchend", { bubbles: true, cancelable: true });
      Object.defineProperty(end, "changedTouches", {
        value: [{ clientX: 180, clientY: 240 }],
      });
      node.dispatchEvent(end);
    });

    await expect(dialog.getByRole("img", { name: "Ảnh minh họa chân dung cô dâu" })).toBeVisible();
  });

  test("keeps the light palette when the device prefers dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Xem Album ảnh" })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 247, 248)");
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    const firstReveal = page.locator('[data-reveal="true"]').first();
    await expect(firstReveal).toHaveCSS("opacity", "1");
    await expect(firstReveal).toHaveCSS("transform", "none");
  });

  test("redirects anonymous visitors to admin login", async ({ page }) => {
    const response = await page.request.get("/admin", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/admin/login");

    await page.goto("/admin/login");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByText("Đăng nhập để tải ảnh và chọn các vị trí nổi bật trên trang cưới.")).toBeVisible();
  });
});
