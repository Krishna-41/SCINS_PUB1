import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Journal, JournalCategory } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';

export function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    supabase
      .from('journal_categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories((data as unknown as JournalCategory[]) || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('journals')
      .select('*, category:journal_categories(*)', { count: 'exact' })
      .eq('status', 'published');

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,scope.ilike.%${search}%`);
    }
    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }

    query
      .order('sort_order', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .then(({ data, count }) => {
        setJournals((data as unknown as Journal[]) || []);
        setTotal(count || 0);
        setLoading(false);
      });
  }, [search, categoryFilter, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Journal Directory</h1>
          <p className="text-navy-500 max-w-2xl">
            Browse our peer-reviewed open access journals across all scientific disciplines.
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              placeholder="Search journals..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-navy-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading journals..." />
        ) : journals.length === 0 ? (
          <EmptyState
            title="No journals found"
            description="Try adjusting your search or filters. New journals are added regularly."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journals.map((journal) => (
                <Link key={journal.id} to={`/journals/${journal.slug}`}>
                  <Card hover className="h-full">
                    <CardBody>
                      {journal.cover_image_url ? (
                        <img
                          src={journal.cover_image_url}
                          alt={journal.title}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-gradient-to-br from-navy-100 to-teal-50 flex items-center justify-center mb-4">
                          <BookOpen className="h-12 w-12 text-navy-300" />
                        </div>
                      )}
                      <h3 className="text-lg font-serif font-bold text-navy-900 mb-2 line-clamp-2">
                        {journal.title}
                      </h3>
                      <p className="text-sm text-navy-500 line-clamp-2 mb-3">
                        {journal.description || journal.scope || 'View journal for full scope and aims.'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {journal.category && (
                          <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 font-medium">
                            {journal.category.name}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-medium">
                          {journal.publication_model}
                        </span>
                        {journal.issn && (
                          <span className="text-navy-400">ISSN: {journal.issn}</span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
