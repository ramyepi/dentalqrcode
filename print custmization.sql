-- إنشاء جدول إعدادات الموقع (site_settings) إذا لم يكن موجودًا
CREATE TABLE IF NOT EXISTS public.site_settings (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- تفعيل سياسات RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة (إن وجدت) وإنشاء سياسات جديدة
DROP POLICY IF EXISTS "Allow all select" ON public.site_settings;
CREATE POLICY "Allow all select" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all insert" ON public.site_settings;
CREATE POLICY "Allow all insert" ON public.site_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all update" ON public.site_settings;
CREATE POLICY "Allow all update" ON public.site_settings FOR UPDATE USING (true);

-- إضافة إعدادات افتراضية للطباعة (يمكنك تعديل القيم حسب رغبتك)
INSERT INTO public.site_settings (key, value) VALUES
('print_header_line1', 'نقابة أطباء الأسنان الأردنية'),
('print_header_line1_size', '22'),
('print_header_line2', 'هذه العيادة مرخصة'),
('print_header_line2_size', '18'),
('print_footer_line1', 'للتأكد امسح الرمز من خلال تطبيق تحقق'),
('print_footer_line1_size', '16'),
('print_footer_line2', 'للاستفسار اتصل على ...'),
('print_footer_line2_size', '14'),
('print_clinic_name_size', '20'),
('print_header_color', '#d60000'),
('print_footer_color', '#000000'),
('print_logo_size', '80'),
('print_logo_url', ''),
('print_title_color', '#d60000'),
('print_text_color', '#000000'),
('print_bg_color', '#ffffff'),
('print_qr_size', '320')
ON CONFLICT (key) DO NOTHING;