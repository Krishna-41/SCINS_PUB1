import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { JournalCategory, Journal } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';

export function CategoriesPage() {
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase
        .from('journal_categories')
        .select('*')
        .order('sort_order, name');

      const catList = (cats as unknown as JournalCategory[]) || [];
      setCategories(catList);

      const countMap: Record<string, number> = {};
      await Promise.all(
        catList.map(async (cat) => {
          const { count } = await supabase
            .from('journals')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'published');
          countMap[cat.id] = count || 0;
        })
      );
      setCounts(countMap);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading categories..." />;

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Research Categories</h1>
          <p className="text-navy-500">Browse journals by subject discipline.</p>
        </div>
      </div>
      <div className="container-wide py-8">
        {categories.length === 0 ? (
          <EmptyState title="No categories defined yet" description="Journal categories will appear here once created." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/journals?cat=${cat.id}`}>
                <Card hover className="h-full">
                  <CardBody>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-navy-900">{cat.name}</h3>
                        <p className="text-xs text-navy-400">{counts[cat.id] || 0} journal(s)</p>
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-navy-500 line-clamp-2">{cat.description}</p>
                    )}
                    <div className="mt-3 text-sm text-teal-600 font-medium inline-flex items-center gap-1">
                      Browse journals <ArrowRight size={14} />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
