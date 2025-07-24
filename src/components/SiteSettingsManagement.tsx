
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const SiteSettingsManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useSiteSettings();
  const [formData, setFormData] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      const data: Record<string, string> = {};
      settings.forEach(setting => {
        data[setting.key] = setting.value || '';
      });
      setFormData(data);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      // Supabase logic only
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
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم تحديث إعدادات الموقع",
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء تحديث الإعدادات",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updates = Object.entries(formData).map(([key, value]) => ({
      key,
      value
    }));
    updateMutation.mutate(updates);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (error) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>إعدادات الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            <p>حدث خطأ في تحميل إعدادات الموقع:</p>
            <p className="mt-2">{error.message || error.toString()}</p>
            <button onClick={() => window.location.reload()} className="mt-4 underline text-blue-600">إعادة المحاولة</button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>إعدادات الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">جاري تحميل الإعدادات...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-end">
          <span>إعدادات الموقع</span>
          <Settings className="h-5 w-5" />
        </CardTitle>
        <CardDescription className="text-right">
          تخصيص محتوى الفوتر، معلومات النظام، إعدادات الاتصال، والمزامنة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        {/* --- Site Info Section --- */}
        <section className="rounded-lg border p-6 bg-gray-50 space-y-6">
          <h2 className="text-lg font-bold mb-4 text-right border-b pb-2">معلومات النظام والفوتر</h2>
          <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2 text-right">عنوان النظام في الفوتر</label>
            <Input
              value={formData.footer_title || ''}
              onChange={(e) => handleInputChange('footer_title', e.target.value)}
              placeholder="نظام التحقق من تراخيص العيادات"
              className="text-right"
              dir="rtl"
            />
          </div>
          <div>
              <label className="block text-sm font-medium mb-2 text-right">اسم المنظمة</label>
              <Input
                value={formData.footer_organization || ''}
                onChange={(e) => handleInputChange('footer_organization', e.target.value)}
                placeholder="نقابة أطباء الأسنان الأردنية"
                className="text-right"
                dir="rtl"
              />
            </div>
            <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-right">وصف النظام</label>
            <Textarea
              value={formData.footer_description || ''}
              onChange={(e) => handleInputChange('footer_description', e.target.value)}
              placeholder="نظام متطور للتحقق السريع والآمن من تراخيص عيادات الأسنان في الأردن"
              rows={3}
              className="text-right"
              dir="rtl"
            />
          </div>
            <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-right">قائمة الميزات (JSON)</label>
            <Textarea
              value={formData.footer_features || ''}
              onChange={(e) => handleInputChange('footer_features', e.target.value)}
              placeholder='["• مسح رمز QR السريع", "• التحقق اليدوي من الترخيص"]'
              rows={4}
              className="text-right font-mono"
              dir="rtl"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              يرجى إدخال قائمة JSON صحيحة للميزات
            </p>
          </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-right">اسم المطور</label>
              <Input
                value={formData.footer_developer_name || ''}
                onChange={(e) => handleInputChange('footer_developer_name', e.target.value)}
                placeholder="د. براء صادق"
                className="text-right"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-right">منصب المطور</label>
              <Input
                value={formData.footer_developer_title || ''}
                onChange={(e) => handleInputChange('footer_developer_title', e.target.value)}
                placeholder="رئيس لجنة تكنولوجيا المعلومات"
                className="text-right"
                dir="rtl"
              />
            </div>
            <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-right">نص حقوق النشر</label>
            <Input
              value={formData.footer_copyright || ''}
              onChange={(e) => handleInputChange('footer_copyright', e.target.value)}
              placeholder="جميع الحقوق محفوظة © {year} نقابة أطباء الأسنان الأردنية"
              className="text-right"
              dir="rtl"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              استخدم {`{year}`} لإدراج السنة الحالية تلقائياً
            </p>
          </div>
          </div>
        </section>

        {/* --- Save Button --- */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 text-lg"
          >
            <Save className="h-5 w-5" />
            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsManagement;
