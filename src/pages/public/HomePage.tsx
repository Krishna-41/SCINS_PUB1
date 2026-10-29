import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Users, Globe, ArrowRight, ShieldCheck, CircleCheck as CheckCircle2, Library, ListOrdered } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/useSiteSettings';
import type { Journal, Article, EditorialBoardMember } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';

interface EditorCard {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  country: string;
  photo_url: string;
  board_role: string;
  journalTitle: string;
  journalSlug: string;
}

export function HomePage() {
  const { settings } = useSiteSettings();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editors, setEditors] = useState<EditorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [jRes, aRes] = await Promise.all([
        supabase
          .from('journals')
          .select('*, category:journal_categories(*)')
          .eq('status', 'published')
          .order('sort_order', { ascending: true })
          .limit(6),
        supabase
          .from('articles')
          .select('*, journal:journals(*)')
          .in('status', ['published', 'corrected'])
          .order('published_date', { ascending: false })
          .limit(6),
      ]);
      setJournals((jRes.data as unknown as Journal[]) || []);
      setArticles((aRes.data as unknown as Article[]) || []);

      // Fetch editors-in-chief: gather editorial board members with Editor-in-Chief role
      // across published journals.
      const journalList = (jRes.data as unknown as Journal[]) || [];
      if (journalList.length > 0) {
        const { data: boardData } = await supabase
          .from('editorial_board_members')
          .select('id, name, title, affiliation, country, photo_url, board_role, journal_id')
          .in(
            'journal_id',
            journalList.map((j) => j.id)
          )
          .ilike('board_role', '%editor-in-chief%')
          .order('sort_order', { ascending: true });

        const board = (boardData as unknown as (EditorialBoardMember & { journal_id: string })[]) || [];
        const journalMap = new Map(journalList.map((j) => [j.id, j]));
        const editorCards: EditorCard[] = board
          .map((b) => {
            const j = journalMap.get(b.journal_id);
            if (!j) return null;
            return {
              id: b.id,
              name: b.name,
              title: b.title,
              affiliation: b.affiliation,
              country: b.country,
              photo_url: b.photo_url,
              board_role: b.board_role,
              journalTitle: j.title,
              journalSlug: j.slug,
            } as EditorCard;
          })
          .filter((c): c is EditorCard => c !== null)
          .slice(0, 8);
        setEditors(editorCards);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading homepage..." />;

  const hasArticles = articles.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(20,184,166,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.3) 0%, transparent 50%)'
        }} />
        <div className="container-wide relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-4 py-1.5 mb-6">
              <ShieldCheck size={16} className="text-teal-400" />
              <span className="text-sm text-teal-300 font-medium">Peer-Reviewed Open Access Publishing</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight mb-6">
              {settings.hero_title}
            </h1>
            <p className="text-lg text-navy-200 leading-relaxed mb-8 max-w-2xl">
              {settings.hero_description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                <FileText size={18} />
                Submit Manuscript
              </Link>
              <Link
                to="/indexing"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                <Library size={18} />
                Index &amp; Abstracting
              </Link>
              <Link
                to="/peer-review"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                <ShieldCheck size={18} />
                Peer Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: 'Active Journals', value: journals.length, to: '/journals' },
              { icon: FileText, label: 'Published Articles', value: articles.length, to: '/articles' },
              { icon: Users, label: 'Editors-in-Chief', value: editors.length, to: '/journals' },
              { icon: Globe, label: 'Open Access', value: '100%', to: '/pages/open-access-policy' },
            ].map((stat) => (
              <Link
                key={stat.label}
                to={stat.to}
                className="flex items-center gap-3 group hover:bg-white rounded-lg p-3 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-navy-900">{stat.value}</p>
                  <p className="text-sm text-navy-500">{stat.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Journals */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Featured Journals</h2>
              <p className="text-navy-500">Explore our peer-reviewed open access journals</p>
            </div>
            <Link to="/journals" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {journals.length === 0 ? (
            <EmptyState title="No journals published yet" description="Check back soon for new journal launches." />
          ) : (
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
                      ) : journal.logo_url ? (
                        <div className="w-full h-40 rounded-lg bg-navy-50 flex items-center justify-center mb-4">
                          <img src={journal.logo_url} alt={journal.title} className="max-h-32 max-w-[80%] object-contain" />
                        </div>
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-gradient-to-br from-navy-100 to-teal-50 flex items-center justify-center mb-4">
                          <BookOpen className="h-12 w-12 text-navy-300" />
                        </div>
                      )}
                      <h3 className="text-lg font-serif font-bold text-navy-900 mb-2 line-clamp-2">
                        {journal.title}
                      </h3>
                      {(journal.description || journal.scope) && (
                        <p className="text-sm text-navy-500 line-clamp-2 mb-3">
                          {journal.description || journal.scope}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-navy-400 flex-wrap">
                        {journal.issn && <span>ISSN: {journal.issn}</span>}
                        {journal.publication_model && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-medium">
                            {journal.publication_model}
                          </span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editors-in-Chief */}
      {editors.length > 0 && (
        <section className="bg-navy-50 py-16 lg:py-20">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Editors-in-Chief</h2>
                <p className="text-navy-500">Distinguished researchers leading our journals</p>
              </div>
              <Link to="/journals" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                View all journals <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {editors.map((editor) => (
                <Card key={editor.id} hover className="h-full">
                  <CardBody className="text-center">
                    {editor.photo_url ? (
                      <img
                        src={editor.photo_url}
                        alt={editor.name}
                        className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-2 border-teal-100"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-100 to-navy-100 flex items-center justify-center mx-auto mb-4 border-2 border-teal-100">
                        <Users className="h-10 w-10 text-navy-400" />
                      </div>
                    )}
                    <h3 className="text-base font-serif font-bold text-navy-900">{editor.name}</h3>
                    {editor.board_role && (
                      <p className="text-xs text-teal-600 font-medium mt-1">{editor.board_role}</p>
                    )}
                    {editor.affiliation && (
                      <p className="text-xs text-navy-500 mt-2 line-clamp-2">{editor.affiliation}</p>
                    )}
                    {editor.country && (
                      <p className="text-xs text-navy-400 mt-1">{editor.country}</p>
                    )}
                    <Link
                      to={`/journals/${editor.journalSlug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      {editor.journalTitle} <ArrowRight size={12} />
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Publishing workflow */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Our Publishing Process</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              A rigorous, transparent workflow ensuring the highest scientific standards
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Submit', desc: 'Authors submit manuscripts through our online system with metadata and files.' },
              { icon: Users, title: 'Peer Review', desc: 'Expert reviewers evaluate the manuscript through a structured review process.' },
              { icon: ShieldCheck, title: 'Decision', desc: 'Editors make publication decisions based on reviewer recommendations.' },
              { icon: Globe, title: 'Publish', desc: 'Accepted articles are published as open access with immediate availability.' },
            ].map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-white rounded-xl border border-navy-100 p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white mx-auto mb-4">
                    <step.icon size={26} />
                  </div>
                  <div className="text-xs font-bold text-teal-600 mb-1">STEP {i + 1}</div>
                  <h3 className="text-lg font-serif font-bold text-navy-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-navy-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {hasArticles && (
        <section className="bg-navy-50 py-16 lg:py-20">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Latest Publications</h2>
                <p className="text-navy-500">Recently published research articles</p>
              </div>
              <Link to="/articles" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Link key={article.id} to={`/articles/${article.slug}`}>
                  <Card hover className="h-full">
                    <CardBody>
                      <div className="flex items-center gap-2 mb-3">
                        {article.journal && (
                          <Link
                            to={`/journals/${article.journal.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-teal-600 hover:text-teal-700"
                          >
                            {article.journal.short_title || article.journal.title}
                          </Link>
                        )}
                        <span className="text-xs text-navy-300">|</span>
                        <span className="text-xs text-navy-400">{article.article_type}</span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-navy-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.abstract && (
                        <p className="text-sm text-navy-500 line-clamp-3 mb-3">{article.abstract}</p>
                      )}
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
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-10 lg:p-14 text-center">
            <Library className="h-12 w-12 text-teal-400 mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-white mb-3">
              Ready to publish your research?
            </h2>
            <p className="text-navy-200 max-w-xl mx-auto mb-6">
              Submit your manuscript to SCINS MEDIA and join a community of researchers
              committed to open access scientific publishing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                <FileText size={18} />
                Submit Manuscript
              </Link>
              <Link
                to="/peer-review"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <ShieldCheck size={18} />
                Peer Review Process
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
