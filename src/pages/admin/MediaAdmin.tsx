import { useCallback, useEffect, useState } from 'react';
import { Copy, File as FileIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage, LoadingSpinner, EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useUpload } from '@/lib/useUpload';
import type { MediaAsset } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

const PAGE_SIZE = 24;

function storagePath(url: string): string | null {
  const marker = '/public-assets/';
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

export function MediaAdmin() {
  const { show } = useToast();
  const { remove } = useUpload();
  const [rows, setRows] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (page - 1) * PAGE_SIZE;
    const { data, error: err, count } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (err) setError(err.message);
    else {
      setRows((data as MediaAsset[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      show('success', 'URL copied');
    } catch {
      show('error', 'Could not copy — select the URL manually.');
    }
  };

  const del = async (asset: MediaAsset) => {
    if (!window.confirm(`Delete ${asset.filename}? Pages using it will show a broken file.`)) return;
    const path = storagePath(asset.file_url);
    if (path) await remove('public-assets', path);
    const { error: err } = await supabase.from('media_assets').delete().eq('id', asset.id);
    if (err) show('error', err.message);
    else {
      show('success', 'File deleted');
      load();
    }
  };

  return (
    <div>
      <PageHeader title="Media Library" description="Images and documents uploaded to the site." />
      <Card className="p-4 mb-6">
        <FileUpload
          bucket="public-assets"
          pathPrefix="library"
          multiple
          label="Upload files"
          maxSizeMB={25}
          onUploaded={() => {
            setPage(1);
            load();
          }}
        />
      </Card>

      {error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : loading ? (
        <LoadingSpinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No files yet" description="Upload your first file above." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {rows.map((a) => (
            <Card key={a.id} className="overflow-hidden flex flex-col">
              <div className="aspect-square bg-navy-50 flex items-center justify-center overflow-hidden">
                {a.file_type.startsWith('image/') ? (
                  <img src={a.file_url} alt={a.alt_text || a.filename} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <FileIcon className="h-10 w-10 text-navy-300" />
                )}
              </div>
              <div className="p-3 flex-1">
                <p className="text-xs font-medium text-navy-800 truncate" title={a.filename}>
                  {a.filename}
                </p>
                <p className="text-xs text-navy-400">{formatBytes(a.file_size)}</p>
              </div>
              <div className="flex border-t border-navy-100">
                <Button variant="ghost" size="sm" className="flex-1 rounded-none" onClick={() => copy(a.file_url)}>
                  <Copy size={14} /> URL
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 rounded-none text-error-600 hover:bg-error-50" onClick={() => del(a)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} onPageChange={setPage} />
    </div>
  );
}
