import { useState } from 'react';
import { Users } from 'lucide-react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { ChildListDialog } from '@/components/admin/ChildListDialog';
import type { Field } from '@/components/admin/FieldInput';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import type { Conference, ConferenceSpeaker } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const fields: Field[] = [
  { name: 'name', label: 'Conference name', type: 'text', required: true },
  { name: 'acronym', label: 'Acronym', type: 'text', half: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    half: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  { name: 'theme', label: 'Theme', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
  { name: 'topics', label: 'Topics', type: 'tags' },
  { name: 'organizing_institution', label: 'Organizing institution', type: 'text' },
  { name: 'venue', label: 'Venue', type: 'text', half: true },
  { name: 'city', label: 'City', type: 'text', half: true },
  { name: 'country', label: 'Country', type: 'text', half: true },
  { name: 'timezone', label: 'Timezone', type: 'text', half: true, hint: 'e.g. Asia/Kolkata' },
  { name: 'start_date', label: 'Start date', type: 'date', half: true },
  { name: 'end_date', label: 'End date', type: 'date', half: true },
  { name: 'registration_open', label: 'Registration opens', type: 'date', half: true },
  { name: 'registration_close', label: 'Registration closes', type: 'date', half: true },
  { name: 'abstract_deadline', label: 'Abstract deadline', type: 'date', half: true },
  { name: 'early_bird_deadline', label: 'Early-bird deadline', type: 'date', half: true },
  { name: 'call_for_papers', label: 'Call for papers', type: 'textarea', rows: 5 },
  { name: 'registration_info', label: 'Registration information', type: 'textarea', rows: 4 },
  { name: 'program_info', label: 'Programme information', type: 'textarea', rows: 4 },
  { name: 'contact_email', label: 'Contact email', type: 'email', half: true },
  { name: 'website_url', label: 'Website URL', type: 'url', half: true },
  { name: 'logo_url', label: 'Logo', type: 'image', folder: 'conferences/logos' },
  { name: 'banner_url', label: 'Banner', type: 'image', folder: 'conferences/banners' },
  { name: 'sort_order', label: 'Sort order', type: 'number', half: true },
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
];

const speakerFields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, half: true },
  { name: 'title', label: 'Title / role', type: 'text', half: true },
  { name: 'affiliation', label: 'Affiliation', type: 'text' },
  { name: 'bio', label: 'Biography', type: 'textarea', rows: 4 },
  { name: 'photo_url', label: 'Photo', type: 'image', folder: 'conferences/speakers' },
  { name: 'sort_order', label: 'Display order', type: 'number', half: true },
];

export function ConferencesAdmin() {
  const [speakersFor, setSpeakersFor] = useState<Conference | null>(null);

  return (
    <>
      <ResourceManager<Conference>
        table="conferences"
        title="Conferences"
        singular="Conference"
        description="Academic conferences, deadlines and speakers."
        searchKeys={['name', 'acronym', 'city', 'country']}
        defaultSort={{ key: 'start_date', dir: 'desc' }}
        slugFrom="name"
        dialogSize="xl"
        defaults={{ status: 'draft', sort_order: 0 }}
        fields={fields}
        columns={[
          { key: 'name', label: 'Name', sortable: true, render: (c) => <span className="font-medium text-navy-900">{c.name}</span> },
          { key: 'location', label: 'Location', render: (c) => [c.city, c.country].filter(Boolean).join(', ') || '—' },
          { key: 'start_date', label: 'Starts', sortable: true, render: (c) => formatDate(c.start_date) },
          { key: 'abstract_deadline', label: 'Abstract due', render: (c) => formatDate(c.abstract_deadline) },
          { key: 'status', label: 'Status', sortable: true, render: (c) => <StatusBadge status={c.status} /> },
        ]}
        rowActions={(c) => (
          <Button variant="ghost" size="sm" onClick={() => setSpeakersFor(c)} aria-label="Speakers" title="Speakers">
            <Users size={15} />
          </Button>
        )}
      />
      {speakersFor && (
        <ChildListDialog
          open
          onClose={() => setSpeakersFor(null)}
          title={`Speakers — ${speakersFor.acronym || speakersFor.name}`}
          table="conference_speakers"
          foreignKey="conference_id"
          parentId={speakersFor.id}
          orderKey="sort_order"
          fields={speakerFields}
          primary={(r) => (r as unknown as ConferenceSpeaker).name}
          secondary={(r) => `${(r as unknown as ConferenceSpeaker).title} · ${(r as unknown as ConferenceSpeaker).affiliation}`}
        />
      )}
    </>
  );
}
