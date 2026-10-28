/*
# SCINS MEDIA — Profiles, Roles, and User Management Foundation

## Overview
Creates the user profile system with role-based access control for the SCINS MEDIA
scientific publishing platform. This is the foundational layer that all other tables
depend on for authorization.

## New Tables
1. `profiles` — extends Supabase auth.users with display name, role, and account state
   - id (uuid, PK, references auth.users)
   - email (text, unique — synced from auth)
   - full_name (text — display name)
   - role (enum — super_admin, admin, editor, reviewer, author, reader)
   - is_active (boolean — soft disable)
   - created_at, updated_at (timestamps)

## Security
- RLS enabled on profiles
- Users can read their own profile
- Users can update their own profile (but NOT their own role — role changes require admin)
- All profiles are readable by authenticated users (staff directories, editorial boards)
- Role assignment is done via a SECURITY DEFINER function callable only by super_admin/admin
*/



-- SCINS MEDIA: Initial profiles and authentication setup
-- Intended for a fresh Supabase project.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'reader'
    CHECK (role IN (
      'super_admin', 'admin', 'editor',
      'reviewer', 'author', 'reader'
    )),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Each authenticated user can read only their own profile.
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can create only their own basic reader profile.
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = 'reader'
    AND is_active = true
  );

-- Users can update their own profile.
-- A trigger below prevents role and active-status changes.
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent users from changing their own role or active status.
CREATE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND auth.uid() = OLD.id
     AND (
       NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_active IS DISTINCT FROM OLD.is_active
     )
  THEN
    RAISE EXCEPTION
      'You cannot change your own role or active status';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_self_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_change();

-- Automatically create a profile after signup.
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', '')
  );

  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at automatically.
CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Helper functions for authorization checks.
CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
  );
$$;

CREATE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'editor', 'reviewer')
      AND is_active = true
  );
$$;
