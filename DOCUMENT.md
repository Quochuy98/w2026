# Landing page album cưới Quốc Huy & Hoài Thương

## Tóm tắt

- Xây mới tại workspace hiện tại bằng Next.js 16 App Router, TypeScript, Tailwind CSS v4 và Motion.
- Trang công khai chỉ tập trung vào ngày cưới, bộ đếm ngược, ảnh cưới và lightbox. Không thêm câu chuyện, địa điểm, RSVP, bản đồ hoặc nhạc.
- Đối tượng chính là khách xem trên điện thoại. Design read: album cưới biên tập hiện đại, trẻ trung, nhẹ nhàng và thanh lịch.
- Khóa thông số thiết kế: `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 5`, `VISUAL_DENSITY: 3`.

## Giao diện và trải nghiệm

- Dùng Playfair Display cho tên và tiêu đề, Be Vietnam Pro cho nội dung và số liệu. Cả hai tải qua `next/font`.
- Bảng màu xanh sương bạc:
  - Light: nền `#F4F7F8`, bề mặt `#E5EDF1`, chữ `#24323B`, accent `#4E6B7C`.
  - Dark theo hệ thống: nền `#11171B`, bề mặt `#1A242A`, chữ `#E8EEF1`, accent `#9CB2C0`.
- Hero dạng split bất đối xứng: tên “Quốc Huy & Hoài Thương”, ngày `22.09.2026`, CTA duy nhất “Xem album” và ảnh bìa tỷ lệ 4:5. Monogram dùng `T&H`.
- Countdown kết thúc tại `2026-09-22T00:00:00+07:00`, hiển thị Ngày, Giờ, Phút, Giây. Trong ngày cưới đổi thành “Hôm nay là ngày cưới của chúng mình”; sau ngày cưới chuyển sang lời cảm ơn.
- Album gồm ảnh mở đầu toàn chiều rộng, hai ảnh chân dung, lưới ảnh bất đối xứng, hai ảnh chi tiết và ảnh kết album. Ảnh đã dùng ở vị trí nổi bật không lặp lại trong lưới.
- Lightbox hỗ trợ Escape, phím mũi tên, nút điều hướng Phosphor, vuốt trên mobile, focus trap, trả focus khi đóng và khóa cuộn nền.
- Motion chỉ dùng cho hero reveal, ảnh xuất hiện khi vào viewport và chuyển trạng thái lightbox; toàn bộ có `prefers-reduced-motion`. Không dùng parallax, GSAP hoặc scroll listener thủ công.
- Ảnh hero được ưu tiên; ảnh còn lại lazy-load, giữ sẵn tỷ lệ để tránh CLS và dùng các kích thước responsive 360, 640, 960, 1440px.

## ImageKit, dữ liệu và quản trị

- Định nghĩa tập trung trong `content/wedding.ts`: tên, monogram, thời điểm cưới, múi giờ, folder `/wedding/thuong-huy/`, SEO và bảy vị trí ảnh.
- Kiểu dữ liệu chính:
  - `WeddingSlot`: `hero | opening | portrait-one | portrait-two | detail-one | detail-two | closing`.
  - `AlbumImage`: id, đường dẫn, kích thước, alt, tags, slot, thứ tự, layout và nguồn `imagekit | fallback`.
- Trang công khai đọc tối đa 45 ảnh từ ImageKit, cache 60 giây. Slot ưu tiên tag `wedding-slot-*`; nếu thiếu sẽ lấy ảnh chưa dùng tiếp theo. Khi có tag trùng, ảnh cập nhật gần nhất thắng.
- `/admin` dùng một mật khẩu từ biến môi trường, session HMAC SHA-256 tồn tại 8 giờ trong cookie HttpOnly, SameSite Strict và Secure ở production.
- Admin có upload nhiều ảnh, tiến trình từng file, lỗi và thử lại, thư viện thumbnail, chọn một ảnh cho mỗi slot, xóa gán slot và đăng xuất. Không làm xóa ảnh, sửa alt hoặc kéo thả sắp xếp trong phiên bản này.
- Upload đi trực tiếp từ trình duyệt đến ImageKit qua [`@imagekit/next`](https://imagekit.io/docs/integration/nextjs). `POST /api/imagekit/upload-auth` chỉ trả `{ token, expire, signature, publicKey }` khi session hợp lệ và luôn dùng `no-store`; private key chỉ tồn tại phía server.
- Upload gắn tag `wedding-album`, dùng pre-transformation `rt-auto,w-2400,h-2400,c-at_max,q-82,f-webp,md-false`. Chặn trước file vượt 20MB hoặc 25MP theo [giới hạn xử lý ảnh của ImageKit](https://imagekit.io/docs/transformations).
- CLI `npm run album:upload -- "<folder>" --expected 45` dùng Sharp để xoay EXIF, thu nhỏ cạnh dài tối đa 2400px, xuất WebP quality 82, bỏ metadata, upload tuần tự thành `01.webp` đến `45.webp` và chỉ ghi manifest sau khi toàn bộ thành công. `--replace` giữ tag slot theo cùng số thứ tự.
- Sáu biến môi trường giữ nguyên theo `ImageKit.md`: private key, public key, URL endpoint, folder, admin password và session secret.
- Khi thiếu cấu hình hoặc album trống, trang dùng bảy ảnh demo. Theo hướng dẫn `design-taste-frontend` và `imagegen`, tạo một ảnh neo rồi sáu biến thể đồng nhất: hero nhìn từ phía sau, ảnh đi bộ ngang, hai chân dung, hai ảnh chi tiết và ảnh silhouette kết. Không nhúng chữ vào ảnh; alt ghi rõ đây là ảnh minh họa.

## Kiểm thử và nghiệm thu

- Unit test countdown tại trước ngày cưới, đúng ngày cưới và sau ngày cưới; kiểm tra múi giờ Việt Nam và không xuất hiện số âm.
- Test resolver slot với tag thiếu, tag trùng, album dưới bảy ảnh, manifest CLI và fallback khi ImageKit lỗi.
- Test session hết hạn, token bị sửa, mật khẩu sai, route upload-auth không đăng nhập và private key không xuất hiện trong client bundle.
- Mock ImageKit để test upload thành công, lỗi một phần, retry, giữ tag slot và không ghi manifest khi CLI thất bại.
- Playwright trên mobile và desktop: không tràn ngang, hero vừa viewport, gallery mở đúng ảnh, điều hướng lightbox, vuốt, focus, dark mode và reduced motion.
- Chạy `lint`, `typecheck`, unit test, Playwright và production build. Kiểm tra Lighthouse với mục tiêu LCP dưới 2.5 giây, INP dưới 200ms và CLS dưới 0.1.
- Hoàn tất pre-flight của skill: một accent xuyên suốt, một hệ radius, CTA không xuống dòng, WCAG AA, không có em dash trong nội dung hiển thị và không lặp layout section.

## Giả định đã khóa

- Ngày cưới bắt đầu lúc `00:00` ngày 22/09/2026 theo `Asia/Ho_Chi_Minh`.
- Album thật dự kiến 45 ảnh; bảy ảnh demo chỉ dùng khi chưa cấu hình ImageKit.
- Thứ tự album thật đến từ manifest CLI, sau đó mới đến thời gian upload của ảnh thêm qua admin.
- Mục tiêu deploy là Vercel; không cần database hoặc dịch vụ xác thực bên ngoài.
- Giữ và cập nhật `ImageKit.md` để phản ánh đúng giao diện chỉ gồm ngày cưới, countdown, album và quản trị ảnh.
