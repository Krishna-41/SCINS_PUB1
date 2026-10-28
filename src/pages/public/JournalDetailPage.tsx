import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, FileText, Users, Mail, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Journal, Article, Issue, EditorialBoardMember } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

type Tab = 'overview' | 'articles' | 'issues' | 'editorial' | 'charges';

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [board, setBoard] = useState<EditorialBoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data: j } = await supabase
        .from('journals')
        .select('*, category:journal_categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!j) {
        setLoading(false);
        return;
      }

      setJournal(j as unknown as Journal);

      const [aRes, iRes, bRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*')
          .eq('journal_id', j.id)
          .in('status', ['published', 'corrected', 'retracted'])
          .order('published_date', { ascending: false })
          .limit(20),
        supabase
          .from('issues')
          .select('*')
          .eq('journal_id', j.id)
          .eq('status', 'published')
          .order('year', { ascending: false }),
        supabase
          .from('editorial_board_members')
          .select('*')
          .eq('journal_id', j.id)
          .order('sort_order', { ascending: true }),
      ]);

      setArticles((aRes.data as unknown as Article[]) || []);
      setIssues((iRes.data as unknown as Issue[]) || []);
      setBoard((bRes.data as unknown as EditorialBoardMember[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <LoadingSpinner label="Loading journal..." />;

  if (!journal) {
    return (
      <div className="container-wide py-20">
        <EmptyState
          title="Journal not found"
          description="This journal may not exist or is not yet published."
          action={<Link to="/journals" className="text-teal-600 hover:text-teal-700 font-medium">Back to journals</Link>}
        />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'articles', label: 'Articles' },
    { key: 'issues', label: 'Issues' },
    { key: 'editorial', label: 'Editorial Board' },
    { key: 'charges', label: 'Charges' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="container-wide py-12">
          <div className="flex flex-col md:flex-row gap-6">
            {journal.cover_image_url ? (
              <img
                src={journal.cover_image_url}
                alt={journal.title}
                className="w-32 h-44 object-cover rounded-lg shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-44 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-12 w-12 text-teal-400" />
              </div>
            )}
            <div className="flex-1">
              {journal.category && (
                <Link
                  to={`/categories?cat=${journal.category.slug}`}
                  className="text-sm text-teal-300 hover:text-teal-200 mb-2 inline-block"
                >
                  {journal.category.name}
                </Link>
              )}
              <h1 className="text-3xl font-serif font-bold mb-3">{journal.title}</h1>
              {journal.short_title && (
                <p className="text-navy-300 text-sm mb-3">Short title: {journal.short_title}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-navy-200">
                {journal.issn && <span>ISSN: {journal.issn}</span>}
                {journal.eissn && <span>eISSN: {journal.eissn}</span>}
                <Badge variant="teal">{journal.publication_model}</Badge>
                <Badge>{journal.frequency}</Badge>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <FileText size={16} />
                  Submit Manuscript
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-100 bg-white sticky top-16 z-30">
        <div className="container-wide">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-500 hover:text-navy-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        {tab === 'overview' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">Aims & Scope</h2>
              <p className="text-navy-700 leading-relaxed">{journal.description || 'No description available.'}</p>
            </div>
            {journal.scope && (
              <div>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">Scope</h2>
                <p className="text-navy-700 leading-relaxed">{journal.scope}</p>
              </div>
            )}
            {journal.keywords.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {journal.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-navy-50 text-navy-600 text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {journal.editor_in_chief && (
                <div className="rounded-lg border border-navy-100 p-4">
                  <p className="text-xs text-navy-400 mb-1">Editor-in-Chief</p>
                  <p className="text-sm font-medium text-navy-700">{journal.editor_in_chief}</p>
                </div>
              )}
              {journal.managing_editor && (
                <div className="rounded-lg border border-navy-100 p-4">
                  <p className="text-xs text-navy-400 mb-1">Managing Editor</p>
                  <p className="text-sm font-medium text-navy-700">{journal.managing_editor}</p>
                </div>
              )}
              {journal.editorial_contact && (
                <div className="rounded-lg border border-navy-100 p-4">
                  <p className="text-xs text-navy-400 mb-1">Editorial Contact</p>
                  <p className="text-sm font-medium text-navy-700">{journal.editorial_contact}</p>
                </div>
              )}
              <div className="rounded-lg border border-navy-100 p-4">
                <p className="text-xs text-navy-400 mb-1">Peer Review Model</p>
                <p className="text-sm font-medium text-navy-700">{journal.peer_review_model}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'articles' && (
          <div>
            {articles.length === 0 ? (
              <EmptyState title="No articles published yet" description="Articles will appear here once published." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <Link key={article.id} to={`/articles/${article.slug}`}>
                    <Card hover>
                      <CardBody>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info">{article.article_type}</Badge>
                          {article.published_date && (
                            <span className="text-xs text-navy-400">
                              {new Date(article.published_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-serif font-bold text-navy-900 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-navy-500 line-clamp-3">{article.abstract}</p>
                        {article.doi && (
                          <p className="text-xs text-teal-600 mt-2">DOI: {article.doi}</p>
                        )}
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'issues' && (
          <div>
            {issues.length === 0 ? (
              <EmptyState title="No issues published yet" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {issues.map((issue) => (
                  <Card key={issue.id}>
                    <CardBody>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-navy-400" />
                        <span className="text-sm font-medium text-navy-700">
                          Vol {issue.volume}, Issue {issue.issue_number} ({issue.year})
                        </span>
                      </div>
                      {issue.title && <h3 className="text-base font-serif font-bold text-navy-900 mb-2">{issue.title}</h3>}
                      {issue.description && <p className="text-sm text-navy-500 line-clamp-2">{issue.description}</p>}
                      {issue.is_special_issue && <Badge variant="warning" size="sm">Special Issue</Badge>}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'editorial' && (
          <div>
            {board.length === 0 ? (
              <EmptyState title="Editorial board not yet announced" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {board.map((member) => (
                  <Card key={member.id}>
                    <CardBody className="flex items-start gap-4">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="h-16 w-16 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                          <Users className="h-7 w-7 text-navy-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-serif font-bold text-navy-900">{member.name}</h3>
                        <p className="text-xs text-teal-600 font-medium mb-1">{member.board_role}</p>
                        {member.title && <p className="text-xs text-navy-500">{member.title}</p>}
                        {member.affiliation && <p className="text-xs text-navy-400">{member.affiliation}</p>}
                        {member.country && <p className="text-xs text-navy-400">{member.country}</p>}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'charges' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-navy-100 p-6">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">Article Processing Charges</h2>
              {journal.apc_amount > 0 ? (
                <p className="text-2xl font-serif font-bold text-teal-600">
                  {journal.apc_currency} {journal.apc_amount.toLocaleString()}
                </p>
              ) : (
                <p className="text-lg text-navy-700">No publication charges — free to publish and free to read.</p>
              )}
              {journal.waiver_info && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-navy-700 mb-1">Waiver Information</h3>
                  <p className="text-sm text-navy-500">{journal.waiver_info}</p>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-navy-100 p-6">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">Copyright & License</h2>
              <p className="text-sm text-navy-600">
                <strong>Copyright Holder:</strong> {journal.copyright_holder}
              </p>
              <p className="text-sm text-navy-600 mt-2">
                <strong>License:</strong> {journal.license_type}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
