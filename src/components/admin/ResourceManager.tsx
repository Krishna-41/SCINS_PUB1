import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from './PageHeader';
import { FieldInput, buildPayload, validateRequired, type Field, type FormValues } from './FieldInput';

const PAGE_SIZE = 15;

interface ResourceManagerProps<T extends { id: string }> {
  table: string;
  title: string;
  singular: string;
  description?: string;
  select?: string;
  columns: Column<T>[];
  fields: Field[];
  searchKeys: string[];
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  defaults?: FormValues;
  /** Field whose value is used to auto-generate `slug` on create. */
  slugFrom?: string;
  rowActions?: (item: T) => ReactNode;
  dialogSize?: 'md' | 'lg' | 'xl';
  /** Extra text shown above the form. */
  formNote?: string;
  readOnly?: boolean;
}

export function ResourceManager<T extends { id: string }>({
  table,
  title,
  singular,
  description,
  select = '*',
  columns,
  fields,
  searchKeys,
  defaultSort = { key: 'created_at', dir: 'desc' },
  defaults = {},
  slugFrom,
  rowActions,
  dialogSize = 'lg',
  formNote,
  readOnly = false,
}: ResourceManagerProps<T>) {
  const { show } = useToast();
  const { user } = useAuth();

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [relations, setRelations] = useState<Record<string, { value: string; label: string }[]>>({});

  const searchKey = searchKeys.join(',');
  const relationFields = useMemo(() => fields.filter((f) => f.type === 'relation' && f.relation), [fields]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      const entries: Record<string, { value: string; label: string }[]> = {};
      for (const f of relationFields) {
        const rel = f.relation!;
        const { data } = await supabase
          .from(rel.table)
          .select(rel.select ?? `id, ${rel.labelKey}`)
          .order(rel.labelKey);
        entries[f.name] = ((data as unknown as Record<string, unknown>[]) ?? []).map((r) => ({
          value: r.id as string,
          label: rel.label ? rel.label(r) : String(r[rel.labelKey] ?? ''),
        }));
      }
      setRelations(entries);
    })();
  }, [relationFields]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from(table).select(select, { count: 'exact' });
    if (debounced && searchKey) {
      const term = debounced.replace(/[,()%]/g, ' ');
      query = query.or(searchKey.split(',').map((k) => `${k}.ilike.%${term}%`).join(','));
    }
    const from = (page - 1) * PAGE_SIZE;
    const { data, error: err, count } = await query
      .order(sort.key, { ascending: sort.dir === 'asc' })
      .range(from, from + PAGE_SIZE - 1);
    if (err) {
      setError(err.message);
    } else {
      setRows((data as unknown as T[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [table, select, debounced, searchKey, page, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (key: string) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setValues({ ...defaults });
    setOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    const v: FormValues = {};
    for (const f of fields) {
      const raw = (item as Record<string, unknown>)[f.name];
      v[f.name] = f.type === 'tags' && Array.isArray(raw) ? raw.join(', ') : raw ?? '';
    }
    if ('slug' in (item as object)) v.slug = (item as Record<string, unknown>).slug;
    setValues(v);
    setOpen(true);
  };

  const setValue = (name: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (!editing && slugFrom && name === slugFrom && !prev.__slugTouched) {
        next.slug = slugify(String(value ?? ''));
      }
      if (name === 'slug') next.__slugTouched = true;
      return next;
    });
  };

  const logAudit = async (action: string, entityId: string, details: string) => {
    await supabase.from('audit_logs').insert({
      user_id: user?.id ?? null,
      action,
      entity_type: table,
      entity_id: entityId,
      details,
    });
  };

  const handleSave = async () => {
    const problem = validateRequired(fields, values);
    if (problem) {
      show('error', problem);
      return;
    }
    const payload = buildPayload(fields, values);
    if (slugFrom || 'slug' in values) {
      const slug = String(values.slug ?? '').trim() || slugify(String(values[slugFrom ?? 'title'] ?? ''));
      if (!slug) {
        show('error', 'A slug could not be generated — please fill in the title/name first.');
        return;
      }
      payload.slug = slugify(slug);
    }
    setSaving(true);
    if (editing) {
      const { error: err } = await supabase.from(table).update(payload).eq('id', editing.id);
      setSaving(false);
      if (err) {
        show('error', err.message);
        return;
      }
      void logAudit('update', editing.id, `Updated ${singular}`);
      show('success', `${singular} updated`);
    } else {
      const { data, error: err } = await supabase.from(table).insert(payload).select('id').maybeSingle();
      setSaving(false);
      if (err) {
        show('error', err.message);
        return;
      }
      if (data) void logAudit('create', (data as { id: string }).id, `Created ${singular}`);
      show('success', `${singular} created`);
    }
    setOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error: err } = await supabase.from(table).delete().eq('id', deleting.id);
    if (err) {
      show('error', err.message);
    } else {
      void logAudit('delete', deleting.id, `Deleted ${singular}`);
      show('success', `${singular} deleted`);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    }
    setDeleting(null);
  };

  const allColumns: Column<T>[] = readOnly
    ? columns
    : [
        ...columns,
        {
          key: '__actions',
          label: '',
          className: 'text-right whitespace-nowrap',
          render: (item) => (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              {rowActions?.(item)}
              <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit">
                <Pencil size={15} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-error-600 hover:bg-error-50 hover:text-error-700"
                onClick={() => setDeleting(item)}
                aria-label="Delete"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ),
        },
      ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          !readOnly && (
            <Button onClick={openCreate}>
              <Plus size={16} /> New {singular}
            </Button>
          )
        }
      />

      <Card className="p-4">
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="w-full rounded-lg border border-navy-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none"
          />
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : (
          <DataTable<T>
            columns={allColumns}
            data={rows}
            loading={loading}
            sortKey={sort.key}
            sortDir={sort.dir}
            onSort={handleSort}
            emptyMessage={debounced ? 'No matching records' : `No ${title.toLowerCase()} yet`}
          />
        )}
        <p className="text-xs text-navy-400 mt-3">{total} total</p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Dialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        title={editing ? `Edit ${singular}` : `New ${singular}`}
        size={dialogSize}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          {formNote && <p className="text-sm text-navy-500 bg-navy-50 rounded-lg px-3 py-2">{formNote}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                <FieldInput
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => setValue(f.name, v)}
                  relationOptions={relations[f.name]}
                />
              </div>
            ))}
            {(slugFrom || 'slug' in values) && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-1.5" htmlFor="slug">
                  URL slug
                </label>
                <input
                  id="slug"
                  value={(values.slug as string) ?? ''}
                  onChange={(e) => setValue('slug', e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3.5 py-2.5 text-sm font-mono focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : `Create ${singular.toLowerCase()}`}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${singular}?`} size="sm">
        <p className="text-sm text-navy-600 mb-6">
          This permanently removes the {singular.toLowerCase()} and cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
