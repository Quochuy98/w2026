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
  event_type TEXT NOT NULL DEFAULT 'wedding' CHECK (event_type IN ('wedding', 'reception')),
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
  ('bao-hy', 'Hoàng Yến & Đồng Nghiệp', 'Bạn', 'reception', 'bride', 'Khách nhà gái - Tiệc báo hỷ')
ON CONFLICT (code) DO NOTHING;

