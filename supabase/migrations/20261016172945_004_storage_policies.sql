
/*
# SCINS MEDIA — Storage Bucket Policies

Purpose:
- public-assets: Public read; admin-only write.
- private-files: Admin-only read and write.

Assumptions:
- Supabase Storage is enabled.
- storage.objects exists and has RLS enabled.
- public.is_admin() exists and returns TRUE only for authorized admins.
- Both buckets are created separately in Supabase Storage.
- The public-assets bucket is configured as public.
- The private-files bucket is configured as private.

Important:
- These policies restrict access through RLS.
- Check for other permissive policies on storage.objects,
  since additional policies can grant access independently.
*/

BEGIN;

-- =====================================================
-- PUBLIC ASSETS
-- Anyone can read; only admins can modify.
-- =====================================================

DROP POLICY IF EXISTS "public_read_assets"
  ON storage.objects;

CREATE POLICY "public_read_assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'public-assets');


DROP POLICY IF EXISTS "admin_write_assets"
  ON storage.objects;

CREATE POLICY "admin_write_assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-assets'
    AND public.is_admin()
  );


DROP POLICY IF EXISTS "admin_update_assets"
  ON storage.objects;

CREATE POLICY "admin_update_assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND public.is_admin()
  );


DROP POLICY IF EXISTS "admin_delete_assets"
  ON storage.objects;

CREATE POLICY "admin_delete_assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND public.is_admin()
  );


-- =====================================================
-- PRIVATE FILES
-- Only admins can read or modify.
-- =====================================================

-- Remove the old broad read policy.
DROP POLICY IF EXISTS "auth_read_private"
  ON storage.objects;

-- Replace it with an admin-only read policy.
DROP POLICY IF EXISTS "admin_read_private"
  ON storage.objects;

CREATE POLICY "admin_read_private"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'private-files'
    AND public.is_admin()
  );


DROP POLICY IF EXISTS "admin_write_private"
  ON storage.objects;

CREATE POLICY "admin_write_private"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'private-files'
    AND public.is_admin()
  );


DROP POLICY IF EXISTS "admin_update_private"
  ON storage.objects;

CREATE POLICY "admin_update_private"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'private-files'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'private-files'
    AND public.is_admin()
  );


DROP POLICY IF EXISTS "admin_delete_private"
  ON storage.objects;

CREATE POLICY "admin_delete_private"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'private-files'
    AND public.is_admin()
  );

COMMIT;
