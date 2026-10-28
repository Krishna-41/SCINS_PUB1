import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, Calendar, Tag, ExternalLink, ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Article, PublicArticleAuthor  } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [authors, setAuthors] = useState<PublicArticleAuthor []>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, journal:journals(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!data) {
        setLoading(false);
        return;
      }

      setArticle(data as unknown as Article);

      const { data: authorData } = await supabase
        .from('article_authors')
        .select('id, article_id, author_name, affiliation, country, is_corresponding, author_order, orcid, created_at')
        .eq('article_id', data.id)
        .order('author_order', { ascending: true });

      setAuthors((authorData as unknown as PublicArticleAuthor[]) || []);


      await supabase
        .from('articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <LoadingSpinner label="Loading article..." />;

  if (!article) {
    return (
      <div className="container-wide py-20">
        <EmptyState
          title="Article not found"
          description="This article may not exist or is not yet published."
          action={<Link to="/articles" className="text-teal-600 hover:text-teal-700 font-medium">Back to articles</Link>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm text-navy-400">
            <Link to="/" className="hover:text-navy-600">Home</Link>
            <ChevronRight size={14} />
            <Link to="/articles" className="hover:text-navy-600">Articles</Link>
            <ChevronRight size={14} />
            <span className="text-navy-600 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <article className="container-prose py-8">
        {/* Article header */}
        <div className="mb-8">
          {article.journal && (
            <Link
              to={`/journals/${article.journal.slug}`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium mb-3 inline-block"
            >
              {article.journal.title}
            </Link>
          )}
          <h1 className="text-3xl font-serif font-bold text-navy-900 mb-4 leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-lg text-navy-500 mb-4">{article.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="info">{article.article_type}</Badge>
            {article.status === 'retracted' && <Badge variant="error">Retracted</Badge>}
            {article.status === 'corrected' && <Badge variant="warning">Corrected</Badge>}
            {article.published_date && (
              <span className="flex items-center gap-1 text-sm text-navy-400">
                <Calendar size={14} />
                Published: {new Date(article.published_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Authors */}
          {authors.length > 0 && (
            <div className="border-l-4 border-teal-200 pl-4 py-2 mb-4">
              <p className="text-sm text-navy-700">
                {authors.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ', '}
                    <span className="font-medium">{a.author_name}</span>
                    {a.is_corresponding && <sup>*</sup>}
                    {a.affiliation && <sup className="text-navy-400 text-xs"> [{i + 1}]</sup>}
                  </span>
                ))}
              </p>
              {authors.some((a) => a.is_corresponding) && (
                <p className="text-xs text-navy-400 mt-1">* Corresponding author</p>
              )}
            </div>
          )}

          {article.doi && (
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
            >
              DOI: {article.doi}
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Abstract */}
        {article.abstract && (
          <div className="mb-8">
            <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">Abstract</h2>
            <div className="rounded-lg bg-navy-50/50 border border-navy-100 p-6">
              <p className="text-navy-700 leading-relaxed">{article.abstract}</p>
            </div>
          </div>
        )}

        {/* Keywords */}
        {article.keywords.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-navy-400" />
              <span className="text-sm font-medium text-navy-700">Keywords:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full content */}
        {article.content && (
          <div className="mb-8 prose-content" dangerouslySetInnerHTML={{ __html: article.content }} />
        )}

        {/* Article metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {article.received_date && (
            <Card><CardBody className="py-3 px-4"><p className="text-xs text-navy-400">Received</p><p className="text-sm font-medium text-navy-700">{new Date(article.received_date).toLocaleDateString()}</p></CardBody></Card>
          )}
          {article.accepted_date && (
            <Card><CardBody className="py-3 px-4"><p className="text-xs text-navy-400">Accepted</p><p className="text-sm font-medium text-navy-700">{new Date(article.accepted_date).toLocaleDateString()}</p></CardBody></Card>
          )}
          {article.funding && (
            <Card><CardBody className="py-3 px-4"><p className="text-xs text-navy-400">Funding</p><p className="text-sm font-medium text-navy-700">{article.funding}</p></CardBody></Card>
          )}
          {article.conflict_of_interest && (
            <Card><CardBody className="py-3 px-4"><p className="text-xs text-navy-400">Conflicts of Interest</p><p className="text-sm text-navy-600">{article.conflict_of_interest}</p></CardBody></Card>
          )}
          {article.ethics_approval && (
            <Card><CardBody className="py-3 px-4"><p className="text-xs text-navy-400">Ethics Approval</p><p className="text-sm text-navy-600">{article.ethics_approval}</p></CardBody></Card>
          )}
          {article.data_availability && (
            <Card><CardBody className="py-3 px-4"><p className="text-xs text-navy-400">Data Availability</p><p className="text-sm text-navy-600">{article.data_availability}</p></CardBody></Card>
          )}
        </div>

        {/* License & Downloads */}
        <div className="border-t border-navy-100 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-navy-400">License</p>
            <p className="text-sm font-medium text-navy-700">{article.license_type}</p>
            <p className="text-xs text-navy-400 mt-1">Copyright: {article.copyright_holder}</p>
          </div>
          <div className="flex gap-3">
            {article.pdf_url && (
              <a
                href={article.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={16} />
                Download PDF
              </a>
            )}
            {article.html_url && (
              <a
                href={article.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-navy-200 hover:border-teal-400 text-navy-700 hover:text-teal-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <FileText size={16} />
                View HTML
              </a>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
            <ArrowLeft size={16} />
            Back to all articles
          </Link>
        </div>
      </article>
    </div>
  );
}
