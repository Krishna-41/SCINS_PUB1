import { useCallback, useEffect, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import type { NewsletterSubscriber } from '@/lib/types';

const PAGE_SIZE = 20;

export function NewsletterAdmin() {
  const { show } = useToast();
  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (page - 1) * PAGE_SIZE;
    const { data, error: err, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (err) setError(err.message);
    else {
      setRows((data as NewsletterSubscriber[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (s: NewsletterSubscriber) => {
    if (!window.confirm(`Remove ${s.email} from the list?`)) return;
    const { error: err } = await supabase.from('newsletter_subscribers').delete().eq('id', s.id);
    if (err) show('error', err.message);
    else {
      show('success', 'Subscriber removed');
      load();
    }
  };

  const exportCsv = async () => {
    const { data, error: err } = await supabase
      .from('newsletter_subscribers')
      .select('email,is_confirmed,created_at')
      .order('created_at', { ascending: false });
    if (err || !data) {
      show('error', err?.message ?? 'Export failed');
      return;
    }
    const csv = ['email,confirmed,subscribed_at', ...data.map((r) => `"${String(r.email).replace(/"/g, '""')}",${r.is_confirmed},${r.created_at}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Newsletter"
        description="People who subscribed from the website footer."
        actions={
          <Button variant="outline" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </Button>
        }
      />
      <Card className="p-4">
        {error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : (
          <DataTable<NewsletterSubscriber>
            loading={loading}
            data={rows}
            emptyMessage="No subscribers yet"
            columns={[
              { key: 'email', label: 'Email', render: (s) => <span className="font-medium text-navy-900">{s.email}</span> },
              { key: 'is_confirmed', label: 'Status', render: (s) => (s.is_confirmed ? <Badge variant="success">Confirmed</Badge> : <Badge variant="warning">Unconfirmed</Badge>) },
              { key: 'created_at', label: 'Subscribed', render: (s) => new Date(s.created_at).toLocaleDateString() },
              {
                key: 'actions',
                label: '',
                className: 'text-right',
                render: (s) => (
                  <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" onClick={() => remove(s)} aria-label="Remove">
                    <Trash2 size={15} />
                  </Button>
                ),
              },
            ]}
          />
        )}
        <p className="text-xs text-navy-400 mt-3">{total} total</p>
        <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} onPageChange={setPage} />
      </Card>
    </div>
  );
}
