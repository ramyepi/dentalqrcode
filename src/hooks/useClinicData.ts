
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clinic, VerificationResult } from "@/types/clinic";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Fetch clinics from Supabase
const fetchSupabaseClinics = async (): Promise<Clinic[]> => {
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Clinic[];
};

export const useClinicData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query clinics from Supabase only
  const query = useQuery({
    queryKey: ["clinics"],
    queryFn: fetchSupabaseClinics,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Real-time updates from Supabase
  useEffect(() => {
      const channel = supabase
        .channel('clinics-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clinics'
          },
          async (payload) => {
            queryClient.invalidateQueries({ queryKey: ["clinics"] });
            if (payload.eventType === 'INSERT') {
              toast({ title: "عيادة جديدة", description: "تم إضافة عيادة جديدة" });
            } else if (payload.eventType === 'UPDATE') {
              toast({ title: "تحديث عيادة", description: "تم تحديث بيانات عيادة" });
            }
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
  }, [queryClient, toast]);

  // --- CRUD Operations ---
  // Add clinic
  const addClinic = async (clinic: Clinic) => {
    const { error } = await supabase.from("clinics").insert([clinic]);
    if (error) throw new Error(error.message);
    queryClient.invalidateQueries({ queryKey: ["clinics"] });
  };

  // Update clinic
  const updateClinic = async (id: string, updates: Partial<Clinic>) => {
    const { error } = await supabase.from("clinics").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
    queryClient.invalidateQueries({ queryKey: ["clinics"] });
  };

  // Delete clinic
  const deleteClinic = async (id: string) => {
    const { error } = await supabase.from("clinics").delete().eq("id", id);
    if (error) throw new Error(error.message);
    queryClient.invalidateQueries({ queryKey: ["clinics"] });
  };

  return {
    ...query,
    addClinic,
    updateClinic,
    deleteClinic,
  };
};

// دالة normalization قوية
const normalizeLicenseNumber = (s: string) =>
  s.trim()
   .toUpperCase()
   .replace(/[\u2013\u2014\u2212\u2010\u2011\u2012\u2015]/g, '-') // جميع أنواع الشرطة إلى - عادي
   .replace(/\s+/g, ''); // أزل جميع المسافات

// License verification remains Supabase-based for now
export const useVerifyLicense = () => {
  const verifyLicense = async (
    licenseNumber: string,
    method: 'qr_scan' | 'manual_entry' | 'image_upload'
  ): Promise<VerificationResult> => {
    const normalizedLicense = licenseNumber.trim().toUpperCase();
    let clinic = null;
    let verificationStatus: 'success' | 'failed' | 'not_found' = 'not_found';

      // البحث في Supabase
      const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("license_number", normalizedLicense);

    if (error) {
      verificationStatus = 'failed';
    } else if (data && data.length > 0) {
      clinic = data[0];
      verificationStatus = 'success';
    } else {
      verificationStatus = 'not_found';
    }

    // تسجيل محاولة التحقق (دائماً في السحابة)
    try {
      await supabase
      .from("verifications")
      .insert({
        clinic_id: clinic?.id,
          license_number: normalizedLicense,
        verification_method: method,
        verification_status: verificationStatus,
        user_agent: navigator.userAgent,
      });
    } catch (e) {}

    const typedClinic = clinic ? {
      ...clinic,
      license_status: clinic.license_status as 'active' | 'expired' | 'suspended' | 'pending'
    } : null;
    return {
      clinic: typedClinic,
      status: verificationStatus,
      licenseNumber: normalizedLicense
    };
  };
  return { verifyLicense };
};
