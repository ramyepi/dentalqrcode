
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define SiteSetting type locally
export interface SiteSetting {
  key: string;
  value: string | null;
  description?: string | null;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      // Fetch only from Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      if (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
      return data as SiteSetting[];
    },
  });
};

export const useSiteSetting = (key: string) => {
  const { data: settings, isLoading, error } = useSiteSettings();
  
  const setting = settings?.find(s => s.key === key);
  
  return {
    value: setting?.value || null,
    isLoading,
    error
  };
};
