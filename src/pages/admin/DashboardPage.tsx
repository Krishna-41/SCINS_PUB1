import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Users, Mail, MessageSquare, ClipboardList, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/States';
import type { Article, ContactMessage } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';

interface Stat {
  label: string;
  table: string;
  to: string;
  icon: LucideIcon;
  filter?: [string, string];
  tone: string;
}

const stats: Stat[] = [
  { label: 'Journals', table: 'journals', to: '/admin/journals', icon: BookOpen, tone: 'bg-teal-100 text-teal-700' },
  { label: 'Articles', table: 'articles', to: '/admin/articles', icon: FileText, tone: 'bg-accent-100 text-accent-700' },
  { label: 'Under review', table: 'articles', to: '/admin/articles', icon: ClipboardList, filter: ['status', 'under_review'], tone: 'bg-warning-100 text-warning-700' },
  { label: 'Users', table: 'profiles', to: '/admin/users', icon: Users, tone: 'bg-teal-100 text-teal-700' },
  { label: 'Unread messages', table: 'contact_messages', to: '/admin/contact', icon: MessageSquare, filter: ['status', 'unread'], tone: 'bg-error-100 text-error-700' },
  { label: 'Subscribers', table: 'newsletter_subscribers', to: '/admin/newsletter', icon: Mail, tone: 'bg-accent-100 text-accent-700' },
];

export function DashboardPage() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState<number[] | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    (async () => {
      const results = await Promise.all(
        stats.map(async (s) => {
          let q = supabase.from(s.table).select('id', { count: 'exact', head: true });
          if (s.filter) q = q.eq(s.filter[0], s.filter[1]);
          const { count } = await q;
          return count ?? 0;
        })
      );
      setCounts(results);

      const [a, m] = await Promise.all([
        supabase.from('articles').select('id,title,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setArticles((a.data as Article[]) ?? []);
      setMessages((m.data as ContactMessage[]) ?? []);
    })();
  }, []);

  if (!counts) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={`Welcome back${profile?.full_name ? ', ' + profile.full_name.split(' ')[0] : ''}`}
        description="Here's what's happening across SCINS MEDIA."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Link key={s.label} to={s.to}>
            <Card hover className="h-full">
              <CardBody className="flex items-center gap-4 !p-5">
                <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${s.tone}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-navy-900 leading-none">{counts[i]}</p>
                  <p className="text-xs text-navy-500 mt-1">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-navy-900">Recent articles</h2>
              <Link to="/admin/articles" className="text-sm text-teal-600 font-medium">
                View all
              </Link>
            </div>
            {articles.length === 0 ? (
              <p className="text-sm text-navy-400">No articles yet.</p>
            ) : (
              <ul className="divide-y divide-navy-50">
                {articles.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{truncate(a.title, 60)}</p>
                      <p className="text-xs text-navy-400">{formatDate(a.created_at)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-navy-900">Latest messages</h2>
              <Link to="/admin/contact" className="text-sm text-teal-600 font-medium">
                View all
              </Link>
            </div>
            {messages.length === 0 ? (
              <p className="text-sm text-navy-400">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-navy-50">
                {messages.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{m.name}</p>
                      <p className="text-xs text-navy-400 truncate">{m.subject || truncate(m.message, 50)}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
