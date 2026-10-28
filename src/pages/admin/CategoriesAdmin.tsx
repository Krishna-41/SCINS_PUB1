import { ResourceManager } from '@/components/admin/ResourceManager';
import type { JournalCategory } from '@/lib/types';

export function CategoriesAdmin() {
  return (
    <ResourceManager<JournalCategory>
      table="journal_categories"
      title="Categories"
      singular="Category"
      description="Subject categories used to group journals."
      searchKeys={['name', 'description']}
      defaultSort={{ key: 'sort_order', dir: 'asc' }}
      slugFrom="name"
      defaults={{ sort_order: 0 }}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { name: 'sort_order', label: 'Sort order', type: 'number', half: true },
      ]}
      columns={[
        { key: 'name', label: 'Name', sortable: true, render: (c) => <span className="font-medium text-navy-900">{c.name}</span> },
        { key: 'slug', label: 'Slug', render: (c) => <code className="text-xs text-navy-500">{c.slug}</code> },
        { key: 'sort_order', label: 'Order', sortable: true },
      ]}
    />
  );
}
