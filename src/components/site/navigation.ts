import {
  BookOpen,
  Info,
  LayoutGrid,
  Phone,
  FileText,
  ShieldCheck,
  Library,
  ListOrdered,
  type LucideIcon,
} from 'lucide-react';

export type NavVariant = 'home' | 'general' | 'journal' | 'submit' | 'peer-review';

export interface NavItem {
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
  icon?: LucideIcon;
}

const homeNav: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutGrid },
  { label: 'Journals', to: '/journals', icon: BookOpen },
  { label: 'Articles', to: '/articles', icon: FileText },
  { label: 'Categories', to: '/categories', icon: ListOrdered },
  { label: 'Submit Manuscript', to: '/submit', icon: FileText },
  { label: 'Index & Abstracting', to: '/indexing', icon: Library },
  { label: 'Peer Review', to: '/peer-review', icon: ShieldCheck },
  {
    label: 'About',
    to: '/pages/about',
    icon: Info,
    children: [
      { label: 'About SCINS MEDIA', to: '/pages/about' },
      { label: 'Open Access Policy', to: '/pages/open-access-policy' },
      { label: 'Peer Review Policy', to: '/pages/peer-review-policy' },
      { label: 'Publication Ethics', to: '/pages/publication-ethics' },
      { label: 'Plagiarism Policy', to: '/pages/plagiarism-policy' },
      { label: 'Copyright & Licensing', to: '/pages/copyright-licensing' },
    ],
  },
  { label: 'Contact', to: '/contact', icon: Phone },
];

const generalNav: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutGrid },
  { label: 'Journals', to: '/journals', icon: BookOpen },
  { label: 'Articles', to: '/articles', icon: FileText },
  { label: 'Submit Manuscript', to: '/submit', icon: FileText },
  { label: 'Index & Abstracting', to: '/indexing', icon: Library },
  { label: 'Peer Review', to: '/peer-review', icon: ShieldCheck },
  { label: 'Contact', to: '/contact', icon: Phone },
];

const journalNav: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutGrid },
  { label: 'Journals', to: '/journals', icon: BookOpen },
  { label: 'Articles', to: '/articles', icon: FileText },
  { label: 'Categories', to: '/categories', icon: ListOrdered },
  { label: 'Submit Manuscript', to: '/submit', icon: FileText },
  { label: 'Peer Review', to: '/peer-review', icon: ShieldCheck },
  { label: 'Contact', to: '/contact', icon: Phone },
];

const submitNav: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutGrid },
  { label: 'Journals', to: '/journals', icon: BookOpen },
  { label: 'Index & Abstracting', to: '/indexing', icon: Library },
  { label: 'Peer Review', to: '/peer-review', icon: ShieldCheck },
  { label: 'Author Guidelines', to: '/pages/author-guidelines', icon: FileText },
  { label: 'Contact', to: '/contact', icon: Phone },
];

const peerReviewNav: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutGrid },
  { label: 'Journals', to: '/journals', icon: BookOpen },
  { label: 'Submit Manuscript', to: '/submit', icon: FileText },
  { label: 'Index & Abstracting', to: '/indexing', icon: Library },
  { label: 'Publication Ethics', to: '/pages/publication-ethics', icon: ShieldCheck },
  { label: 'Contact', to: '/contact', icon: Phone },
];

const navByVariant: Record<NavVariant, NavItem[]> = {
  home: homeNav,
  general: generalNav,
  journal: journalNav,
  submit: submitNav,
  'peer-review': peerReviewNav,
};

export function navForVariant(variant: NavVariant): NavItem[] {
  return navByVariant[variant];
}

export function deriveVariant(pathname: string): NavVariant {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/journals') || pathname.startsWith('/articles') || pathname.startsWith('/categories'))
    return 'journal';
  if (pathname.startsWith('/submit')) return 'submit';
  if (pathname.startsWith('/peer-review')) return 'peer-review';
  return 'general';
}
