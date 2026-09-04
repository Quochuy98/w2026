-- ==============================================================================
-- SCHEMA CHO THIỆP CƯỚI ONLINE - QUỐC HUY & HOÀI THƯƠNG
-- Chạy script này trong Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Tạo bảng guests (Khách mời)
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  salutation TEXT NOT NULL DEFAULT 'Bạn',
  event_type TEXT NOT NULL DEFAULT 'wedding' CHECK (event_type IN ('wedding', 'reception', 'both')),
  side TEXT NOT NULL DEFAULT 'groom' CHECK (side IN ('groom', 'bride')),
  note TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tạo index cho trường code để tra cứu cực nhanh
CREATE INDEX IF NOT EXISTS idx_guests_code ON public.guests(code);

-- 3. Kích hoạt Row Level Security (RLS)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- 4. Tạo Policy cho phép người xem (khách) đọc thông tin qua mã mời (Public Read)
CREATE POLICY "Cho phép đọc thông tin khách mời công khai theo mã"
  ON public.guests
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Tạo Policy cho phép cập nhật số lượt xem (Public Update view_count)
CREATE POLICY "Cho phép cập nhật lượt xem thiệp"
  ON public.guests
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Tạo Policy cho phép toàn quyền quản trị (Dành cho Service Role / Admin)
CREATE POLICY "Toàn quyền quản trị khách mời"
  ON public.guests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Thêm dữ liệu mẫu ban đầu để test
INSERT INTO public.guests (code, name, salutation, event_type, side, note)
VALUES
  ('232388', 'Nam & Bạn Gái', 'Anh', 'reception', 'groom', 'Bạn thân thời đại học - Tiệc báo hỷ'),
  ('tu-gia', 'Bác Hai & Gia Đình', 'Gia đình', 'wedding', 'groom', 'Khách nhà trai - Lễ cưới tư gia'),
  ('bao-hy', 'Hoàng Yến & Đồng Nghiệp', 'Bạn', 'reception', 'bride', 'Khách nhà gái - Tiệc báo hỷ'),
  ('ca-hai', 'Chú Năm & Thím Năm', 'Gia đình', 'both', 'groom', 'Khách VIP - Tham dự cả 2 sự kiện')
ON CONFLICT (code) DO NOTHING;

-- 8. Tạo bảng settings (Cấu hình hệ thống: Banner, Avatar, Crop, Hidden images,...)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Kích hoạt RLS cho bảng settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 10. Policy cho phép đọc công khai (để khách vào trang web tải được banner/avatar)
CREATE POLICY "Cho phép đọc cấu hình công khai"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 11. Policy cho phép toàn quyền quản trị cho service_role
CREATE POLICY "Toàn quyền quản trị cấu hình cho service role"
  ON public.settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 12. Policy cho phép cập nhật cấu hình hệ thống qua API
CREATE POLICY "Cho phép cập nhật cấu hình hệ thống"
  ON public.settings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- LƯU Ý MIGRATION (Nếu đã tạo bảng trước đó trên Supabase):
-- Chạy lệnh sau trong Supabase SQL Editor để cho phép giá trị 'both':
-- ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_event_type_check;
-- ALTER TABLE public.guests ADD CONSTRAINT guests_event_type_check CHECK (event_type IN ('wedding', 'reception', 'both'));
-- ==============================================================================


