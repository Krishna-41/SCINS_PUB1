export type UserRole = 'super_admin' | 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

export type PublishStatus = 'draft' | 'published' | 'archived' | 'discontinued';

export type ArticleStatus =
  | 'draft'
  | 'under_review'
  | 'accepted'
  | 'published'
  | 'corrected'
  | 'retracted'
  | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Journal {
  id: string;
  title: string;
  short_title: string;
  slug: string;
  journal_code: string;
  issn: string;
  eissn: string;
  description: string;
  scope: string;
  category_id: string | null;
  keywords: string[];
  language: string;
  frequency: string;
  publication_model: string;
  peer_review_model: string;
  editor_in_chief: string;
  managing_editor: string;
  editorial_contact: string;
  cover_image_url: string;
  logo_url: string;
  banner_url: string;
  apc_amount: number;
  apc_currency: string;
  waiver_info: string;
  copyright_holder: string;
  license_type: string;
  status: PublishStatus;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
  category?: JournalCategory | null;
}

export interface EditorialBoardMember {
  id: string;
  journal_id: string;
  name: string;
  title: string;
  affiliation: string;
  country: string;
  email: string;
  photo_url: string;
  board_role: string;
  sort_order: number;
  created_at: string;
}

export interface Issue {
  id: string;
  journal_id: string;
  volume: string;
  issue_number: string;
  year: number;
  title: string;
  description: string;
  cover_image_url: string;
  is_special_issue: boolean;
  guest_editors: string;
  published_date: string | null;
  status: 'draft' | 'published' | 'archived';
  sort_order: number;
  created_at: string;
}

export interface Article {
  id: string;
  journal_id: string;
  issue_id: string | null;
  title: string;
  subtitle: string;
  abstract: string;
  content: string;
  article_type: string;
  keywords: string[];
  doi: string;
  page_range: string;
  received_date: string | null;
  revised_date: string | null;
  accepted_date: string | null;
  published_date: string | null;
  status: ArticleStatus;
  funding: string;
  acknowledgments: string;
  conflict_of_interest: string;
  ethics_approval: string;
  data_availability: string;
  license_type: string;
  copyright_holder: string;
  pdf_url: string;
  html_url: string;
  view_count: number;
  download_count: number;
  slug: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  journal?: Journal | null;
  issue?: Issue | null;
  article_authors?: ArticleAuthor[];
}

export interface ArticleAuthor {
  id: string;
  article_id: string;
  author_name: string;
  email: string;
  affiliation: string;
  country: string;
  is_corresponding: boolean;
  author_order: number;
  orcid: string;
  created_at: string;
}


export interface PublicArticleAuthor {
  id: string;
  article_id: string;
  author_name: string;
  affiliation: string;
  country: string;
  is_corresponding: boolean;
  author_order: number;
  orcid: string;
  created_at: string;
}


export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  page_type: 'static' | 'policy' | 'guideline' | 'legal' | 'landing';
  status: PublishStatus;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  news_type: 'news' | 'announcement' | 'call_for_papers' | 'special_issue' | 'editorial' | 'press_release';
  image_url: string;
  status: PublishStatus;
  published_date: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface Conference {
  id: string;
  name: string;
  acronym: string;
  theme: string;
  description: string;
  topics: string[];
  organizing_institution: string;
  venue: string;
  city: string;
  country: string;
  timezone: string;
  start_date: string | null;
  end_date: string | null;
  registration_open: string | null;
  registration_close: string | null;
  abstract_deadline: string | null;
  early_bird_deadline: string | null;
  call_for_papers: string;
  registration_info: string;
  program_info: string;
  contact_email: string;
  website_url: string;
  logo_url: string;
  banner_url: string;
  status: PublishStatus;
  slug: string;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
  conference_speakers?: ConferenceSpeaker[];
}

export interface ConferenceSpeaker {
  id: string;
  conference_id: string;
  name: string;
  title: string;
  affiliation: string;
  bio: string;
  photo_url: string;
  sort_order: number;
  created_at: string;
}

export interface ConferenceRegistration {
  id: string;
  conference_id: string;
  full_name: string;
  email: string;
  affiliation: string;
  country: string;
  registration_type: string;
  attendance_mode: 'In-person' | 'Virtual' | 'Hybrid';
  reference_number: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ConferenceAbstract {
  id: string;
  conference_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  presenting_author: string;
  authors_list: string;
  presentation_type: 'Oral' | 'Poster' | 'Workshop' | 'Symposium';
  track: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'revision_requested';
  file_url: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  authors: string;
  isbn: string;
  description: string;
  category: string;
  cover_url: string;
  publish_date: string | null;
  edition: string;
  publisher: string;
  price: number;
  currency: string;
  license_type: string;
  preview_url: string;
  download_url: string;
  toc: string;
  status: PublishStatus;
  slug: string;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_confirmed: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  caption: string;
  bucket: 'public' | 'private';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}
