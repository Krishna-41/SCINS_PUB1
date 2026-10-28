import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select('*, journal:journals(*)', { count: 'exact' })
      .in('status', ['published', 'corrected', 'retracted']);

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`);
    }

    query
      .order('published_date', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .then(({ data, count }) => {
        setArticles((data as unknown as Article[]) || []);
        setTotal(count || 0);
        setLoading(false);
      });
  }, [search, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Latest Articles</h1>
          <p className="text-navy-500">Recently published research across all SCINS MEDIA journals.</p>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="relative mb-8 max-w-xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="search"
            placeholder="Search articles by title or abstract..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-navy-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none"
          />
        </div>

        {loading ? (
          <LoadingSpinner label="Loading articles..." />
        ) : articles.length === 0 ? (
          <EmptyState title="No articles found" description="Try a different search term. New articles are published regularly." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <Link key={article.id} to={`/articles/${article.slug}`}>
                  <Card hover className="h-full">
                    <CardBody>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="info">{article.article_type}</Badge>
                        {article.journal && (
                          <Link
                            to={`/journals/${article.journal.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                          >
                            {article.journal.short_title || article.journal.title}
                          </Link>
                        )}
                      </div>
                      <h2 className="text-base font-serif font-bold text-navy-900 mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-navy-500 line-clamp-3 mb-3">{article.abstract}</p>
                      <div className="flex items-center gap-3 text-xs text-navy-400">
                        {article.published_date && (
                          <span>{new Date(article.published_date).toLocaleDateString()}</span>
                        )}
                        {article.doi && <span>DOI: {article.doi}</span>}
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
