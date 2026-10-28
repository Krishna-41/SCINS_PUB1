import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface SettingDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'toggle';
  hint?: string;
}

const groups: { title: string; description: string; items: SettingDef[] }[] = [
  {
    title: 'General',
    description: 'Name and description used across the website.',
    items: [
      { key: 'site_name', label: 'Site name' },
      { key: 'site_tagline', label: 'Tagline' },
      { key: 'site_description', label: 'Site description', type: 'textarea' },
    ],
  },
  {
    title: 'Announcement bar',
    description: 'A banner shown at the top of every public page.',
    items: [
      { key: 'announcement_bar_active', label: 'Show announcement bar', type: 'toggle' },
      { key: 'announcement_bar', label: 'Announcement text' },
    ],
  },
  {
    title: 'Homepage hero',
    description: 'Headline section on the homepage.',
    items: [
      { key: 'hero_title', label: 'Hero title' },
      { key: 'hero_description', label: 'Hero description', type: 'textarea' },
      { key: 'hero_cta_primary_text', label: 'Primary button text' },
      { key: 'hero_cta_primary_url', label: 'Primary button link' },
      { key: 'hero_cta_secondary_text', label: 'Secondary button text' },
      { key: 'hero_cta_secondary_url', label: 'Secondary button link' },
    ],
  },
  {
    title: 'Footer & contact',
    description: 'Contact details and social links.',
    items: [
      { key: 'footer_about', label: 'About text', type: 'textarea' },
      { key: 'footer_contact_email', label: 'Contact email' },
      { key: 'footer_phone', label: 'Phone' },
      { key: 'footer_address', label: 'Address', type: 'textarea' },
      { key: 'social_twitter', label: 'Twitter / X URL' },
      { key: 'social_linkedin', label: 'LinkedIn URL' },
      { key: 'social_facebook', label: 'Facebook URL' },
      { key: 'copyright_text', label: 'Copyright text' },
    ],
  },
];

export function SettingsAdmin() {
  const { show } = useToast();
  const { settings, loading } = useSiteSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) setValues(settings);
  }, [loading, settings]);

  const save = async () => {
    setSaving(true);
    const rows = groups.flatMap((g) => g.items).map((i) => ({
      setting_key: i.key,
      setting_value: values[i.key] ?? '',
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'setting_key' });
    setSaving(false);
    if (error) show('error', error.message);
    else show('success', 'Settings saved');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Site-wide content and contact details."
        actions={
          <Button onClick={save} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
          </Button>
        }
      />
      <div className="space-y-6">
        {groups.map((g) => (
          <Card key={g.title}>
            <CardBody className="space-y-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-navy-900">{g.title}</h2>
                <p className="text-sm text-navy-500">{g.description}</p>
              </div>
              {g.items.map((item) =>
                item.type === 'toggle' ? (
                  <label key={item.key} className="flex items-center gap-2.5 text-sm font-medium text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-navy-300 text-teal-600 focus:ring-teal-400"
                      checked={values[item.key] === 'true'}
                      onChange={(e) => setValues((v) => ({ ...v, [item.key]: String(e.target.checked) }))}
                    />
                    {item.label}
                  </label>
                ) : item.type === 'textarea' ? (
                  <Textarea
                    key={item.key}
                    label={item.label}
                    rows={3}
                    value={values[item.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    key={item.key}
                    label={item.label}
                    value={values[item.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
                  />
                )
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
