# Website Thiệp Cưới & Album Ảnh Quốc Huy & Hoài Thương

## Tóm tắt

- Xây dựng bằng Next.js 16 App Router, TypeScript, Tailwind CSS v4, Motion và Sharp.
- Trang thiệp cưới trực tuyến đầy đủ: Lời mời cá nhân hóa cho từng khách, thông tin hai bên gia đình, đếm ngược ngày cưới, chi tiết lễ thành hôn (Tư Gia) & tiệc cưới (Unique Q7), hộp mừng cưới VietQR, lời cảm ơn, album ảnh cưới và trình phát nhạc nền lãng mạn.
- Quản lý ảnh cưới độc lập trực tiếp trong dự án (`public/images/album/`), tự động nén tối ưu WebP sắc nét bằng Sharp, không phụ thuộc dịch vụ lưu trữ bên thứ 3 (như ImageKit).
- Thiết kế chuẩn di động, tinh tế, sang trọng, tương thích dark/light mode.

## Giao diện và trải nghiệm

- Font chữ: Playfair Display cho tiêu đề và tên cặp đôi, Be Vietnam Pro cho nội dung chi tiết.
- Bảng màu xanh sương bạc thanh lịch:
  - Light: nền `#F4F7F8`, bề mặt `#E5EDF1`, chữ `#24323B`, accent `#4E6B7C`.
  - Dark: nền `#11171B`, bề mặt `#1A242A`, chữ `#E8EEF1`, accent `#9CB2C0`.
- Album ảnh cưới:
  - Bố cục **Editorial Masonry** đa cột mượt mà, tự động co giãn theo số lượng ảnh thực tế, không để lại khoảng trống.
  - Ảnh hiển thị chuẩn WebP sắc nét (2.4K).
  - Trình xem ảnh toàn màn hình (**Lightbox**) hỗ trợ xem ảnh chất lượng cao, vuốt chạm trên di động, phím mũi tên và phím Escape.

## Quản trị và lưu trữ ảnh (Local & Supabase)

- **Quản lý khách mời**: Kết nối Supabase lưu danh sách khách, tạo mã link thiệp riêng (`/[code]`), đếm lượt mở thiệp.
- **Quản trị ảnh cưới trực tiếp (`/admin`)**:
  - Tải ảnh trực tiếp từ máy tính lên thư mục dự án (`public/images/album/`), hệ thống dùng **Sharp** tự động nén WebP siêu nhẹ và sắc nét.
  - Chọn 1-click ảnh làm **Banner**, **Avatar Nhà Trai** và **Avatar Nhà Gái**.
  - **Căn chỉnh khuôn mặt (Crop / Zoom / Tọa độ X-Y)** cho ảnh đại diện Nhà Trai và Nhà Gái.
  - **Bật / Tắt hiển thị ảnh (Show / Hide)** trong danh sách album mà không làm mất ảnh avatar nếu đã chọn.
  - Cấu hình lưu trữ tập trung tại `content/banner.json`.
