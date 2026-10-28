import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Users,
  Globe,
  ArrowRight,
  Mic,
  ShieldCheck,
  CheckCircle2,
  Library,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/useSiteSettings';
import type { Journal, Article, NewsItem, Conference } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';

export function HomePage() {
  const { settings } = useSiteSettings();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [jRes, aRes, nRes, cRes] = await Promise.all([
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
        supabase
          .from('news_items')
          .select('*')
          .eq('status', 'published')
          .order('published_date', { ascending: false })
          .limit(4),
        supabase
          .from('conferences')
          .select('*')
          .eq('status', 'published')
          .order('start_date', { ascending: true })
          .limit(3),
      ]);
      setJournals((jRes.data as unknown as Journal[]) || []);
      setArticles((aRes.data as unknown as Article[]) || []);
      setNews((nRes.data as unknown as NewsItem[]) || []);
      setConferences((cRes.data as unknown as Conference[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading homepage..." />;

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
                to={settings.hero_cta_primary_url || '/submit'}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                <FileText size={18} />
                {settings.hero_cta_primary_text || 'Submit Manuscript'}
              </Link>
              <Link
                to={settings.hero_cta_secondary_url || '/journals'}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                <BookOpen size={18} />
                {settings.hero_cta_secondary_text || 'Browse Journals'}
                <ArrowRight size={16} />
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
              { icon: Mic, label: 'Upcoming Conferences', value: conferences.length, to: '/conferences' },
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
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-gradient-to-br from-navy-100 to-teal-50 flex items-center justify-center mb-4">
                          <BookOpen className="h-12 w-12 text-navy-300" />
                        </div>
                      )}
                      <h3 className="text-lg font-serif font-bold text-navy-900 mb-2 line-clamp-2">
                        {journal.title}
                      </h3>
                      <p className="text-sm text-navy-500 line-clamp-2 mb-3">
                        {journal.description || journal.scope || 'No description available'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-navy-400">
                        {journal.issn && <span>ISSN: {journal.issn}</span>}
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-medium">
                          {journal.publication_model}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Publishing workflow */}
      <section className="bg-navy-50 py-16 lg:py-20">
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
      <section className="py-16 lg:py-20">
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
          {articles.length === 0 ? (
            <EmptyState title="No articles published yet" description="Published articles will appear here." />
          ) : (
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
                      <p className="text-sm text-navy-500 line-clamp-3 mb-3">
                        {article.abstract || 'No abstract available'}
                      </p>
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
          )}
        </div>
      </section>

      {/* Conferences + News */}
      <section className="bg-navy-50 py-16 lg:py-20">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Conferences */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-navy-900">Upcoming Conferences</h2>
                <Link to="/conferences" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              {conferences.length === 0 ? (
                <EmptyState title="No upcoming conferences" description="New conferences will be listed here." />
              ) : (
                <div className="space-y-4">
                  {conferences.map((conf) => (
                    <Link key={conf.id} to={`/conferences/${conf.slug}`}>
                      <Card hover>
                        <CardBody className="flex items-start gap-4">
                          {conf.logo_url ? (
                            <img src={conf.logo_url} alt={conf.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                              <Mic className="h-7 w-7 text-teal-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-serif font-bold text-navy-900 mb-1">{conf.name}</h3>
                            <p className="text-sm text-navy-500 line-clamp-2 mb-2">{conf.theme || conf.description}</p>
                            <div className="flex items-center gap-3 text-xs text-navy-400">
                              {conf.start_date && (
                                <span>{new Date(conf.start_date).toLocaleDateString()}</span>
                              )}
                              {conf.city && <span>{conf.city}, {conf.country}</span>}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* News */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-navy-900">News & Announcements</h2>
                <Link to="/news" className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              {news.length === 0 ? (
                <EmptyState title="No news published yet" description="News and announcements will appear here." />
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <Link key={item.id} to={`/news/${item.slug}`}>
                      <Card hover>
                        <CardBody>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">
                              {item.news_type.replace(/_/g, ' ')}
                            </span>
                            {item.published_date && (
                              <span className="text-xs text-navy-400">
                                {new Date(item.published_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-serif font-bold text-navy-900 mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-navy-500 line-clamp-2">{item.excerpt}</p>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
                to="/pages/author-guidelines"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Author Guidelines
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
