import { useState } from 'react';
import { Users } from 'lucide-react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { ChildListDialog } from '@/components/admin/ChildListDialog';
import type { Field } from '@/components/admin/FieldInput';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import type { Article, ArticleAuthor } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'published', label: 'Published' },
  { value: 'corrected', label: 'Corrected' },
  { value: 'retracted', label: 'Retracted' },
  { value: 'archived', label: 'Archived' },
];

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'subtitle', label: 'Subtitle', type: 'text' },
  { name: 'journal_id', label: 'Journal', type: 'relation', required: true, half: true, relation: { table: 'journals', labelKey: 'title' } },
  {
    name: 'issue_id',
    label: 'Issue',
    type: 'relation',
    half: true,
    relation: {
      table: 'issues',
      labelKey: 'year',
      select: 'id, year, volume, issue_number, journal:journals(short_title)',
      label: (r) => {
        const j = r.journal as { short_title?: string } | null;
        return `${j?.short_title ? j.short_title + ' — ' : ''}Vol ${r.volume}, No ${r.issue_number} (${r.year})`;
      },
      nullable: true,
    },
  },
  { name: 'article_type', label: 'Article type', type: 'text', half: true, hint: 'e.g. Research Article, Review' },
  { name: 'status', label: 'Status', type: 'select', options: statusOptions, half: true },
  { name: 'abstract', label: 'Abstract', type: 'textarea', rows: 6 },
  { name: 'content', label: 'Full text (HTML / plain)', type: 'textarea', rows: 8 },
  { name: 'keywords', label: 'Keywords', type: 'tags' },
  { name: 'doi', label: 'DOI', type: 'text', half: true },
  { name: 'page_range', label: 'Page range', type: 'text', half: true },
  { name: 'received_date', label: 'Received', type: 'date', half: true },
  { name: 'revised_date', label: 'Revised', type: 'date', half: true },
  { name: 'accepted_date', label: 'Accepted', type: 'date', half: true },
  { name: 'published_date', label: 'Published', type: 'date', half: true },
  { name: 'pdf_url', label: 'PDF', type: 'file', accept: '.pdf', folder: 'articles/pdf' },
  { name: 'html_url', label: 'HTML full-text URL', type: 'url' },
  { name: 'funding', label: 'Funding', type: 'textarea', rows: 2 },
  { name: 'acknowledgments', label: 'Acknowledgments', type: 'textarea', rows: 2 },
  { name: 'conflict_of_interest', label: 'Conflict of interest', type: 'textarea', rows: 2 },
  { name: 'ethics_approval', label: 'Ethics approval', type: 'textarea', rows: 2 },
  { name: 'data_availability', label: 'Data availability', type: 'textarea', rows: 2 },
  { name: 'license_type', label: 'License', type: 'text', half: true },
  { name: 'copyright_holder', label: 'Copyright holder', type: 'text', half: true },
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
];

const authorFields: Field[] = [
  { name: 'author_name', label: 'Full name', type: 'text', required: true, half: true },
  { name: 'email', label: 'Email', type: 'email', half: true },
  { name: 'affiliation', label: 'Affiliation', type: 'text', half: true },
  { name: 'country', label: 'Country', type: 'text', half: true },
  { name: 'orcid', label: 'ORCID', type: 'text', half: true, hint: '0000-0000-0000-0000' },
  { name: 'author_order', label: 'Author order', type: 'number', half: true },
  { name: 'is_corresponding', label: 'Corresponding author', type: 'checkbox' },
];

export function ArticlesAdmin() {
  const [authorsFor, setAuthorsFor] = useState<Article | null>(null);

  return (
    <>
      <ResourceManager<Article>
        table="articles"
        title="Articles"
        singular="Article"
        description="Create, review and publish articles."
        select="*, journal:journals(title, short_title)"
        searchKeys={['title', 'doi', 'abstract']}
        slugFrom="title"
        dialogSize="xl"
        defaults={{ status: 'draft', article_type: 'Research Article', sort_order: 0, license_type: 'CC BY 4.0' }}
        fields={fields}
        columns={[
          { key: 'title', label: 'Title', sortable: true, render: (a) => <span className="font-medium text-navy-900">{truncate(a.title, 70)}</span> },
          { key: 'journal', label: 'Journal', render: (a) => a.journal?.short_title || a.journal?.title || '—' },
          { key: 'article_type', label: 'Type' },
          { key: 'status', label: 'Status', sortable: true, render: (a) => <StatusBadge status={a.status} /> },
          { key: 'published_date', label: 'Published', sortable: true, render: (a) => formatDate(a.published_date) },
        ]}
        rowActions={(a) => (
          <Button variant="ghost" size="sm" onClick={() => setAuthorsFor(a)} aria-label="Authors" title="Authors">
            <Users size={15} />
          </Button>
        )}
      />
      {authorsFor && (
        <ChildListDialog
          open
          onClose={() => setAuthorsFor(null)}
          title={`Authors — ${truncate(authorsFor.title, 50)}`}
          table="article_authors"
          foreignKey="article_id"
          parentId={authorsFor.id}
          orderKey="author_order"
          fields={authorFields}
          primary={(r) => `${(r as unknown as ArticleAuthor).author_name}${(r as unknown as ArticleAuthor).is_corresponding ? ' *' : ''}`}
          secondary={(r) => (r as unknown as ArticleAuthor).affiliation}
        />
      )}
    </>
  );
}
