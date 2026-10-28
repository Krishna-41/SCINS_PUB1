import { useState } from 'react';
import { Users } from 'lucide-react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { ChildListDialog } from '@/components/admin/ChildListDialog';
import type { Field } from '@/components/admin/FieldInput';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import type { EditorialBoardMember, Journal } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'discontinued', label: 'Discontinued' },
];

const fields: Field[] = [
  { name: 'title', label: 'Journal title', type: 'text', required: true },
  { name: 'short_title', label: 'Short title', type: 'text', half: true },
  { name: 'journal_code', label: 'Journal code', type: 'text', half: true },
  { name: 'issn', label: 'ISSN (print)', type: 'text', half: true },
  { name: 'eissn', label: 'eISSN (online)', type: 'text', half: true },
  { name: 'category_id', label: 'Category', type: 'relation', relation: { table: 'journal_categories', labelKey: 'name', nullable: true }, half: true },
  { name: 'status', label: 'Status', type: 'select', options: statusOptions, half: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { name: 'scope', label: 'Aims & scope', type: 'textarea', rows: 5 },
  { name: 'keywords', label: 'Keywords', type: 'tags' },
  { name: 'language', label: 'Language', type: 'text', half: true },
  { name: 'frequency', label: 'Frequency', type: 'text', half: true, hint: 'e.g. Quarterly' },
  { name: 'publication_model', label: 'Publication model', type: 'text', half: true },
  { name: 'peer_review_model', label: 'Peer-review model', type: 'text', half: true },
  { name: 'editor_in_chief', label: 'Editor-in-chief', type: 'text', half: true },
  { name: 'managing_editor', label: 'Managing editor', type: 'text', half: true },
  { name: 'editorial_contact', label: 'Editorial contact email', type: 'email' },
  { name: 'apc_amount', label: 'APC amount', type: 'number', half: true },
  { name: 'apc_currency', label: 'APC currency', type: 'text', half: true },
  { name: 'waiver_info', label: 'Waiver information', type: 'textarea', rows: 3 },
  { name: 'copyright_holder', label: 'Copyright holder', type: 'text', half: true },
  { name: 'license_type', label: 'License', type: 'text', half: true, hint: 'e.g. CC BY 4.0' },
  { name: 'cover_image_url', label: 'Cover image', type: 'image', folder: 'journals/covers' },
  { name: 'logo_url', label: 'Logo', type: 'image', folder: 'journals/logos' },
  { name: 'banner_url', label: 'Banner', type: 'image', folder: 'journals/banners' },
  { name: 'sort_order', label: 'Sort order', type: 'number', half: true },
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
];

const boardFields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, half: true },
  { name: 'title', label: 'Title', type: 'text', half: true, hint: 'e.g. Prof. Dr.' },
  { name: 'board_role', label: 'Role', type: 'text', half: true, hint: 'e.g. Associate Editor' },
  { name: 'affiliation', label: 'Affiliation', type: 'text', half: true },
  { name: 'country', label: 'Country', type: 'text', half: true },
  { name: 'email', label: 'Email', type: 'email', half: true },
  { name: 'photo_url', label: 'Photo', type: 'image', folder: 'editorial-board' },
  { name: 'sort_order', label: 'Display order', type: 'number', half: true },
];

export function JournalsAdmin() {
  const [board, setBoard] = useState<Journal | null>(null);

  return (
    <>
      <ResourceManager<Journal>
        table="journals"
        title="Journals"
        singular="Journal"
        description="Manage journals, their policies and editorial boards."
        select="*, category:journal_categories(name)"
        searchKeys={['title', 'short_title', 'issn', 'journal_code']}
        defaultSort={{ key: 'sort_order', dir: 'asc' }}
        slugFrom="title"
        dialogSize="xl"
        defaults={{
          status: 'draft',
          language: 'English',
          apc_currency: 'USD',
          apc_amount: 0,
          sort_order: 0,
          license_type: 'CC BY 4.0',
        }}
        fields={fields}
        columns={[
          { key: 'title', label: 'Title', sortable: true, render: (j) => <span className="font-medium text-navy-900">{j.title}</span> },
          { key: 'issn', label: 'ISSN', render: (j) => j.issn || '—' },
          { key: 'category', label: 'Category', render: (j) => j.category?.name ?? '—' },
          { key: 'status', label: 'Status', sortable: true, render: (j) => <StatusBadge status={j.status} /> },
          { key: 'updated_at', label: 'Updated', sortable: true, render: (j) => formatDate(j.updated_at) },
        ]}
        rowActions={(j) => (
          <Button variant="ghost" size="sm" onClick={() => setBoard(j)} aria-label="Editorial board" title="Editorial board">
            <Users size={15} />
          </Button>
        )}
      />
      {board && (
        <ChildListDialog
          open
          onClose={() => setBoard(null)}
          title={`Editorial board — ${board.short_title || board.title}`}
          table="editorial_board_members"
          foreignKey="journal_id"
          parentId={board.id}
          orderKey="sort_order"
          fields={boardFields}
          primary={(r) => `${(r as unknown as EditorialBoardMember).title ? (r as unknown as EditorialBoardMember).title + ' ' : ''}${(r as unknown as EditorialBoardMember).name}`}
          secondary={(r) => `${(r as unknown as EditorialBoardMember).board_role} · ${(r as unknown as EditorialBoardMember).affiliation}`}
          defaults={{ board_role: 'Editorial Board Member' }}
        />
      )}
    </>
  );
}
