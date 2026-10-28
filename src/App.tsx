import { type ReactNode, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/States';
import { PublicLayout } from '@/components/site/PublicLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';

import { HomePage } from '@/pages/public/HomePage';
import { JournalsPage } from '@/pages/public/JournalsPage';
import { JournalDetailPage } from '@/pages/public/JournalDetailPage';
import { CategoriesPage } from '@/pages/public/CategoriesPage';
import { ArticlesPage } from '@/pages/public/ArticlesPage';
import { ArticleDetailPage } from '@/pages/public/ArticleDetailPage';
import { BooksPage } from '@/pages/public/BooksPage';
import { ConferencesListPage, ConferenceDetailPage } from '@/pages/public/ConferencesPage';
import { ConferenceRegisterPage, ConferenceSubmitAbstractPage } from '@/pages/public/ConferenceActionsPage';
import { NewsListPage, NewsDetailPage } from '@/pages/public/NewsPage';
import { CmsPageView } from '@/pages/public/CmsPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { SearchPage } from '@/pages/public/SearchPage';
import { SubmitPage } from '@/pages/public/SubmitPage';
import { SitemapPage } from '@/pages/public/SitemapPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';

import { DashboardPage } from '@/pages/admin/DashboardPage';
import { JournalsAdmin } from '@/pages/admin/JournalsAdmin';
import { ArticlesAdmin } from '@/pages/admin/ArticlesAdmin';
import { IssuesAdmin } from '@/pages/admin/IssuesAdmin';
import { CategoriesAdmin } from '@/pages/admin/CategoriesAdmin';
import { BooksAdmin } from '@/pages/admin/BooksAdmin';
import { ConferencesAdmin } from '@/pages/admin/ConferencesAdmin';
import { NewsAdmin } from '@/pages/admin/NewsAdmin';
import { CmsPagesAdmin } from '@/pages/admin/CmsPagesAdmin';
import { MediaAdmin } from '@/pages/admin/MediaAdmin';
import { MessagesAdmin } from '@/pages/admin/MessagesAdmin';
import { NewsletterAdmin } from '@/pages/admin/NewsletterAdmin';
import { UsersAdmin } from '@/pages/admin/UsersAdmin';
import { SettingsAdmin } from '@/pages/admin/SettingsAdmin';

function Public({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Checking your session…" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            {/* Public site */}
            <Route path="/" element={<Public><HomePage /></Public>} />
            <Route path="/journals" element={<Public><JournalsPage /></Public>} />
            <Route path="/journals/:slug" element={<Public><JournalDetailPage /></Public>} />
            <Route path="/categories" element={<Public><CategoriesPage /></Public>} />
            <Route path="/articles" element={<Public><ArticlesPage /></Public>} />
            <Route path="/articles/:slug" element={<Public><ArticleDetailPage /></Public>} />
            <Route path="/books" element={<Public><BooksPage /></Public>} />
            <Route path="/conferences" element={<Public><ConferencesListPage /></Public>} />
            <Route path="/conferences/:slug" element={<Public><ConferenceDetailPage /></Public>} />
            <Route path="/conferences/:slug/register" element={<Public><ConferenceRegisterPage /></Public>} />
            <Route path="/conferences/:slug/submit" element={<Public><ConferenceSubmitAbstractPage /></Public>} />
            <Route path="/news" element={<Public><NewsListPage /></Public>} />
            <Route path="/news/:slug" element={<Public><NewsDetailPage /></Public>} />
            <Route path="/pages/:slug" element={<Public><CmsPageView /></Public>} />
            <Route path="/contact" element={<Public><ContactPage /></Public>} />
            <Route path="/search" element={<Public><SearchPage /></Public>} />
            <Route path="/submit" element={<Public><SubmitPage /></Public>} />
            <Route path="/sitemap" element={<Public><SitemapPage /></Public>} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="journals" element={<JournalsAdmin />} />
              <Route path="articles" element={<ArticlesAdmin />} />
              <Route path="issues" element={<IssuesAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="books" element={<BooksAdmin />} />
              <Route path="conferences" element={<ConferencesAdmin />} />
              <Route path="news" element={<NewsAdmin />} />
              <Route path="pages" element={<CmsPagesAdmin />} />
              <Route path="media" element={<MediaAdmin />} />
              <Route path="contact" element={<MessagesAdmin />} />
              <Route path="newsletter" element={<NewsletterAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            <Route path="*" element={<Public><NotFoundPage /></Public>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
