import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSetting } from '@/lib/types';

type SettingsMap = Record<string, string>;

const defaultSettings: SettingsMap = {
  site_name: 'SCINS MEDIA',
  site_tagline: 'Scientific Publishing & Academic Conferences',
  site_description: 'SCINS MEDIA is an open-access scientific publishing platform.',
  announcement_bar: '',
  announcement_bar_active: 'false',
  hero_title: 'Advancing Scientific Research Through Open Access Publishing',
  hero_description:
    'SCINS MEDIA publishes peer-reviewed journals, organizes academic conferences, and supports researchers through a rigorous editorial process.',
  hero_cta_primary_text: 'Submit Manuscript',
  hero_cta_primary_url: '/submit',
  hero_cta_secondary_text: 'Browse Journals',
  hero_cta_secondary_url: '/journals',
  footer_about: 'SCINS MEDIA is an open-access publisher of peer-reviewed scientific journals and academic conferences.',
  footer_contact_email: 'info@scinsmedia.com',
  footer_phone: '',
  footer_address: '',
  social_twitter: '',
  social_linkedin: '',
  social_facebook: '',
  copyright_text: 'SCINS MEDIA. All rights reserved.',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SettingsMap>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) {
        console.error('Failed to load site settings:', error.message);
        setLoading(false);
        return;
      }
      const map: SettingsMap = { ...defaultSettings };
      (data as SiteSetting[]).forEach((s) => {
        map[s.setting_key] = s.setting_value;
      });
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  return { settings, loading };
}
