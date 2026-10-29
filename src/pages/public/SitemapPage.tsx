import { Link } from 'react-router-dom';

const sections: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Publishing',
    links: [
      { to: '/journals', label: 'Journals' },
      { to: '/categories', label: 'Subject categories' },
      { to: '/articles', label: 'Articles' },
      { to: '/search', label: 'Search' },
    ],
  },
  {
    title: 'Authors & Review',
    links: [
      { to: '/submit', label: 'Submit a manuscript' },
      { to: '/peer-review', label: 'Peer review process' },
      { to: '/indexing', label: 'Index & abstracting' },
      { to: '/pages/author-guidelines', label: 'Author guidelines' },
    ],
  },
  {
    title: 'About',
    links: [
      { to: '/pages/about', label: 'About SCINS MEDIA' },
      { to: '/contact', label: 'Contact us' },
      { to: '/pages/privacy-policy', label: 'Privacy policy' },
      { to: '/pages/terms-conditions', label: 'Terms & conditions' },
      { to: '/pages/accessibility-statement', label: 'Accessibility statement' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Sign in' },
      { to: '/signup', label: 'Create an account' },
    ],
  },
];

export function SitemapPage() {
  return (
    <div className="container-wide py-12">
      <h1 className="text-3xl font-serif font-bold text-navy-900 mb-8">Sitemap</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-serif font-bold text-navy-800 mb-3">{s.title}</h2>
            <ul className="space-y-2">
              {s.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-teal-600 hover:text-teal-700 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
