import { Link } from 'react-router-dom';
import { Mail, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useSiteSettings } from '@/lib/useSiteSettings';

const footerColumns = [
  {
    title: 'Journals',
    links: [
      { label: 'All Journals', to: '/journals' },
      { label: 'Journal Categories', to: '/categories' },
      { label: 'Latest Articles', to: '/articles' },
      { label: 'Submit Manuscript', to: '/submit' },
    ],
  },
  {
    title: 'Conferences',
    links: [
      { label: 'Upcoming Conferences', to: '/conferences' },
      { label: 'Submit Abstract', to: '/conferences/submit' },
      { label: 'Conference Proceedings', to: '/conferences' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Open Access Policy', to: '/pages/open-access-policy' },
      { label: 'Peer Review Policy', to: '/pages/peer-review-policy' },
      { label: 'Publication Ethics', to: '/pages/publication-ethics' },
      { label: 'Privacy Policy', to: '/pages/privacy-policy' },
      { label: 'Terms & Conditions', to: '/pages/terms-conditions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/pages/about' },
      { label: 'News', to: '/news' },
      { label: 'Books', to: '/books' },
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/pages/faq' },
    ],
  },
];

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-navy-950 text-navy-200 mt-auto">
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-navy-950 font-serif font-bold text-lg">
                S
              </div>
              <span className="font-serif font-bold text-white text-lg">
                {settings.site_name}
              </span>
            </div>
            <p className="text-sm text-navy-300 leading-relaxed max-w-xs">
              {settings.footer_about}
            </p>
            <div className="flex items-center gap-3 mt-4">
              {settings.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-400 hover:text-teal-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
              )}
              {settings.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-400 hover:text-teal-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-400 hover:text-teal-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.footer_contact_email && (
                <a
                  href={`mailto:${settings.footer_contact_email}`}
                  className="text-navy-400 hover:text-teal-400 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Footer link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-navy-300 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">
            &copy; {new Date().getFullYear()} {settings.copyright_text}
          </p>
          <div className="flex items-center gap-4 text-xs text-navy-400">
            <Link to="/pages/privacy-policy" className="hover:text-teal-400 transition-colors">
              Privacy
            </Link>
            <Link to="/pages/terms-conditions" className="hover:text-teal-400 transition-colors">
              Terms
            </Link>
            <Link to="/pages/accessibility-statement" className="hover:text-teal-400 transition-colors">
              Accessibility
            </Link>
            <Link to="/sitemap" className="hover:text-teal-400 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
