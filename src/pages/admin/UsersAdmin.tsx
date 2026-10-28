import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import type { Profile, UserRole } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const PAGE_SIZE = 20;
const roles: UserRole[] = ['super_admin', 'admin', 'editor', 'reviewer', 'author', 'reader'];

export function UsersAdmin() {
  const { show } = useToast();
  const { profile: me } = useAuth();
  const [rows, setRows] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase.from('profiles').select('*', { count: 'exact' });
    const term = search.trim().replace(/[,()%]/g, ' ');
    if (term) q = q.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
    const from = (page - 1) * PAGE_SIZE;
    const { data, error: err, count } = await q.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (err) setError(err.message);
    else {
      setRows((data as Profile[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const update = async (p: Profile, patch: Partial<Pick<Profile, 'role' | 'is_active'>>) => {
    if (p.id === me?.id) {
      show('error', "You can't change your own role or status.");
      return;
    }
    const { error: err } = await supabase.from('profiles').update(patch).eq('id', p.id);
    if (err) show('error', err.message);
    else {
      show('success', 'User updated');
      load();
    }
  };

  return (
    <div>
      <PageHeader title="Users" description="Manage roles and account access. Only admins can change roles." />
      <Card className="p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          className="mb-4 w-full max-w-sm rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none"
        />
        {error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : (
          <DataTable<Profile>
            loading={loading}
            data={rows}
            emptyMessage="No users found"
            columns={[
              {
                key: 'full_name',
                label: 'User',
                render: (p) => (
                  <div>
                    <p className="font-medium text-navy-900">{p.full_name || '—'}</p>
                    <p className="text-xs text-navy-400">{p.email}</p>
                  </div>
                ),
              },
              {
                key: 'role',
                label: 'Role',
                render: (p) => (
                  <select
                    value={p.role}
                    disabled={p.id === me?.id}
                    onChange={(e) => update(p, { role: e.target.value as UserRole })}
                    className="rounded-md border border-navy-200 bg-white px-2 py-1 text-sm capitalize disabled:bg-navy-50"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                ),
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (p) => (
                  <button
                    disabled={p.id === me?.id}
                    onClick={() => update(p, { is_active: !p.is_active })}
                    className="disabled:cursor-not-allowed"
                    title={p.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {p.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="error">Disabled</Badge>}
                  </button>
                ),
              },
              { key: 'created_at', label: 'Joined', render: (p) => formatDate(p.created_at) },
            ]}
          />
        )}
        <p className="text-xs text-navy-400 mt-3">{total} total</p>
        <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} onPageChange={setPage} />
      </Card>
    </div>
  );
}
