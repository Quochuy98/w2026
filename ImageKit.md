# Album cưới Hoài Thương & Quốc Huy

Website ảnh cưới one-page tối giản, responsive, xây bằng Next.js App Router, TypeScript, Tailwind CSS, Motion và ImageKit. Monogram trên giao diện dùng tên gọi **T&H**.

Ảnh thật nằm trên ImageKit; repository không cần chứa 45 ảnh gốc. Khi chưa cấu hình ImageKit hoặc Media Library chưa có ảnh, website tự dùng bộ ảnh demo trong `public/images/demo/` để giao diện vẫn hoạt động.

## 1. Chuẩn bị ImageKit

1. Tạo tài khoản tại [ImageKit](https://imagekit.io/registration/).
2. Trong Dashboard, mở **Developer options → API keys** và lấy:
   - Private key.
   - Public key.
   - URL endpoint, dạng `https://ik.imagekit.io/<imagekit_id>`.
3. Folder mặc định của dự án là `/wedding/thuong-huy/`. Script hoặc trang quản trị sẽ tạo folder này trong lần upload đầu tiên.

Gói miễn phí phù hợp với album dùng ngắn hạn và lượng khách nhỏ theo giả định của dự án. Hạn mức có thể thay đổi, vì vậy hãy kiểm tra [bảng giá ImageKit hiện hành](https://imagekit.io/plans) trước khi chia sẻ rộng rãi.

## 2. Cấu hình môi trường

Sao chép file mẫu:

```bash
cp .env.example .env.local
```

Điền các giá trị thật vào `.env.local`:

```dotenv
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_PUBLIC_KEY=public_xxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
IMAGEKIT_FOLDER=/wedding/thuong-huy/

ADMIN_PASSWORD=mat-khau-rieng-cua-ban
ADMIN_SESSION_SECRET=chuoi-ngau-nhien-dai-toi-thieu-32-ky-tu
```

Có thể tạo session secret bằng:

```bash
openssl rand -hex 32
```

`IMAGEKIT_PRIVATE_KEY`, `ADMIN_PASSWORD` và `ADMIN_SESSION_SECRET` là bí mật server. Không đổi tên chúng thành biến bắt đầu bằng `NEXT_PUBLIC_`, không commit `.env.local`, không dán chúng vào code hoặc ảnh chụp màn hình. Chỉ URL endpoint được phép xuất hiện trong trình duyệt.

Trang quản trị lấy token upload qua `POST /api/imagekit/upload-auth`. Route này
chỉ trả `token`, `expire`, `signature` và `publicKey` sau khi cookie phiên quản
trị HMAC còn hiệu lực (8 giờ). Route luôn gửi `Cache-Control: no-store`; private
key chỉ được đọc trên server và không xuất hiện trong bundle trình duyệt.

## 3. Chạy local

```bash
npm install
npm run dev
```

- Website: [http://localhost:3000](http://localhost:3000)
- Quản lý album: [http://localhost:3000/admin](http://localhost:3000/admin)

Thông tin cặp đôi, ngày cưới và SEO nằm trong `content/wedding.ts`. Thay nội dung ở đây không cần sửa component.

## 4. Upload bằng trang quản trị

Mở `/admin`, đăng nhập bằng `ADMIN_PASSWORD`, rồi chọn ảnh để upload. File đi thẳng từ trình duyệt lên ImageKit bằng chữ ký dùng một lần; mỗi file nhận một bộ token mới để không phát lại token đã dùng. Private key không đi xuống trình duyệt và ảnh không đi qua body của Vercel. Pre-transformation của ImageKit tự xoay, giới hạn cạnh dài 2400px, chuyển WebP quality 82 và bỏ metadata trước khi lưu vào Media Library.

Trang quản trị có bảy vị trí ảnh cố định:

- Ảnh bìa đầu trang.
- Ảnh ngang mở album.
- Hai ảnh chân dung.
- Hai ảnh chi tiết.
- Ảnh ngang kết album.

Chọn một thumbnail cho từng vị trí. Ảnh chưa gán vị trí sẽ tự xuất hiện trong khu vực **Tất cả ảnh**; không cần sắp xếp thủ công. Nếu chưa chọn ảnh bìa, ảnh được upload đầu tiên được dùng làm hero.

ImageKit lưu việc gán vị trí bằng tag `wedding-slot-*`, còn mọi ảnh thuộc album có tag `wedding-album`. Không xóa các tag này trong Media Library nếu vẫn muốn giữ bố cục đã chọn.

Với upload có pre-transformation, ImageKit giới hạn file đầu vào ở **20MB và 25 megapixel** tại thời điểm lập dự án (free plan thông thường cho phép tối đa 25MB nhưng transformation có ngưỡng thấp hơn). Nếu ảnh điện thoại vượt một trong hai ngưỡng, dùng CLI ở phần tiếp theo vì CLI tối ưu file trên máy trước khi gửi lên ImageKit. Xem giới hạn hiện hành trong [ImageKit upload API](https://imagekit.io/docs/api-reference/upload-file/upload-file).

## 5. Upload hàng loạt 45 ảnh bằng CLI

Giữ ảnh gốc ở một thư mục ngoài repository hoặc trong Drive. Chạy:

```bash
npm run album:upload -- "/đường/dẫn/45-ảnh-gốc" --expected 45
```

CLI thực hiện theo thứ tự an toàn:

1. Chỉ nhận JPEG, PNG, WebP, AVIF, HEIC/HEIF và TIFF; sắp tên tự nhiên (`anh-2` đứng trước `anh-10`).
2. Xác minh đúng số lượng truyền qua `--expected` trước khi gọi ImageKit.
3. Tự xoay theo EXIF, giới hạn cạnh dài 2400px và không phóng lớn ảnh nhỏ.
4. Chuyển sang WebP quality 82 trong bộ nhớ, không giữ EXIF/GPS và không sửa file nguồn.
5. Upload tuần tự thành `01.webp` đến `45.webp`, gắn tag `wedding-album`.
6. Sinh `content/gallery.generated.ts` gồm `fileId`, đường dẫn, kích thước, layout và alt mặc định có kiểu `AlbumImage`.

Theo mặc định, CLI kiểm tra trước và dừng nếu một file đích đã tồn tại. Chỉ khi chủ động muốn thay album mới dùng:

```bash
npm run album:upload -- "/đường/dẫn/45-ảnh-gốc" --expected 45 --replace
```

Khi thay file, CLI giữ lại các tag vị trí `wedding-slot-*` đang có cùng số thứ tự. Nếu một upload lỗi, thông báo ghi rõ tên ảnh nguồn và tên file đích; các ảnh đã upload trước lỗi vẫn còn trên ImageKit, còn manifest chỉ được ghi sau khi cả lượt hoàn tất.

Một vài lưu ý:

- Đặt số thứ tự vào tên ảnh nguồn nếu muốn kiểm soát thứ tự tự nhiên.
- Không di chuyển ảnh gốc vào `public/`; website không cần và Git/Vercel sẽ nặng hơn.
- `content/gallery.generated.ts` không chứa khóa bí mật và có thể commit như một bản manifest của lượt upload.
- Nếu thiếu cấu hình ImageKit, API tạm thời lỗi hoặc Media Library chưa có ảnh, landing page tự dùng bảy ảnh minh họa trong `public/images/demo/`. Khi album thật có ít ảnh hơn bảy vị trí nổi bật, resolver bổ sung vị trí còn thiếu bằng ảnh minh họa mà không lặp ảnh nổi bật trong lưới.
- Chạy `npm run album:upload -- --help` để xem cú pháp và định dạng hỗ trợ.

## 6. Cách website tải ảnh nhẹ

- Hero được ưu tiên tải; ảnh còn lại lazy-load khi đến gần viewport.
- ImageKit phân phối kích thước responsive 360, 640, 960 và 1440px, tự chọn WebP/AVIF phù hợp trình duyệt.
- Lightbox chỉ yêu cầu ảnh lớn khi người xem mở ảnh đó, tối đa theo cấu hình của website.
- Hero được tải ưu tiên; mọi ảnh giữ sẵn kích thước và tỷ lệ để tránh layout shift, còn ảnh ngoài viewport được tải lười.
- 45 phần tử trong DOM không đáng kể; phần tốn băng thông là file ảnh nên không tải cả album ngay lần mở đầu.

Sau ngày đầu chia sẻ, kiểm tra **Bandwidth** trong ImageKit Dashboard. Nếu đã dùng hơn 75% hạn mức dự kiến, giảm quality phân phối hoặc giới hạn ảnh lightbox xuống 1920px trước khi tiếp tục chia sẻ.

## 7. Kiểm tra trước khi deploy

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Kiểm tra thêm bằng trình duyệt:

- Desktop và điện thoại không tràn ngang.
- Lần tải đầu trên mobile chỉ gọi hero và vài ảnh gần viewport.
- Lightbox hiện đúng chỉ số, hỗ trợ Escape, phím mũi tên, vuốt và trả focus sau khi đóng.
- Ảnh lỗi có fallback; tắt animation trong `prefers-reduced-motion` vẫn đọc được nội dung.
- Private key không xuất hiện trong HTML, JavaScript client hoặc log build.

## 8. Deploy Vercel

1. Đẩy source code lên GitHub, không kèm `.env.local` và ảnh gốc.
2. Import repository vào Vercel.
3. Trong **Project Settings → Environment Variables**, thêm đủ sáu biến giống `.env.local` cho Production (và Preview nếu cần).
4. Giữ Build Command mặc định `npm run build`.
5. Nếu cần URL tuyệt đối cho Open Graph sau này, thêm `seo.siteUrl` trong `content/wedding.ts` rồi deploy lại. Với local dev và preview tạm thời, giá trị này có thể để trống.

Vercel không cần lưu ảnh album và không cần tăng body upload vì trang quản trị upload trực tiếp lên ImageKit.

## 9. Kết thúc sau một tháng

Trước khi dọn tài nguyên, giữ một bản ảnh gốc trên máy/Drive. Sau đó:

1. Tắt hoặc xóa project trên Vercel nếu không muốn website tiếp tục truy cập được.
2. Vào ImageKit Media Library và xóa folder `/wedding/thuong-huy/` nếu không còn dùng.
3. Thu hồi/đổi API key nếu key chỉ phục vụ website này.
4. Xóa domain hoặc bản ghi DNS riêng nếu đã cấu hình.

Xóa deployment không tự xóa ảnh trên ImageKit; hai bước này phải làm riêng.

## Placeholder

Ảnh trong `public/images/demo/` là demo dành cho trạng thái chưa cấu hình. Ảnh minh họa không chứa chữ; alt text trên trang cũng ghi rõ đây là ảnh minh họa.
