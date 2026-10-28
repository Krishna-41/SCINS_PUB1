import { ResourceManager } from '@/components/admin/ResourceManager';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import type { CmsPage } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function CmsPagesAdmin() {
  return (
    <ResourceManager<CmsPage>
      table="cms_pages"
      title="CMS Pages"
      singular="Page"
      description="Static pages such as policies, guidelines and legal notices. Published at /pages/<slug>."
      searchKeys={['title', 'slug']}
      defaultSort={{ key: 'sort_order', dir: 'asc' }}
      slugFrom="title"
      dialogSize="xl"
      defaults={{ status: 'draft', page_type: 'static', sort_order: 0 }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        {
          name: 'page_type',
          label: 'Page type',
          type: 'select',
          half: true,
          options: [
            { value: 'static', label: 'Static' },
            { value: 'policy', label: 'Policy' },
            { value: 'guideline', label: 'Guideline' },
            { value: 'legal', label: 'Legal' },
            { value: 'landing', label: 'Landing' },
          ],
        },
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
        { name: 'content', label: 'Content', type: 'textarea', rows: 14 },
        { name: 'sort_order', label: 'Sort order', type: 'number', half: true },
        { name: 'seo_title', label: 'SEO title', type: 'text' },
        { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
      ]}
      columns={[
        { key: 'title', label: 'Title', sortable: true, render: (p) => <span className="font-medium text-navy-900">{p.title}</span> },
        { key: 'slug', label: 'URL', render: (p) => <code className="text-xs text-navy-500">/pages/{p.slug}</code> },
        { key: 'page_type', label: 'Type', render: (p) => <Badge variant="info">{p.page_type}</Badge> },
        { key: 'status', label: 'Status', sortable: true, render: (p) => <StatusBadge status={p.status} /> },
        { key: 'updated_at', label: 'Updated', sortable: true, render: (p) => formatDate(p.updated_at) },
      ]}
    />
  );
}
