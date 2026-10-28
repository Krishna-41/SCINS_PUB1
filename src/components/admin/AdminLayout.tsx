import { type ReactNode, useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Newspaper,
  Mic,
  Book,
  Settings,
  Users,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  FolderTree,
  Library,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface NavSection {
  label: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard }[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Publishing',
    items: [
      { to: '/admin/journals', label: 'Journals', icon: BookOpen },
      { to: '/admin/articles', label: 'Articles', icon: FileText },
      { to: '/admin/issues', label: 'Issues', icon: Library },
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      { to: '/admin/books', label: 'Books', icon: Book },
    ],
  },
  {
    label: 'Events',
    items: [
      { to: '/admin/conferences', label: 'Conferences', icon: Mic },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/news', label: 'News', icon: Newspaper },
      { to: '/admin/pages', label: 'CMS Pages', icon: FileText },
      { to: '/admin/media', label: 'Media Library', icon: ImageIcon },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/admin/contact', label: 'Messages', icon: MessageSquare },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) return null;

  const isAdmin = profile.role === 'super_admin' || profile.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">Access Denied</h1>
          <p className="text-navy-500 mb-6">
            You don't have permission to access the administration panel.
            Your account role is: <span className="font-medium">{profile.role}</span>
          </p>
          <Link to="/" className="text-teal-600 font-medium">Back to website</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50/50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-950/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-navy-950 text-navy-200 z-50 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-navy-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-navy-950 font-serif font-bold">
              S
            </div>
            <span className="font-serif font-bold text-white text-sm">SCINS Admin</span>
          </Link>
          <button className="lg:hidden text-navy-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="overflow-y-auto h-[calc(100vh-4rem)] py-4 px-2 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-navy-800 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
            >
              <ExternalLink size={18} />
              View Website
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-navy-100 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-navy-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <nav className="hidden sm:flex items-center gap-1 text-sm text-navy-400">
              <Link to="/admin" className="hover:text-navy-600">Admin</Link>
              <ChevronRight size={14} />
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-navy-700">{profile.full_name || profile.email}</p>
              <p className="text-xs text-navy-400 capitalize">{profile.role.replace('_', ' ')}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-sm">
              {(profile.full_name || profile.email).charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
