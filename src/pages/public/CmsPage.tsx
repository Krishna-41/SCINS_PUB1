import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CmsPage as CmsPageType } from '@/lib/types';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';

export function CmsPageView() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CmsPageType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        setPage((data as unknown as CmsPageType) || null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LoadingSpinner label="Loading page..." />;

  if (!page) {
    return (
      <div className="container-wide py-20">
        <EmptyState
          title="Page not found"
          description="This page may not exist or has been removed."
          action={<Link to="/" className="text-teal-600 font-medium">Back to home</Link>}
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
            <span className="text-navy-600 truncate">{page.title}</span>
          </nav>
        </div>
        <div className="container-wide pb-8">
          <div className="flex items-center gap-2 mb-2">
            {page.page_type === 'policy' && <FileText size={18} className="text-teal-600" />}
          </div>
          <h1 className="text-3xl font-serif font-bold text-navy-900">{page.title}</h1>
        </div>
      </div>
      <div className="container-prose py-8">
        {page.content ? (
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <p className="text-navy-400">This page has no content yet.</p>
        )}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-teal-600 font-medium mt-8">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
