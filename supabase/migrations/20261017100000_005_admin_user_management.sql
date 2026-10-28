/*
# SCINS MEDIA — Admin user management & role-escalation fix

## Why
Migration 001 let every user UPDATE their own profile row with no column
restriction, which means any signed-in user could set their own `role` to
'super_admin'. It also had no way for an admin to change another user's role,
which the Users admin page needs.

## Changes
1. Trigger `profiles_protect_privileged_columns` — only admins may change
   `role` or `is_active` (service-role / SQL editor, where auth.uid() is NULL,
   is still allowed so you can bootstrap the first super_admin).
2. Policy `profiles_update_admin` — admins may update any profile.
3. Tightened `profiles_insert_own` so a self-inserted profile is always a
   plain active 'reader'.

## Bootstrapping the first super admin
Run once in the Supabase SQL editor after signing up:

    UPDATE profiles SET role = 'super_admin' WHERE email = 'you@example.com';
*/

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (
    NEW.role IS DISTINCT FROM OLD.role
    OR NEW.is_active IS DISTINCT FROM OLD.is_active
  )
  AND auth.uid() IS NOT NULL
  AND NOT public.is_admin() THEN
    RAISE EXCEPTION
      'Only administrators can change a user''s role or active status';
  END IF;

  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS profiles_protect_privileged_columns ON public.profiles;
CREATE TRIGGER profiles_protect_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = 'reader'
    AND is_active = true
  );
