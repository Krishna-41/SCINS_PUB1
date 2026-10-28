import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, FileText, BookOpen, Mic, Newspaper } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Article, Journal, NewsItem, Conference } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    (async () => {
      const [aRes, jRes, nRes, cRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*, journal:journals(*)')
          .in('status', ['published', 'corrected'])
          .or(`title.ilike.%${query}%,abstract.ilike.%${query}%,keywords.cs.{${query}}`)
          .limit(10),
        supabase
          .from('journals')
          .select('*, category:journal_categories(*)')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,scope.ilike.%${query}%`)
          .limit(10),
        supabase
          .from('news_items')
          .select('*')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('conferences')
          .select('*')
          .eq('status', 'published')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,theme.ilike.%${query}%`)
          .limit(5),
      ]);
      setArticles((aRes.data as unknown as Article[]) || []);
      setJournals((jRes.data as unknown as Journal[]) || []);
      setNews((nRes.data as unknown as NewsItem[]) || []);
      setConferences((cRes.data as unknown as Conference[]) || []);
      setLoading(false);
    })();
  }, [query]);

  const total = articles.length + journals.length + news.length + conferences.length;

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Search Results</h1>
          <p className="text-navy-500">
            {query && <span>Results for "<span className="font-medium text-navy-700">{query}</span>" — </span>}
            {total} item(s) found
          </p>
        </div>
      </div>

      <div className="container-wide py-8 space-y-10">
        {loading ? (
          <LoadingSpinner label="Searching..." />
        ) : total === 0 ? (
          <EmptyState title="No results found" description="Try different keywords or browse our journals and articles directly." />
        ) : (
          <>
            {journals.length > 0 && (
              <section>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-teal-600" /> Journals ({journals.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {journals.map((j) => (
                    <Link key={j.id} to={`/journals/${j.slug}`}>
                      <Card hover><CardBody>
                        <h3 className="text-base font-serif font-bold text-navy-900 mb-1">{j.title}</h3>
                        <p className="text-sm text-navy-500 line-clamp-2">{j.description}</p>
                      </CardBody></Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-teal-600" /> Articles ({articles.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((a) => (
                    <Link key={a.id} to={`/articles/${a.slug}`}>
                      <Card hover><CardBody>
                        <h3 className="text-base font-serif font-bold text-navy-900 mb-1 line-clamp-2">{a.title}</h3>
                        <p className="text-sm text-navy-500 line-clamp-2">{a.abstract}</p>
                      </CardBody></Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {conferences.length > 0 && (
              <section>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Mic size={20} className="text-teal-600" /> Conferences ({conferences.length})
                </h2>
                <div className="space-y-4">
                  {conferences.map((c) => (
                    <Link key={c.id} to={`/conferences/${c.slug}`}>
                      <Card hover><CardBody>
                        <h3 className="text-base font-serif font-bold text-navy-900">{c.name}</h3>
                        <p className="text-sm text-navy-500 line-clamp-2">{c.theme || c.description}</p>
                      </CardBody></Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {news.length > 0 && (
              <section>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Newspaper size={20} className="text-teal-600" /> News ({news.length})
                </h2>
                <div className="space-y-4">
                  {news.map((n) => (
                    <Link key={n.id} to={`/news/${n.slug}`}>
                      <Card hover><CardBody>
                        <h3 className="text-base font-serif font-bold text-navy-900">{n.title}</h3>
                        <p className="text-sm text-navy-500 line-clamp-2">{n.excerpt}</p>
                      </CardBody></Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
