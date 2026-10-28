import { useCallback, useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import type { ContactMessage } from '@/lib/types';
import { truncate } from '@/lib/utils';

const PAGE_SIZE = 15;
const filters = ['all', 'unread', 'read', 'replied', 'archived'] as const;

export function MessagesAdmin() {
  const { show } = useToast();
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ContactMessage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase.from('contact_messages').select('*', { count: 'exact' });
    if (filter !== 'all') q = q.eq('status', filter);
    const from = (page - 1) * PAGE_SIZE;
    const { data, error: err, count } = await q.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (err) setError(err.message);
    else {
      setRows((data as ContactMessage[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (msg: ContactMessage, status: ContactMessage['status']) => {
    const { error: err } = await supabase.from('contact_messages').update({ status }).eq('id', msg.id);
    if (err) {
      show('error', err.message);
      return;
    }
    setActive((cur) => (cur && cur.id === msg.id ? { ...cur, status } : cur));
    load();
  };

  const openMessage = (msg: ContactMessage) => {
    setActive(msg);
    if (msg.status === 'unread') void setStatus(msg, 'read');
  };

  const remove = async (msg: ContactMessage) => {
    if (!window.confirm('Delete this message permanently?')) return;
    const { error: err } = await supabase.from('contact_messages').delete().eq('id', msg.id);
    if (err) show('error', err.message);
    else {
      show('success', 'Message deleted');
      setActive(null);
      load();
    }
  };

  return (
    <div>
      <PageHeader title="Messages" description="Enquiries submitted through the contact form." />
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : (
          <DataTable<ContactMessage>
            loading={loading}
            data={rows}
            onRowClick={openMessage}
            emptyMessage="No messages"
            columns={[
              { key: 'name', label: 'From', render: (m) => <span className={m.status === 'unread' ? 'font-semibold text-navy-900' : ''}>{m.name}</span> },
              { key: 'subject', label: 'Subject', render: (m) => truncate(m.subject || '(no subject)', 60) },
              { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
              { key: 'created_at', label: 'Received', render: (m) => new Date(m.created_at).toLocaleString() },
            ]}
          />
        )}
        <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} onPageChange={setPage} />
      </Card>

      <Dialog open={!!active} onClose={() => setActive(null)} title={active?.subject || 'Message'} size="lg">
        {active && (
          <div className="space-y-4">
            <div className="text-sm text-navy-500 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <strong className="text-navy-800">{active.name}</strong> &lt;{active.email}&gt;
              </span>
              <span>{new Date(active.created_at).toLocaleString()}</span>
              <StatusBadge status={active.status} />
            </div>
            <p className="whitespace-pre-wrap text-sm text-navy-800 bg-navy-50/60 rounded-lg p-4">{active.message}</p>
            <div className="flex flex-wrap gap-2 justify-between pt-2 border-t border-navy-100">
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${active.email}?subject=${encodeURIComponent('Re: ' + (active.subject || ''))}`}
                  onClick={() => setStatus(active, 'replied')}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
                >
                  <Mail size={15} /> Reply by email
                </a>
                <Button variant="outline" onClick={() => setStatus(active, 'unread')}>
                  Mark unread
                </Button>
                <Button variant="outline" onClick={() => setStatus(active, 'archived')}>
                  Archive
                </Button>
              </div>
              <Button variant="danger" onClick={() => remove(active)}>
                <Trash2 size={15} /> Delete
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
