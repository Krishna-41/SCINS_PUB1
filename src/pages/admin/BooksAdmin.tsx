import { ResourceManager } from '@/components/admin/ResourceManager';
import { StatusBadge } from '@/components/ui/Badge';
import type { Book } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function BooksAdmin() {
  return (
    <ResourceManager<Book>
      table="books"
      title="Books"
      singular="Book"
      description="Books and monographs published by SCINS MEDIA."
      searchKeys={['title', 'authors', 'isbn']}
      slugFrom="title"
      dialogSize="xl"
      defaults={{ status: 'draft', currency: 'USD', price: 0, sort_order: 0, license_type: 'CC BY 4.0' }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'text' },
        { name: 'authors', label: 'Authors / editors', type: 'text', required: true },
        { name: 'isbn', label: 'ISBN', type: 'text', half: true },
        { name: 'category', label: 'Category', type: 'text', half: true },
        { name: 'publisher', label: 'Publisher', type: 'text', half: true },
        { name: 'edition', label: 'Edition', type: 'text', half: true },
        { name: 'publish_date', label: 'Publication date', type: 'date', half: true },
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
        { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
        { name: 'toc', label: 'Table of contents', type: 'textarea', rows: 5 },
        { name: 'price', label: 'Price', type: 'number', half: true },
        { name: 'currency', label: 'Currency', type: 'text', half: true },
        { name: 'license_type', label: 'License', type: 'text', half: true },
        { name: 'sort_order', label: 'Sort order', type: 'number', half: true },
        { name: 'cover_url', label: 'Cover image', type: 'image', folder: 'books/covers' },
        { name: 'preview_url', label: 'Preview PDF', type: 'file', accept: '.pdf', folder: 'books/previews' },
        { name: 'download_url', label: 'Download / purchase URL', type: 'url' },
        { name: 'seo_title', label: 'SEO title', type: 'text' },
        { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2 },
      ]}
      columns={[
        { key: 'title', label: 'Title', sortable: true, render: (b) => <span className="font-medium text-navy-900">{b.title}</span> },
        { key: 'authors', label: 'Authors' },
        { key: 'isbn', label: 'ISBN', render: (b) => b.isbn || '—' },
        { key: 'status', label: 'Status', sortable: true, render: (b) => <StatusBadge status={b.status} /> },
        { key: 'publish_date', label: 'Published', sortable: true, render: (b) => formatDate(b.publish_date) },
      ]}
    />
  );
}
