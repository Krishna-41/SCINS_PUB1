import { ResourceManager } from '@/components/admin/ResourceManager';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import type { NewsItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const typeOptions = [
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'call_for_papers', label: 'Call for papers' },
  { value: 'special_issue', label: 'Special issue' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'press_release', label: 'Press release' },
];

export function NewsAdmin() {
  return (
    <ResourceManager<NewsItem>
      table="news_items"
      title="News"
      singular="News item"
      description="News, announcements and calls for papers."
      searchKeys={['title', 'excerpt']}
      defaultSort={{ key: 'published_date', dir: 'desc' }}
      slugFrom="title"
      dialogSize="xl"
      defaults={{ status: 'draft', news_type: 'news', published_date: new Date().toISOString().slice(0, 10) }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'news_type', label: 'Type', type: 'select', options: typeOptions, half: true },
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
        { name: 'published_date', label: 'Publish date', type: 'date', half: true },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
        { name: 'content', label: 'Content', type: 'textarea', rows: 10 },
        { name: 'image_url', label: 'Featured image', type: 'image', folder: 'news' },
        { name: 'seo_title', label: 'SEO title', type: 'text' },
        { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
      ]}
      columns={[
        { key: 'title', label: 'Title', sortable: true, render: (n) => <span className="font-medium text-navy-900">{n.title}</span> },
        { key: 'news_type', label: 'Type', render: (n) => <Badge variant="info">{n.news_type.replace(/_/g, ' ')}</Badge> },
        { key: 'status', label: 'Status', sortable: true, render: (n) => <StatusBadge status={n.status} /> },
        { key: 'published_date', label: 'Date', sortable: true, render: (n) => formatDate(n.published_date) },
      ]}
    />
  );
}
