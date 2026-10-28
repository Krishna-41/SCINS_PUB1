import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';

export function useUpload() {
  const { show } = useToast();
  const { profile } = useAuth();

  const upload = useCallback(
    async (
      file: File,
      bucket: 'public-assets' | 'private-files',
      pathPrefix: string
    ): Promise<{ url: string; path: string } | null> => {
      if (!profile) {
        show('error', 'You must be signed in to upload files.');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        show('error', `Upload failed: ${uploadError.message}`);
        return null;
      }

      let url: string;
      if (bucket === 'public-assets') {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        url = urlData.publicUrl;
      } else {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fileName, 3600);
        if (signedError || !signedData) {
          show('error', 'File uploaded but could not generate a download link.');
          return null;
        }
        url = signedData.signedUrl;
      }

      const { error: metaError } = await supabase.from('media_assets').insert({
        filename: file.name,
        file_url: url,
        file_type: file.type,
        file_size: file.size,
        bucket: bucket === 'public-assets' ? 'public' : 'private',
      });

      if (metaError) {
        console.error('Failed to record media asset metadata:', metaError.message);
      }

      return { url, path: fileName };
    },
    [profile, show]
  );

  const remove = useCallback(async (bucket: 'public-assets' | 'private-files', path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      show('error', `Failed to delete file: ${error.message}`);
      return false;
    }
    return true;
  }, [show]);

  return { upload, remove };
}
