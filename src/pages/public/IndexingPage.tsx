import { Link } from 'react-router-dom';
import { Library, Database, Search, FileText, ArrowRight, CircleCheck as CheckCircle2, Globe } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { useSiteSettings } from '@/lib/useSiteSettings';

const databases = [
  { name: 'Google Scholar', description: 'Broad academic search engine indexing citations and full texts.', icon: Search },
  { name: 'CrossRef', description: 'DOI registration and citation linking across publishers.', icon: Database },
  { name: 'DOAJ', description: 'Directory of Open Access Journals — quality-controlled open access titles.', icon: Library },
  { name: 'PubMed', description: 'Biomedical and life sciences literature from MEDLINE.', icon: FileText },
  { name: 'Scopus', description: 'Abstract and citation database covering peer-reviewed research.', icon: Database },
  { name: 'Web of Science', description: 'Citation index spanning sciences, social sciences, and arts.', icon: Search },
];

const benefits = [
  'All published articles receive a Digital Object Identifier (DOI) for persistent citation.',
  'Articles are indexed in major academic databases for maximum discoverability.',
  'Full-text XML and PDF versions are deposited for long-term archiving.',
  'Open access licensing ensures free availability to readers worldwide.',
];

export function IndexingPage() {
  const { settings } = useSiteSettings();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(20,184,166,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(14,165,233,0.3) 0%, transparent 50%)'
        }} />
        <div className="container-wide relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-4 py-1.5 mb-6">
              <Library size={16} className="text-teal-400" />
              <span className="text-sm text-teal-300 font-medium">Discoverability &amp; Indexing</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight mb-6">
              Index &amp; Abstracting
            </h1>
            <p className="text-lg text-navy-200 leading-relaxed mb-8 max-w-2xl">
              {settings.site_name} ensures that every published article is broadly discoverable.
              We register DOIs, deposit full texts, and work with leading abstracting and indexing
              databases so your research reaches the widest possible audience.
            </p>
            <Link
              to="/journals"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              Browse Indexed Journals <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Why Indexing Matters</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              Indexing increases the visibility, citation count, and credibility of your published work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-5">
                <CheckCircle2 className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-navy-700">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Databases */}
      <section className="bg-navy-50 py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Indexing Databases</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              {settings.site_name} works toward inclusion in these widely used academic databases.
              Coverage varies per journal and grows as titles mature.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {databases.map((db) => (
              <Card key={db.name} hover className="h-full">
                <CardBody className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 flex-shrink-0">
                    <db.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-navy-900 mb-1">{db.name}</h3>
                    <p className="text-sm text-navy-500">{db.description}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global reach */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-10 lg:p-14 text-center">
            <Globe className="h-12 w-12 text-teal-400 mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-white mb-3">Global Discoverability</h2>
            <p className="text-navy-200 max-w-xl mx-auto mb-6">
              Every article is assigned a DOI, indexed in major databases, and archived for long-term
              access — so your research is found, cited, and built upon by scholars worldwide.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              Submit Manuscript <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
