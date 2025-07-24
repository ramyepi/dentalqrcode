import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const COLOR_DEFAULTS = {
  title: '#d60000',
  text: '#000000',
  background: '#ffffff',
};

const PrintCustomization: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSiteSettings();
  const [form, setForm] = useState({
    print_header_line1: '',
    print_header_line1_size: '22',
    print_header_line2: '',
    print_header_line2_size: '18',
    print_footer_line1: '',
    print_footer_line1_size: '16',
    print_footer_line2: '',
    print_footer_line2_size: '14',
    print_clinic_name_size: '20',
    print_header_color: '#d60000',
    print_footer_color: '#000000',
    print_logo_size: '80',
    print_header: '', // legacy
    print_logo_url: '',
    print_footer: '', // legacy
    print_title_color: COLOR_DEFAULTS.title,
    print_text_color: COLOR_DEFAULTS.text,
    print_bg_color: COLOR_DEFAULTS.background,
    print_qr_size: '320',
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Mutation for saving settings (Supabase only)
  const updateMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const promises = updates.map(({ key, value }) =>
        supabase
          .from('site_settings')
          .update({ value })
          .eq('key', key)
      );
      const results = await Promise.all(promises);
      for (const result of results) {
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'تم حفظ إعدادات الطباعة بنجاح',
        description: 'تم تحديث إعدادات الطباعة',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في حفظ إعدادات الطباعة',
        description: 'حدث خطأ أثناء تحديث إعدادات الطباعة',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setForm(f => ({
        ...f,
        print_header_line1: settings.find(s => s.key === 'print_header_line1')?.value || '',
        print_header_line1_size: settings.find(s => s.key === 'print_header_line1_size')?.value || '22',
        print_header_line2: settings.find(s => s.key === 'print_header_line2')?.value || '',
        print_header_line2_size: settings.find(s => s.key === 'print_header_line2_size')?.value || '18',
        print_footer_line1: settings.find(s => s.key === 'print_footer_line1')?.value || '',
        print_footer_line1_size: settings.find(s => s.key === 'print_footer_line1_size')?.value || '16',
        print_footer_line2: settings.find(s => s.key === 'print_footer_line2')?.value || '',
        print_footer_line2_size: settings.find(s => s.key === 'print_footer_line2_size')?.value || '14',
        print_clinic_name_size: settings.find(s => s.key === 'print_clinic_name_size')?.value || '20',
        print_header_color: settings.find(s => s.key === 'print_header_color')?.value || '#d60000',
        print_footer_color: settings.find(s => s.key === 'print_footer_color')?.value || '#000000',
        print_logo_size: settings.find(s => s.key === 'print_logo_size')?.value || '80',
        print_header: settings.find(s => s.key === 'print_header')?.value || '',
        print_logo_url: settings.find(s => s.key === 'print_logo_url')?.value || '',
        print_footer: settings.find(s => s.key === 'print_footer')?.value || '',
        print_title_color: settings.find(s => s.key === 'print_title_color')?.value || COLOR_DEFAULTS.title,
        print_text_color: settings.find(s => s.key === 'print_text_color')?.value || COLOR_DEFAULTS.text,
        print_bg_color: settings.find(s => s.key === 'print_bg_color')?.value || COLOR_DEFAULTS.background,
        print_qr_size: settings.find(s => s.key === 'print_qr_size')?.value || '320',
      }));
    }
  }, [settings]);

  useEffect(() => {
    setLogoPreview(form.print_logo_url);
  }, [form.print_logo_url]);

  const handleInput = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setForm(f => ({ ...f, print_logo_url: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(form).map(([key, value]) => ({ key, value }));
      await updateMutation.mutateAsync(updates);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card dir="rtl" className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">تخصيص صفحة طباعة QR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-right">سطر الهيدر الأول</label>
            <div className="flex items-center gap-2">
              <Input
                value={form.print_header_line1}
                onChange={e => handleInput('print_header_line1', e.target.value)}
                placeholder="مثال: نقابة أطباء الأسنان الأردنية"
                className="text-right font-mono flex-1"
                dir="rtl"
              />
              <Input
                type="number"
                min={10}
                max={48}
                value={form.print_header_line1_size}
                onChange={e => handleInput('print_header_line1_size', e.target.value)}
                className="w-20"
                title="حجم الخط (px)"
              />
            </div>
            <label className="block text-sm font-medium mb-2 text-right mt-4">سطر الهيدر الثاني</label>
            <div className="flex items-center gap-2">
              <Input
                value={form.print_header_line2}
                onChange={e => handleInput('print_header_line2', e.target.value)}
                placeholder="مثال: هذه العيادة مرخصة"
                className="text-right font-mono flex-1"
                dir="rtl"
              />
              <Input
                type="number"
                min={10}
                max={48}
                value={form.print_header_line2_size}
                onChange={e => handleInput('print_header_line2_size', e.target.value)}
                className="w-20"
                title="حجم الخط (px)"
              />
            </div>
            <label className="block text-sm font-medium mb-2 text-right mt-4">لون الهيدر</label>
            <Input type="color" value={form.print_header_color} onChange={e => handleInput('print_header_color', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-right">رابط أو رفع اللوجو</label>
            <Input
              value={form.print_logo_url}
              onChange={e => handleInput('print_logo_url', e.target.value)}
              placeholder="https://example.com/logo.png أو ارفع صورة"
              className="text-left font-mono"
              dir="ltr"
            />
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-2" />
            {logoPreview && (
              <img src={logoPreview} alt="شعار" className="mt-2 mx-auto border rounded bg-white" style={{ maxHeight: form.print_logo_size + 'px' }} />
            )}
            <label className="block text-sm font-medium mb-2 text-right mt-4">حجم اللوجو (بالبكسل)</label>
            <Input
              type="number"
              min={24}
              max={400}
              value={form.print_logo_size}
              onChange={e => handleInput('print_logo_size', e.target.value)}
              className="w-32"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-right">سطر الفوتر الأول</label>
            <div className="flex items-center gap-2">
              <Input
                value={form.print_footer_line1}
                onChange={e => handleInput('print_footer_line1', e.target.value)}
                placeholder="مثال: للتحقق امسح الرمز من خلال تطبيق تحقق"
                className="text-right font-mono flex-1"
                dir="rtl"
              />
              <Input
                type="number"
                min={10}
                max={48}
                value={form.print_footer_line1_size}
                onChange={e => handleInput('print_footer_line1_size', e.target.value)}
                className="w-20"
                title="حجم الخط (px)"
              />
            </div>
            <label className="block text-sm font-medium mb-2 text-right mt-4">سطر الفوتر الثاني</label>
            <div className="flex items-center gap-2">
              <Input
                value={form.print_footer_line2}
                onChange={e => handleInput('print_footer_line2', e.target.value)}
                placeholder="مثال: للاستفسار اتصل على ..."
                className="text-right font-mono flex-1"
                dir="rtl"
              />
              <Input
                type="number"
                min={10}
                max={48}
                value={form.print_footer_line2_size}
                onChange={e => handleInput('print_footer_line2_size', e.target.value)}
                className="w-20"
                title="حجم الخط (px)"
              />
            </div>
            <label className="block text-sm font-medium mb-2 text-right mt-4">لون الفوتر</label>
            <Input type="color" value={form.print_footer_color} onChange={e => handleInput('print_footer_color', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-right">لون النص العام</label>
            <Input type="color" value={form.print_text_color} onChange={e => handleInput('print_text_color', e.target.value)} />
            <label className="block text-sm font-medium mb-2 text-right mt-4">لون الخلفية</label>
            <Input type="color" value={form.print_bg_color} onChange={e => handleInput('print_bg_color', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-right">حجم خط اسم العيادة (بالبكسل)</label>
          <Input
            type="number"
            min={10}
            max={48}
            value={form.print_clinic_name_size}
            onChange={e => handleInput('print_clinic_name_size', e.target.value)}
            className="w-32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-right">حجم رمز QR (بالبكسل)</label>
          <Input
            type="number"
            min={120}
            max={600}
            value={form.print_qr_size}
            onChange={e => handleInput('print_qr_size', e.target.value)}
            className="w-32"
          />
        </div>
        <div className="flex justify-end pt-6">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 text-lg">
            {saving ? 'جاري الحفظ...' : 'حفظ إعدادات الطباعة'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintCustomization; 