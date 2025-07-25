import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { jordanGovernorates } from '@/data/jordan-locations';

interface City {
  id: string;
  name: string;
  governorateId: string;
}

interface Governorate {
  id: string;
  name: string;
}

// تعريف نوع خاص للإدخال في Supabase
interface SupabaseCityInsert {
  id: string;
  name: string;
  governorate_id: string;
}

const GeographyManagement: React.FC = () => {
  const { toast } = useToast();
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedGov, setSelectedGov] = useState<string | null>(null);
  const [newGovName, setNewGovName] = useState('');
  const [editGovId, setEditGovId] = useState<string | null>(null);
  const [editGovName, setEditGovName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [editCityId, setEditCityId] = useState<string | null>(null);
  const [editCityName, setEditCityName] = useState('');

  // Load data from Supabase only
  useEffect(() => {
    const load = async () => {
      const { data: govs } = await supabase.from('governorates').select('*');
      const { data: cts } = await supabase.from('cities').select('*');
      setGovernorates(govs || []);
      setCities(cts || []);
    };
    load();
  }, []);

  // Governorate CRUD
  const addGovernorate = async () => {
    if (!newGovName.trim()) return;
    const { data, error } = await supabase.from('governorates').insert([{ name: newGovName.trim() }]).select();
    if (error) {
      toast({ title: 'خطأ في إضافة المحافظة', description: error.message, variant: 'destructive' });
      return;
    }
    setGovernorates([...governorates, ...(data || [])]);
    setNewGovName('');
    toast({ title: 'تمت إضافة المحافظة', description: newGovName.trim() });
  };
  const updateGovernorate = async () => {
    if (!editGovId || !editGovName.trim()) return;
    const { error } = await supabase.from('governorates').update({ name: editGovName.trim() }).eq('id', editGovId);
    if (error) {
      toast({ title: 'خطأ في تعديل المحافظة', description: error.message, variant: 'destructive' });
      return;
    }
    setGovernorates(governorates.map(g => g.id === editGovId ? { ...g, name: editGovName.trim() } : g));
    setEditGovId(null); setEditGovName('');
    toast({ title: 'تم تعديل المحافظة' });
  };
  const deleteGovernorate = async (id: string) => {
    const { error } = await supabase.from('governorates').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ في حذف المحافظة', description: error.message, variant: 'destructive' });
      return;
    }
    setGovernorates(governorates.filter(g => g.id !== id));
    toast({ title: 'تم حذف المحافظة' });
  };

  // City CRUD
  const addCity = async () => {
    if (!selectedGov || !newCityName.trim()) return;
    const { data, error } = await supabase.from('cities').insert([{ name: newCityName.trim(), governorate_id: selectedGov }]).select();
    if (error) {
      toast({ title: 'خطأ في إضافة المدينة', description: error.message, variant: 'destructive' });
      return;
    }
    setCities([...cities, ...(data || [])]);
    setNewCityName('');
    toast({ title: 'تمت إضافة المدينة', description: newCityName.trim() });
  };
  const updateCity = async () => {
    if (!editCityId || !editCityName.trim()) return;
    const { error } = await supabase.from('cities').update({ name: editCityName.trim() }).eq('id', editCityId);
    if (error) {
      toast({ title: 'خطأ في تعديل المدينة', description: error.message, variant: 'destructive' });
      return;
    }
    setCities(cities.map(c => c.id === editCityId ? { ...c, name: editCityName.trim() } : c));
    setEditCityId(null); setEditCityName('');
    toast({ title: 'تم تعديل المدينة' });
  };
  const deleteCity = async (id: string) => {
    const { error } = await supabase.from('cities').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ في حذف المدينة', description: error.message, variant: 'destructive' });
      return;
    }
    setCities(cities.filter(c => c.id !== id));
    toast({ title: 'تم حذف المدينة' });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto mt-8" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          الإدارة الجغرافية (المحافظات والمدن)
          <Button variant="outline" size="sm" onClick={async () => {
            const govs = jordanGovernorates.map(gov => ({ id: String(gov.id), name: gov.name }));
            const cts: SupabaseCityInsert[] = jordanGovernorates.flatMap(gov =>
              gov.cities.map(city => ({
                id: String(city.id),
                name: city.name,
                governorate_id: String(gov.id) // استخدم snake_case
              }))
            );
            await supabase.from('governorates').insert(govs);
            await supabase.from('cities').insert(cts);
            toast({ title: 'تم استيراد محافظات ومدن الأردن' });
          }} className="ml-auto">استيراد محافظات ومدن الأردن</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Governorates Section */}
        <div>
          <h2 className="text-lg font-bold mb-2">المحافظات</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={newGovName}
              onChange={e => setNewGovName(e.target.value)}
              placeholder="اسم المحافظة الجديدة"
              className="w-64"
            />
            <Button onClick={addGovernorate} className="gap-2"><Plus className="h-4 w-4" />إضافة</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {governorates.map(gov => (
              <div key={gov.id} className={`border rounded-lg px-4 py-2 flex items-center gap-2 ${selectedGov === gov.id ? 'bg-blue-50 border-blue-400' : ''}`}>
                {editGovId === gov.id ? (
                  <>
                    <Input value={editGovName} onChange={e => setEditGovName(e.target.value)} className="w-32" />
                    <Button size="sm" onClick={updateGovernorate}>حفظ</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditGovId(null); setEditGovName(''); }}>إلغاء</Button>
                  </>
                ) : (
                  <>
                    <span className="font-bold cursor-pointer" onClick={() => setSelectedGov(gov.id)}>{gov.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => { setEditGovId(gov.id); setEditGovName(gov.name); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteGovernorate(gov.id)}><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Cities Section */}
        <div>
          <h2 className="text-lg font-bold mb-2">المدن التابعة للمحافظة</h2>
          {selectedGov ? (
            <>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newCityName}
                  onChange={e => setNewCityName(e.target.value)}
                  placeholder="اسم المدينة الجديدة"
                  className="w-64"
                />
                <Button onClick={addCity} className="gap-2"><Plus className="h-4 w-4" />إضافة</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.filter(c => c.governorate_id === selectedGov).map(city => (
                  <div key={city.id} className="border rounded-lg px-4 py-2 flex items-center gap-2">
                    {editCityId === city.id ? (
                      <>
                        <Input value={editCityName} onChange={e => setEditCityName(e.target.value)} className="w-32" />
                        <Button size="sm" onClick={updateCity}>حفظ</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditCityId(null); setEditCityName(''); }}>إلغاء</Button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">{city.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => { setEditCityId(city.id); setEditCityName(city.name); }}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCity(city.id)}><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-gray-500">اختر محافظة لعرض وإدارة المدن التابعة لها.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographyManagement; 