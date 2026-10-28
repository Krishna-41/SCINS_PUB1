import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { NewsItem } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('news_items')
      .select('*')
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .then(({ data }) => {
        setNews((data as unknown as NewsItem[]) || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Loading news..." />;

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">News & Announcements</h1>
          <p className="text-navy-500">Latest updates from SCINS MEDIA.</p>
        </div>
      </div>
      <div className="container-wide py-8">
        {news.length === 0 ? (
          <EmptyState title="No news published yet" description="News and announcements will appear here." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.slug}`}>
                <Card hover className="h-full">
                  <CardBody>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                    )}
                    <Badge variant="teal">{item.news_type.replace(/_/g, ' ')}</Badge>
                    <h2 className="text-lg font-serif font-bold text-navy-900 mt-3 mb-2 line-clamp-2">{item.title}</h2>
                    <p className="text-sm text-navy-500 line-clamp-3 mb-3">{item.excerpt}</p>
                    {item.published_date && (
                      <span className="flex items-center gap-1 text-xs text-navy-400">
                        <Calendar size={14} />
                        {new Date(item.published_date).toLocaleDateString()}
                      </span>
                    )}
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

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('news_items')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setItem((data as unknown as NewsItem) || null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LoadingSpinner label="Loading article..." />;
  if (!item) {
    return (
      <div className="container-wide py-20">
        <EmptyState
          title="News article not found"
          action={<Link to="/news" className="text-teal-600 font-medium">Back to news</Link>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm text-navy-400">
            <Link to="/" className="hover:text-navy-600">Home</Link>
            <ChevronRight size={14} />
            <Link to="/news" className="hover:text-navy-600">News</Link>
            <ChevronRight size={14} />
            <span className="text-navy-600 truncate">{item.title}</span>
          </nav>
        </div>
      </div>
      <article className="container-prose py-8">
        <Badge variant="teal">{item.news_type.replace(/_/g, ' ')}</Badge>
        <h1 className="text-3xl font-serif font-bold text-navy-900 mt-3 mb-3">{item.title}</h1>
        {item.published_date && (
          <p className="text-sm text-navy-400 mb-6">
            Published: {new Date(item.published_date).toLocaleDateString()}
          </p>
        )}
        {item.image_url && (
          <img src={item.image_url} alt={item.title} className="w-full rounded-xl mb-6" />
        )}
        {item.excerpt && <p className="text-lg text-navy-600 mb-6 leading-relaxed">{item.excerpt}</p>}
        {item.content && (
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-teal-600 font-medium mt-8">
          <ArrowLeft size={16} /> Back to news
        </Link>
      </article>
    </div>
  );
}
