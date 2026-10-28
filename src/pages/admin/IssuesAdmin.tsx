import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Field } from '@/components/admin/FieldInput';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import type { Issue, Journal } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type IssueRow = Issue & { journal?: Pick<Journal, 'title' | 'short_title'> | null };

const fields: Field[] = [
  { name: 'journal_id', label: 'Journal', type: 'relation', required: true, relation: { table: 'journals', labelKey: 'title' } },
  { name: 'volume', label: 'Volume', type: 'text', required: true, half: true },
  { name: 'issue_number', label: 'Issue number', type: 'text', required: true, half: true },
  { name: 'year', label: 'Year', type: 'number', required: true, half: true },
  { name: 'published_date', label: 'Published date', type: 'date', half: true },
  { name: 'title', label: 'Issue title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { name: 'is_special_issue', label: 'Special issue', type: 'checkbox', half: true },
  { name: 'guest_editors', label: 'Guest editors', type: 'text', half: true },
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
  { name: 'sort_order', label: 'Sort order', type: 'number', half: true },
  { name: 'cover_image_url', label: 'Cover image', type: 'image', folder: 'issues' },
];

export function IssuesAdmin() {
  return (
    <ResourceManager<IssueRow>
      table="issues"
      title="Issues"
      singular="Issue"
      description="Volumes and issues for each journal."
      select="*, journal:journals(title, short_title)"
      searchKeys={['title', 'volume', 'issue_number']}
      defaultSort={{ key: 'year', dir: 'desc' }}
      defaults={{ status: 'draft', year: new Date().getFullYear(), sort_order: 0, is_special_issue: false }}
      fields={fields}
      columns={[
        { key: 'journal', label: 'Journal', render: (i) => <span className="font-medium text-navy-900">{i.journal?.short_title || i.journal?.title || '—'}</span> },
        { key: 'volume', label: 'Volume / Issue', render: (i) => `Vol ${i.volume}, No ${i.issue_number}` },
        { key: 'year', label: 'Year', sortable: true },
        { key: 'special', label: 'Type', render: (i) => (i.is_special_issue ? <Badge variant="teal">Special</Badge> : <Badge>Regular</Badge>) },
        { key: 'status', label: 'Status', sortable: true, render: (i) => <StatusBadge status={i.status} /> },
        { key: 'published_date', label: 'Published', render: (i) => formatDate(i.published_date) },
      ]}
    />
  );
}
