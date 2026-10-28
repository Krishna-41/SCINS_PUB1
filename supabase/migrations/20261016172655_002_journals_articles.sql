/*
# SCINS MEDIA — Journals, Categories, Issues, Articles, Authors

## Overview
Creates the core publishing catalog: journal categories, journals, editorial boards,
issues/volumes, articles, and article-author relationships.

## New Tables
1. `journal_categories` — subject disciplines (e.g., Medicine, Engineering)
   - id, name, slug, description, sort_order, created_at

2. `journals` — individual journal records
   - id, title, short_title, slug, journal_code, issn, eissn
   - description, scope, category_id, keywords (text[])
   - language, frequency, publication_model, peer_review_model
   - editor_in_chief, managing_editor, editorial_contact
   - cover_image_url, logo_url, banner_url
   - apc_amount, apc_currency, waiver_info
   - copyright_holder, license_type
   - status (draft, published, archived, discontinued)
   - sort_order, seo_title, seo_description
   - created_at, updated_at

3. `editorial_board_members` — people on a journal's editorial board
   - id, journal_id, name, title, affiliation, country, email
   - photo_url, board_role, sort_order, created_at

4. `issues` — volumes and issues within a journal
   - id, journal_id, volume, issue_number, year, title
   - description, cover_image_url, is_special_issue, guest_editors
   - published_date, status (draft, published, archived), sort_order, created_at

5. `articles` — published articles
   - id, journal_id, issue_id (nullable), title, subtitle, abstract
   - content, article_type, keywords (text[])
   - doi, page_range, received_date, revised_date, accepted_date, published_date
   - status (draft, under_review, accepted, published, corrected, retracted, archived)
   - funding, acknowledgments, conflict_of_interest, ethics_approval
   - data_availability, license_type, copyright_holder
   - pdf_url, html_url, view_count, download_count
   - slug, seo_title, seo_description, sort_order, created_at, updated_at

6. `article_authors` — link table for article <-> author
   - id, article_id, author_name, email, affiliation, country
   - is_corresponding, author_order, orcid, created_at

## Security
- All tables RLS-enabled
- Public (anon) can SELECT published records only
- Authenticated admin/editor can do full CRUD
- Status filtering enforced at query level (public sees only published)
*/

-- Journal categories
CREATE TABLE IF NOT EXISTS journal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE journal_categories ENABLE ROW LEVEL SECURITY;

-- Public can read published categories
DROP POLICY IF EXISTS "categories_select_public" ON journal_categories;
CREATE POLICY "categories_select_public"
  ON journal_categories FOR SELECT TO anon, authenticated
  USING (true);

-- Admin can manage categories
DROP POLICY IF EXISTS "categories_insert_admin" ON journal_categories;
CREATE POLICY "categories_insert_admin"
  ON journal_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON journal_categories;
CREATE POLICY "categories_update_admin"
  ON journal_categories FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON journal_categories;
CREATE POLICY "categories_delete_admin"
  ON journal_categories FOR DELETE TO authenticated
  USING (public.is_admin());

-- Journals
CREATE TABLE IF NOT EXISTS journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_title text DEFAULT '',
  slug text NOT NULL UNIQUE,
  journal_code text DEFAULT '',
  issn text DEFAULT '',
  eissn text DEFAULT '',
  description text DEFAULT '',
  scope text DEFAULT '',
  category_id uuid REFERENCES journal_categories(id) ON DELETE SET NULL,
  keywords text[] DEFAULT '{}',
  language text DEFAULT 'English',
  frequency text DEFAULT 'Continuous',
  publication_model text DEFAULT 'Open Access',
  peer_review_model text DEFAULT 'Single-anonymous',
  editor_in_chief text DEFAULT '',
  managing_editor text DEFAULT '',
  editorial_contact text DEFAULT '',
  cover_image_url text DEFAULT '',
  logo_url text DEFAULT '',
  banner_url text DEFAULT '',
  apc_amount numeric DEFAULT 0,
  apc_currency text DEFAULT 'USD',
  waiver_info text DEFAULT '',
  copyright_holder text DEFAULT 'SCINS MEDIA',
  license_type text DEFAULT 'CC BY 4.0',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','discontinued')),
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journals_select_public" ON journals;
CREATE POLICY "journals_select_public"
  ON journals FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "journals_select_admin" ON journals;
CREATE POLICY "journals_select_admin"
  ON journals FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "journals_insert_admin" ON journals;
CREATE POLICY "journals_insert_admin"
  ON journals FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "journals_update_admin" ON journals;
CREATE POLICY "journals_update_admin"
  ON journals FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "journals_delete_admin" ON journals;
CREATE POLICY "journals_delete_admin"
  ON journals FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS journals_updated_at ON journals;
CREATE TRIGGER journals_updated_at
  BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Editorial board members
CREATE TABLE IF NOT EXISTS editorial_board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text DEFAULT '',
  affiliation text DEFAULT '',
  country text DEFAULT '',
  email text DEFAULT '',
  photo_url text DEFAULT '',
  board_role text DEFAULT 'Editorial Board Member',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE editorial_board_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_select_public" ON editorial_board_members;
CREATE POLICY "board_select_public"
  ON editorial_board_members FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM journals WHERE journals.id = editorial_board_members.journal_id AND journals.status = 'published'));

DROP POLICY IF EXISTS "board_select_admin" ON editorial_board_members;
CREATE POLICY "board_select_admin"
  ON editorial_board_members FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "board_insert_admin" ON editorial_board_members;
CREATE POLICY "board_insert_admin"
  ON editorial_board_members FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "board_update_admin" ON editorial_board_members;
CREATE POLICY "board_update_admin"
  ON editorial_board_members FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "board_delete_admin" ON editorial_board_members;
CREATE POLICY "board_delete_admin"
  ON editorial_board_members FOR DELETE TO authenticated
  USING (public.is_admin());

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  volume text NOT NULL DEFAULT '1',
  issue_number text NOT NULL DEFAULT '1',
  year integer NOT NULL DEFAULT EXTRACT(year FROM now())::int,
  title text DEFAULT '',
  description text DEFAULT '',
  cover_image_url text DEFAULT '',
  is_special_issue boolean NOT NULL DEFAULT false,
  guest_editors text DEFAULT '',
  published_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issues_select_public" ON public.issues;

CREATE POLICY "issues_select_public"
  ON public.issues
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.journals AS j
      WHERE j.id = issues.journal_id
        AND j.status = 'published'
    )
  );

DROP POLICY IF EXISTS "issues_select_admin" ON issues;
CREATE POLICY "issues_select_admin"
  ON issues FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "issues_insert_admin" ON issues;
CREATE POLICY "issues_insert_admin"
  ON issues FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "issues_update_admin" ON issues;
CREATE POLICY "issues_update_admin"
  ON issues FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "issues_delete_admin" ON issues;
CREATE POLICY "issues_delete_admin"
  ON issues FOR DELETE TO authenticated
  USING (public.is_admin());

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  issue_id uuid REFERENCES issues(id) ON DELETE SET NULL,
  title text NOT NULL,
  subtitle text DEFAULT '',
  abstract text DEFAULT '',
  content text DEFAULT '',
  article_type text DEFAULT 'Research Article',
  keywords text[] DEFAULT '{}',
  doi text DEFAULT '',
  page_range text DEFAULT '',
  received_date date,
  revised_date date,
  accepted_date date,
  published_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','under_review','accepted','published','corrected','retracted','archived')),
  funding text DEFAULT '',
  acknowledgments text DEFAULT '',
  conflict_of_interest text DEFAULT '',
  ethics_approval text DEFAULT '',
  data_availability text DEFAULT '',
  license_type text DEFAULT 'CC BY 4.0',
  copyright_holder text DEFAULT 'SCINS MEDIA',
  pdf_url text DEFAULT '',
  html_url text DEFAULT '',
  view_count integer NOT NULL DEFAULT 0,
  download_count integer NOT NULL DEFAULT 0,
  slug text NOT NULL UNIQUE,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "articles_select_public" ON public.articles;

CREATE POLICY "articles_select_public"
  ON public.articles
  FOR SELECT
  TO anon, authenticated
  USING (
    status IN ('published', 'corrected', 'retracted')
    AND EXISTS (
      SELECT 1
      FROM public.journals AS j
      WHERE j.id = articles.journal_id
        AND j.status = 'published'
    )
  );

DROP POLICY IF EXISTS "articles_select_admin" ON articles;
CREATE POLICY "articles_select_admin"
  ON articles FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "articles_insert_admin" ON articles;
CREATE POLICY "articles_insert_admin"
  ON articles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles_update_admin" ON articles;
CREATE POLICY "articles_update_admin"
  ON articles FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles_delete_admin" ON articles;
CREATE POLICY "articles_delete_admin"
  ON articles FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Article authors
CREATE TABLE IF NOT EXISTS article_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  email text DEFAULT '',
  affiliation text DEFAULT '',
  country text DEFAULT '',
  is_corresponding boolean NOT NULL DEFAULT false,
  author_order integer NOT NULL DEFAULT 0,
  orcid text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authors_select_public" ON public.article_authors;

CREATE POLICY "authors_select_public"
  ON public.article_authors
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.articles AS a
      JOIN public.journals AS j
        ON j.id = a.journal_id
      WHERE a.id = article_authors.article_id
        AND a.status IN ('published', 'corrected', 'retracted')
        AND j.status = 'published'
    )
  );

DROP POLICY IF EXISTS "authors_select_admin" ON article_authors;
CREATE POLICY "authors_select_admin"
  ON article_authors FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "authors_insert_admin" ON article_authors;
CREATE POLICY "authors_insert_admin"
  ON article_authors FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authors_update_admin" ON article_authors;
CREATE POLICY "authors_update_admin"
  ON article_authors FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authors_delete_admin" ON article_authors;
CREATE POLICY "authors_delete_admin"
  ON article_authors FOR DELETE TO authenticated
  USING (public.is_admin());

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_journals_category ON journals(category_id);
CREATE INDEX IF NOT EXISTS idx_journals_status ON journals(status);
CREATE INDEX IF NOT EXISTS idx_journals_slug ON journals(slug);
CREATE INDEX IF NOT EXISTS idx_articles_journal ON articles(journal_id);
CREATE INDEX IF NOT EXISTS idx_articles_issue ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_date DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_issues_journal ON issues(journal_id);
CREATE INDEX IF NOT EXISTS idx_board_journal ON editorial_board_members(journal_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_article ON article_authors(article_id);


-- Protect author and editorial-board email addresses.
-- Run as part of migration 002, after both tables and public.is_admin() exist.

REVOKE SELECT ON TABLE public.article_authors
FROM PUBLIC, anon, authenticated;

REVOKE SELECT ON TABLE public.editorial_board_members
FROM PUBLIC, anon, authenticated;

-- Publicly readable author details: deliberately excludes email.
GRANT SELECT (
  id, article_id, author_name, affiliation, country,
  is_corresponding, author_order, orcid, created_at
) ON TABLE public.article_authors TO anon, authenticated;

-- Publicly readable editorial-board details: deliberately excludes email.
GRANT SELECT (
  id, journal_id, name, title, affiliation, country,
  photo_url, board_role, sort_order, created_at
) ON TABLE public.editorial_board_members TO anon, authenticated;


-- Allow authenticated users to attempt writes.
-- RLS policies still restrict these operations to admins.
GRANT INSERT, UPDATE, DELETE
ON TABLE public.article_authors
TO authenticated;

GRANT INSERT, UPDATE, DELETE
ON TABLE public.editorial_board_members
TO authenticated;


-- Admin-only RPC for author records, including email.
CREATE OR REPLACE FUNCTION public.admin_get_article_authors(p_article_id uuid)
RETURNS SETOF public.article_authors
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT a.*
  FROM public.article_authors AS a
  WHERE a.article_id = p_article_id
  ORDER BY a.author_order;
END;
$$;

-- Admin-only RPC for editorial-board records, including email.
CREATE OR REPLACE FUNCTION public.admin_get_board_members(p_journal_id uuid)
RETURNS SETOF public.editorial_board_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT b.*
  FROM public.editorial_board_members AS b
  WHERE b.journal_id = p_journal_id
  ORDER BY b.sort_order;
END;
$$;

-- Public read access for catalog tables
GRANT SELECT ON TABLE
  public.journal_categories,
  public.journals,
  public.issues,
  public.articles
TO anon, authenticated;

-- Authenticated users can attempt admin CRUD operations.
-- RLS policies must still authorize each operation.
GRANT INSERT, UPDATE, DELETE ON TABLE
  public.journal_categories,
  public.journals,
  public.editorial_board_members,
  public.issues,
  public.articles,
  public.article_authors
TO authenticated;

REVOKE ALL ON FUNCTION public.admin_get_article_authors(uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_get_article_authors(uuid)
TO authenticated;

REVOKE ALL ON FUNCTION public.admin_get_board_members(uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_get_board_members(uuid)
TO authenticated;

