/*
# SCINS MEDIA — CMS, News, Conferences, Books, Contact, Newsletter, Settings

## Overview
Creates content management tables, conference management, book catalog,
contact enquiries, newsletter subscriptions, and site-wide settings.

## New Tables
1. `cms_pages` — static content pages (About, Policies, Guidelines, etc.)
   - id, title, slug, content, page_type, status, seo_title, seo_description
   - sort_order, created_at, updated_at

2. `news_items` — news, announcements, calls for papers
   - id, title, slug, excerpt, content, news_type, image_url
   - status, published_date, seo_title, seo_description, created_at, updated_at

3. `conferences` — conference/event records
   - id, name, acronym, theme, description, topics (text[])
   - organizing_institution, venue, city, country, timezone
   - start_date, end_date, registration_open, registration_close
   - abstract_deadline, early_bird_deadline
   - call_for_papers, registration_info, program_info
   - contact_email, website_url, logo_url, banner_url
   - status (draft, published, archived), slug, sort_order
   - seo_title, seo_description, created_at, updated_at

4. `conference_speakers` — speakers for a conference
   - id, conference_id, name, title, affiliation, bio, photo_url, sort_order

5. `conference_registrations` — attendee registrations
   - id, conference_id, full_name, email, affiliation, country
   - registration_type, attendance_mode, reference_number
   - status (pending, confirmed, cancelled), created_at

6. `conference_abstracts` — abstract submissions
   - id, conference_id, title, abstract, keywords (text[])
   - presenting_author, authors_list, presentation_type, track
   - status (submitted, under_review, accepted, rejected)
   - file_url, created_at

7. `books` — book/eBook catalog
   - id, title, subtitle, authors, isbn, description, category
   - cover_url, publish_date, edition, publisher, price, currency
   - license_type, preview_url, download_url, toc (table of contents)
   - status (draft, published, archived), slug, sort_order
   - seo_title, seo_description, created_at, updated_at

8. `contact_messages` — enquiries from the contact form
   - id, name, email, subject, message, status (unread, read, replied, archived)
   - created_at

9. `newsletter_subscribers` — email subscriptions
   - id, email (unique), is_confirmed, created_at

10. `site_settings` — global configuration (key-value)
    - id, setting_key (unique), setting_value (text), updated_at

11. `media_assets` — media library tracking
    - id, filename, file_url, file_type, file_size, alt_text, caption
    - bucket (public or private), created_at

12. `audit_logs` — administrative action tracking
    - id, user_id, action, entity_type, entity_id, details, created_at

## Security
- All tables RLS-enabled
- Public can read published content (cms_pages, news, conferences, books)
- Public can submit contact messages, newsletter subscriptions, conference registrations/abstracts
- Only admin can read contact messages, audit logs, manage all content
- Newsletter and contact are writeable by anon (public forms)
*/

-- CMS Pages
CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text DEFAULT '',
  page_type text NOT NULL DEFAULT 'static' CHECK (page_type IN ('static','policy','guideline','legal','landing')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pages_select_public" ON cms_pages;
CREATE POLICY "pages_select_public"
  ON cms_pages FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "pages_select_admin" ON cms_pages;
CREATE POLICY "pages_select_admin"
  ON cms_pages FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "pages_insert_admin" ON cms_pages;
CREATE POLICY "pages_insert_admin"
  ON cms_pages FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "pages_update_admin" ON cms_pages;
CREATE POLICY "pages_update_admin"
  ON cms_pages FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "pages_delete_admin" ON cms_pages;
CREATE POLICY "pages_delete_admin"
  ON cms_pages FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS cms_pages_updated_at ON cms_pages;
CREATE TRIGGER cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- News items
CREATE TABLE IF NOT EXISTS news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  news_type text NOT NULL DEFAULT 'news' CHECK (news_type IN ('news','announcement','call_for_papers','special_issue','editorial','press_release')),
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_date date,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_select_public" ON news_items;
CREATE POLICY "news_select_public"
  ON news_items FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "news_select_admin" ON news_items;
CREATE POLICY "news_select_admin"
  ON news_items FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "news_insert_admin" ON news_items;
CREATE POLICY "news_insert_admin"
  ON news_items FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "news_update_admin" ON news_items;
CREATE POLICY "news_update_admin"
  ON news_items FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "news_delete_admin" ON news_items;
CREATE POLICY "news_delete_admin"
  ON news_items FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS news_updated_at ON news_items;
CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON news_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Conferences
CREATE TABLE IF NOT EXISTS conferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  acronym text DEFAULT '',
  theme text DEFAULT '',
  description text DEFAULT '',
  topics text[] DEFAULT '{}',
  organizing_institution text DEFAULT '',
  venue text DEFAULT '',
  city text DEFAULT '',
  country text DEFAULT '',
  timezone text DEFAULT 'UTC',
  start_date date,
  end_date date,
  registration_open date,
  registration_close date,
  abstract_deadline date,
  early_bird_deadline date,
  call_for_papers text DEFAULT '',
  registration_info text DEFAULT '',
  program_info text DEFAULT '',
  contact_email text DEFAULT '',
  website_url text DEFAULT '',
  logo_url text DEFAULT '',
  banner_url text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conf_select_public" ON conferences;
CREATE POLICY "conf_select_public"
  ON conferences FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "conf_select_admin" ON conferences;
CREATE POLICY "conf_select_admin"
  ON conferences FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "conf_insert_admin" ON conferences;
CREATE POLICY "conf_insert_admin"
  ON conferences FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "conf_update_admin" ON conferences;
CREATE POLICY "conf_update_admin"
  ON conferences FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "conf_delete_admin" ON conferences;
CREATE POLICY "conf_delete_admin"
  ON conferences FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS conf_updated_at ON conferences;
CREATE TRIGGER conf_updated_at
  BEFORE UPDATE ON conferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Conference speakers
CREATE TABLE IF NOT EXISTS conference_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id uuid NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text DEFAULT '',
  affiliation text DEFAULT '',
  bio text DEFAULT '',
  photo_url text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conference_speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "speakers_select_public" ON conference_speakers;
CREATE POLICY "speakers_select_public"
  ON conference_speakers FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM conferences WHERE conferences.id = conference_speakers.conference_id AND conferences.status = 'published'));

DROP POLICY IF EXISTS "speakers_select_admin" ON conference_speakers;
CREATE POLICY "speakers_select_admin"
  ON conference_speakers FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "speakers_insert_admin" ON conference_speakers;
CREATE POLICY "speakers_insert_admin"
  ON conference_speakers FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "speakers_update_admin" ON conference_speakers;
CREATE POLICY "speakers_update_admin"
  ON conference_speakers FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "speakers_delete_admin" ON conference_speakers;
CREATE POLICY "speakers_delete_admin"
  ON conference_speakers FOR DELETE TO authenticated
  USING (public.is_admin());

-- Conference registrations (public can insert, admin can read all)
CREATE TABLE IF NOT EXISTS conference_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id uuid NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  affiliation text DEFAULT '',
  country text DEFAULT '',
  registration_type text DEFAULT 'Standard',
  attendance_mode text DEFAULT 'In-person' CHECK (attendance_mode IN ('In-person','Virtual','Hybrid')),
  reference_number text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conference_registrations ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "conf_reg_insert_public"
ON public.conference_registrations;

CREATE POLICY "conf_reg_insert_public"
ON public.conference_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conferences AS c
    WHERE c.id = conference_registrations.conference_id
      AND c.status = 'published'
  )
);


DROP POLICY IF EXISTS "conf_reg_select_admin" ON conference_registrations;
CREATE POLICY "conf_reg_select_admin"
  ON conference_registrations FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "conf_reg_update_admin" ON conference_registrations;
CREATE POLICY "conf_reg_update_admin"
  ON conference_registrations FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "conf_reg_delete_admin" ON conference_registrations;
CREATE POLICY "conf_reg_delete_admin"
  ON conference_registrations FOR DELETE TO authenticated
  USING (public.is_admin());

-- Conference abstracts
CREATE TABLE IF NOT EXISTS conference_abstracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id uuid NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  title text NOT NULL,
  abstract text NOT NULL,
  keywords text[] DEFAULT '{}',
  presenting_author text NOT NULL,
  authors_list text DEFAULT '',
  presentation_type text DEFAULT 'Oral' CHECK (presentation_type IN ('Oral','Poster','Workshop','Symposium')),
  track text DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','accepted','rejected','revision_requested')),
  file_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conference_abstracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conf_abstract_insert_public"
ON public.conference_abstracts;

CREATE POLICY "conf_abstract_insert_public"
ON public.conference_abstracts
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conferences AS c
    WHERE c.id = conference_abstracts.conference_id
      AND c.status = 'published'
  )
);


DROP POLICY IF EXISTS "conf_abs_select_admin" ON conference_abstracts;
CREATE POLICY "conf_abs_select_admin"
  ON conference_abstracts FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "conf_abs_update_admin" ON conference_abstracts;
CREATE POLICY "conf_abs_update_admin"
  ON conference_abstracts FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "conf_abs_delete_admin" ON conference_abstracts;
CREATE POLICY "conf_abs_delete_admin"
  ON conference_abstracts FOR DELETE TO authenticated
  USING (public.is_admin());

-- Books
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  authors text DEFAULT '',
  isbn text DEFAULT '',
  description text DEFAULT '',
  category text DEFAULT '',
  cover_url text DEFAULT '',
  publish_date date,
  edition text DEFAULT '',
  publisher text DEFAULT 'SCINS MEDIA',
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  license_type text DEFAULT 'CC BY 4.0',
  preview_url text DEFAULT '',
  download_url text DEFAULT '',
  toc text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "books_select_public" ON books;
CREATE POLICY "books_select_public"
  ON books FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "books_select_admin" ON books;
CREATE POLICY "books_select_admin"
  ON books FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "books_insert_admin" ON books;
CREATE POLICY "books_insert_admin"
  ON books FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "books_update_admin" ON books;
CREATE POLICY "books_update_admin"
  ON books FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "books_delete_admin" ON books;
CREATE POLICY "books_delete_admin"
  ON books FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS books_updated_at ON books;
CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Contact messages (public can insert, admin can read/manage)
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','replied','archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert_public" ON contact_messages;
CREATE POLICY "contact_insert_public"
  ON contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_admin" ON contact_messages;
CREATE POLICY "contact_select_admin"
  ON contact_messages FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "contact_update_admin" ON contact_messages;
CREATE POLICY "contact_update_admin"
  ON contact_messages FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_delete_admin" ON contact_messages;
CREATE POLICY "contact_delete_admin"
  ON contact_messages FOR DELETE TO authenticated
  USING (public.is_admin());

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  is_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_insert_public" ON newsletter_subscribers;
CREATE POLICY "newsletter_insert_public"
  ON newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "newsletter_select_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_select_admin"
  ON newsletter_subscribers FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "newsletter_delete_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_delete_admin"
  ON newsletter_subscribers FOR DELETE TO authenticated
  USING (public.is_admin());

-- Site settings
-- Settings are private by default; public settings require an explicit allowlist.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_public"
  ON public.site_settings;

DROP POLICY IF EXISTS "settings_select_admin"
  ON public.site_settings;

DROP POLICY IF EXISTS "settings_insert_admin"
  ON public.site_settings;

DROP POLICY IF EXISTS "settings_update_admin"
  ON public.site_settings;

DROP POLICY IF EXISTS "settings_delete_admin"
  ON public.site_settings;

CREATE POLICY "settings_select_admin"
  ON public.site_settings
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "settings_insert_admin"
  ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "settings_update_admin"
  ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "settings_delete_admin"
  ON public.site_settings
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Media assets
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT '',
  file_size bigint DEFAULT 0,
  alt_text text DEFAULT '',
  caption text DEFAULT '',
  bucket text DEFAULT 'public' CHECK (bucket IN ('public','private')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_select_public" ON media_assets;
CREATE POLICY "media_select_public"
  ON media_assets FOR SELECT TO anon, authenticated
  USING (bucket = 'public');

DROP POLICY IF EXISTS "media_select_admin" ON media_assets;
CREATE POLICY "media_select_admin"
  ON media_assets FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "media_insert_admin" ON media_assets;
CREATE POLICY "media_insert_admin"
  ON media_assets FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "media_update_admin" ON media_assets;
CREATE POLICY "media_update_admin"
  ON media_assets FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "media_delete_admin" ON media_assets;
CREATE POLICY "media_delete_admin"
  ON media_assets FOR DELETE TO authenticated
  USING (public.is_admin());

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text DEFAULT '',
  entity_id text DEFAULT '',
  details text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_admin" ON audit_logs;
CREATE POLICY "audit_select_admin"
  ON audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "audit_insert_admin" ON audit_logs;
CREATE POLICY "audit_insert_admin"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- =========================================================
-- INDEXES
-- Unique slug constraints already create their own indexes.
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_cms_pages_status
  ON public.cms_pages(status);

CREATE INDEX IF NOT EXISTS idx_news_status
  ON public.news_items(status);

CREATE INDEX IF NOT EXISTS idx_news_published
  ON public.news_items(published_date DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_conferences_status
  ON public.conferences(status);

CREATE INDEX IF NOT EXISTS idx_books_status
  ON public.books(status);

CREATE INDEX IF NOT EXISTS idx_contact_status
  ON public.contact_messages(status);

CREATE INDEX IF NOT EXISTS idx_conf_reg_conf
  ON public.conference_registrations(conference_id);

CREATE INDEX IF NOT EXISTS idx_conf_abs_conf
  ON public.conference_abstracts(conference_id);



-- =========================================================
-- EXPLICIT TABLE PRIVILEGES
-- RLS policies remain responsible for row-level authorization.
-- =========================================================

-- Ensure the application roles can access the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Remove broad table privileges before granting minimum access.
REVOKE ALL ON TABLE
  public.cms_pages,
  public.news_items,
  public.conferences,
  public.conference_speakers,
  public.conference_registrations,
  public.conference_abstracts,
  public.books,
  public.contact_messages,
  public.newsletter_subscribers,
  public.site_settings,
  public.media_assets,
  public.audit_logs
FROM PUBLIC, anon, authenticated;

-- Public content reads; RLS limits rows to published content
-- or public media assets.
GRANT SELECT ON TABLE
  public.cms_pages,
  public.news_items,
  public.conferences,
  public.conference_speakers,
  public.books,
  public.media_assets
TO anon, authenticated;

-- Authenticated users receive SQL privileges for content
-- management, but RLS restricts management to administrators.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.cms_pages,
  public.news_items,
  public.conferences,
  public.conference_speakers,
  public.books,
  public.site_settings,
  public.media_assets
TO authenticated;

GRANT SELECT, INSERT ON TABLE public.audit_logs
TO authenticated;

-- Public conference registrations.
-- Protected fields such as id, reference_number, status,
-- and created_at cannot be explicitly inserted by these roles.
GRANT INSERT (
  conference_id,
  full_name,
  email,
  affiliation,
  country,
  registration_type,
  attendance_mode
)
ON TABLE public.conference_registrations
TO anon, authenticated;

-- Public conference abstract submissions.
-- Protected fields such as id, status, file_url, and created_at
-- cannot be explicitly inserted by these roles.
GRANT INSERT (
  conference_id,
  title,
  abstract,
  keywords,
  presenting_author,
  authors_list,
  presentation_type,
  track
)
ON TABLE public.conference_abstracts
TO anon, authenticated;

-- Public contact form.
GRANT INSERT (
  name,
  email,
  subject,
  message
)
ON TABLE public.contact_messages
TO anon, authenticated;

-- Public newsletter signup.
GRANT INSERT (email)
ON TABLE public.newsletter_subscribers
TO anon, authenticated;

-- Authenticated users receive submission-management privileges.
-- RLS policies restrict these operations to administrators.
GRANT SELECT, UPDATE, DELETE ON TABLE
  public.conference_registrations,
  public.conference_abstracts,
  public.contact_messages,
  public.newsletter_subscribers
TO authenticated;

DROP POLICY IF EXISTS "newsletter_update_admin"
ON public.newsletter_subscribers;

CREATE POLICY "newsletter_update_admin"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Intentionally do not grant anonymous SELECT on private
-- submissions, site settings, or audit logs.
