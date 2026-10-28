import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  BookOpen,
  Mic,
  FileText,
  Info,
  LayoutGrid,
  Phone,
} from 'lucide-react';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { useAuth } from '@/lib/auth';

interface NavItem {
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
  icon?: typeof BookOpen;
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutGrid },
  {
    label: 'Journals',
    to: '/journals',
    icon: BookOpen,
    children: [
      { label: 'All Journals', to: '/journals' },
      { label: 'Journal Categories', to: '/categories' },
      { label: 'Latest Articles', to: '/articles' },
    ],
  },
  {
    label: 'Conferences',
    to: '/conferences',
    icon: Mic,
    children: [
      { label: 'Upcoming Conferences', to: '/conferences' },
      { label: 'Submit Abstract', to: '/conferences/submit' },
    ],
  },
  {
    label: 'Publish',
    to: '/submit',
    icon: FileText,
    children: [
      { label: 'Submit Manuscript', to: '/submit' },
      { label: 'Author Guidelines', to: '/pages/author-guidelines' },
      { label: 'Publication Charges', to: '/pages/publication-charges' },
    ],
  },
  {
    label: 'About',
    to: '/pages/about',
    icon: Info,
    children: [
      { label: 'About SCINS MEDIA', to: '/pages/about' },
      { label: 'Open Access Policy', to: '/pages/open-access-policy' },
      { label: 'Peer Review Policy', to: '/pages/peer-review-policy' },
      { label: 'Publication Ethics', to: '/pages/publication-ethics' },
      { label: 'Plagiarism Policy', to: '/pages/plagiarism-policy' },
      { label: 'Copyright & Licensing', to: '/pages/copyright-licensing' },
    ],
  },
  { label: 'News', to: '/news' },
  { label: 'Books', to: '/books' },
  { label: 'Contact', to: '/contact', icon: Phone },
];

export function Header() {
  const { settings } = useSiteSettings();
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const announcementActive = settings.announcement_bar_active === 'true';
  const announcementText = settings.announcement_bar;

  return (
    <header className="sticky top-0 z-40">
      {announcementActive && announcementText && (
        <div className="bg-teal-700 text-white text-sm text-center py-2 px-4">
          {announcementText}
        </div>
      )}

      <div
        className={`bg-white border-b transition-shadow duration-200 ${
          scrolled ? 'border-navy-100 shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="container-wide flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-teal-400 font-serif font-bold text-lg">
              S
            </div>
            <div className="hidden sm:block">
              <span className="font-serif font-bold text-navy-900 text-lg leading-none">
                {settings.site_name}
              </span>
              <p className="text-xs text-navy-400 leading-none mt-0.5">
                {settings.site_tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.to ? (
                  <Link
                    to={item.to}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 hover:text-teal-600 rounded-lg hover:bg-navy-50 transition-colors"
                  >
                    {item.label}
                    {item.children && <ChevronDown size={14} className="opacity-60" />}
                  </Link>
                ) : (
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 hover:text-teal-600 rounded-lg hover:bg-navy-50 transition-colors">
                    {item.label}
                    <ChevronDown size={14} className="opacity-60" />
                  </button>
                )}
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-1 w-56 animate-slide-down">
                    <div className="bg-white rounded-lg shadow-lg border border-navy-100 py-1.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.to}
                          className="block px-4 py-2 text-sm text-navy-600 hover:text-teal-600 hover:bg-navy-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-40 lg:w-56 rounded-lg border border-navy-200 bg-navy-50/50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
              />
            </form>

            {profile ? (
              <Link
                to={profile.role === 'reader' || profile.role === 'author' ? '/dashboard' : '/admin'}
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
              >
                {profile.role === 'reader' || profile.role === 'author' ? 'Dashboard' : 'Admin'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              className="lg:hidden p-2 text-navy-700 hover:bg-navy-50 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-navy-100 shadow-lg animate-slide-down">
          <div className="container-wide py-4 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-navy-200 bg-navy-50/50 pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:border-teal-400 focus:outline-none"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
              />
            </form>
            {navItems.map((item) => (
              <div key={item.label}>
                {item.to && !item.children ? (
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-navy-700 hover:text-teal-600 hover:bg-navy-50 rounded-lg"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <div className="px-3 py-2.5 text-sm font-medium text-navy-700">
                      {item.label}
                    </div>
                    {item.children && (
                      <div className="pl-6 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 text-sm text-navy-500 hover:text-teal-600 hover:bg-navy-50 rounded-lg"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-navy-100 mt-2">
              {profile ? (
                <Link
                  to={profile.role === 'reader' || profile.role === 'author' ? '/dashboard' : '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg"
                >
                  {profile.role === 'reader' || profile.role === 'author' ? 'Dashboard' : 'Admin Panel'}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
