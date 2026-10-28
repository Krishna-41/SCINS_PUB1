import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSpinner } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { FieldInput, buildPayload, validateRequired, type Field, type FormValues } from './FieldInput';

interface ChildListDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  table: string;
  foreignKey: string;
  parentId: string;
  orderKey: string;
  fields: Field[];
  /** Primary + secondary text for each row. */
  primary: (row: Record<string, unknown>) => string;
  secondary?: (row: Record<string, unknown>) => string;
  defaults?: FormValues;
}

export function ChildListDialog({
  open,
  onClose,
  title,
  table,
  foreignKey,
  parentId,
  orderKey,
  fields,
  primary,
  secondary,
  defaults = {},
}: ChildListDialogProps) {
  const { show } = useToast();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
    setLoading(true);

    let result;

    if (table === 'article_authors') {
      result = await supabase.rpc('admin_get_article_authors', {
        p_article_id: parentId,
      });
    } else if (table === 'editorial_board_members') {
      result = await supabase.rpc('admin_get_board_members', {
        p_journal_id: parentId,
      });
    } else {
      result = await supabase
        .from(table)
        .select('*')
        .eq(foreignKey, parentId)
        .order(orderKey, { ascending: true });
    }

    const { data, error } = result;

    if (error) show('error', error.message);

    setRows((data as Record<string, unknown>[]) ?? []);
    setLoading(false);
  }, [table, foreignKey, parentId, orderKey, show]);

  useEffect(() => {
    if (open) {
      setEditingId(null);
      load();
    }
  }, [open, load]);

  const startNew = () => {
    setValues({ ...defaults, [orderKey]: rows.length + 1 });
    setEditingId('new');
  };

  const startEdit = (row: Record<string, unknown>) => {
    const v: FormValues = {};
    for (const f of fields) {
      const raw = row[f.name];
      v[f.name] = f.type === 'tags' && Array.isArray(raw) ? raw.join(', ') : raw ?? '';
    }
    setValues(v);
    setEditingId(row.id as string);
  };

  const save = async () => {
    const problem = validateRequired(fields, values);
    if (problem) {
      show('error', problem);
      return;
    }
    const payload = buildPayload(fields, values);
    setSaving(true);
    const { error } =
      editingId === 'new'
        ? await supabase.from(table).insert({ ...payload, [foreignKey]: parentId })
        : await supabase.from(table).update(payload).eq('id', editingId as string);
    setSaving(false);
    if (error) {
      show('error', error.message);
      return;
    }
    show('success', 'Saved');
    setEditingId(null);
    load();
  };

  const remove = async (row: Record<string, unknown>) => {
    if (!window.confirm('Delete this entry?')) return;
    const { error } = await supabase.from(table).delete().eq('id', row.id as string);
    if (error) show('error', error.message);
    else {
      show('success', 'Deleted');
      load();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} size="lg">
      {editingId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                <FieldInput
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
            <Button type="button" variant="ghost" onClick={() => setEditingId(null)} disabled={saving}>
              Back to list
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={startNew}>
              <Plus size={14} /> Add
            </Button>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : rows.length === 0 ? (
            <p className="text-sm text-navy-400 text-center py-8">Nothing added yet.</p>
          ) : (
            <ul className="divide-y divide-navy-100 rounded-lg border border-navy-100">
              {rows.map((row) => (
                <li key={row.id as string} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800 truncate">{primary(row)}</p>
                    {secondary && <p className="text-xs text-navy-400 truncate">{secondary(row)}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(row)} aria-label="Edit">
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error-600 hover:bg-error-50"
                    onClick={() => remove(row)}
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dialog>
  );
}
