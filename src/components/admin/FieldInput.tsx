import { Input, Select, Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date'
  | 'checkbox'
  | 'tags'
  | 'image'
  | 'file'
  | 'relation'
  | 'url'
  | 'email';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  relation?: {
    table: string;
    labelKey: string;
    nullable?: boolean;
    select?: string;
    label?: (row: Record<string, unknown>) => string;
  };
  required?: boolean;
  half?: boolean;
  hint?: string;
  rows?: number;
  folder?: string;
  accept?: string;
}

export type FormValues = Record<string, unknown>;

interface FieldInputProps {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  relationOptions?: { value: string; label: string }[];
}

export function FieldInput({ field, value, onChange, relationOptions }: FieldInputProps) {
  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          label={field.label}
          name={field.name}
          hint={field.hint}
          required={field.required}
          rows={field.rows ?? 4}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          label={field.label}
          name={field.name}
          hint={field.hint}
          required={field.required}
          type="number"
          step="any"
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'date':
      return (
        <Input
          label={field.label}
          name={field.name}
          hint={field.hint}
          required={field.required}
          type="date"
          value={typeof value === 'string' ? value.slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'select':
      return (
        <Select
          label={field.label}
          name={field.name}
          required={field.required}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    case 'relation':
      return (
        <Select
          label={field.label}
          name={field.name}
          required={field.required}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.relation?.nullable || !field.required) && <option value="">— None —</option>}
          {!field.relation?.nullable && field.required && <option value="">Select…</option>}
          {(relationOptions ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    case 'checkbox':
      return (
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-700 cursor-pointer select-none pt-6">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-navy-300 text-teal-600 focus:ring-teal-400"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
        </label>
      );
    case 'tags': {
      const text = Array.isArray(value) ? (value as string[]).join(', ') : ((value as string) ?? '');
      return (
        <Input
          label={field.label}
          name={field.name}
          hint={field.hint ?? 'Separate values with commas'}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    case 'image':
    case 'file': {
      const url = (value as string) ?? '';
      return (
        <div className="space-y-2">
          <FileUpload
            bucket="public-assets"
            pathPrefix={field.folder ?? 'uploads'}
            accept={field.accept ?? (field.type === 'image' ? 'image/*' : '.pdf,.doc,.docx')}
            label={field.label}
            maxSizeMB={field.type === 'image' ? 5 : 25}
            currentFiles={url ? [{ url, filename: url.split('/').pop() ?? 'file' }] : []}
            onRemove={() => onChange('')}
            onUploaded={(files) => onChange(files[0].url)}
          />
          <Input
            name={`${field.name}_url`}
            placeholder="…or paste a URL"
            value={url}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }
    case 'url':
    case 'email':
    case 'text':
    default:
      return (
        <Input
          label={field.label}
          name={field.name}
          hint={field.hint}
          required={field.required}
          type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/** Convert raw form values into a payload suited for Supabase. */
export function buildPayload(fields: Field[], values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.name];
    switch (f.type) {
      case 'number':
        payload[f.name] = v === '' || v === null || v === undefined ? (f.required ? 0 : null) : Number(v);
        break;
      case 'date':
        payload[f.name] = v ? v : null;
        break;
      case 'relation':
        payload[f.name] = v ? v : null;
        break;
      case 'checkbox':
        payload[f.name] = Boolean(v);
        break;
      case 'tags':
        payload[f.name] = Array.isArray(v)
          ? v
          : String(v ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        break;
      default:
        payload[f.name] = v ?? '';
    }
  }
  return payload;
}

export function validateRequired(fields: Field[], values: FormValues): string | null {
  for (const f of fields) {
    if (!f.required) continue;
    const v = values[f.name];
    if (v === undefined || v === null || v === '') return `${f.label} is required`;
  }
  return null;
}
