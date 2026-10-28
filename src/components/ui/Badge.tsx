import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-navy-100 text-navy-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  info: 'bg-accent-100 text-accent-700',
  teal: 'bg-teal-100 text-teal-700',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClass}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    archived: { variant: 'warning', label: 'Archived' },
    discontinued: { variant: 'error', label: 'Discontinued' },
    under_review: { variant: 'info', label: 'Under Review' },
    accepted: { variant: 'teal', label: 'Accepted' },
    corrected: { variant: 'warning', label: 'Corrected' },
    retracted: { variant: 'error', label: 'Retracted' },
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    unread: { variant: 'info', label: 'Unread' },
    read: { variant: 'default', label: 'Read' },
    replied: { variant: 'success', label: 'Replied' },
    submitted: { variant: 'info', label: 'Submitted' },
    rejected: { variant: 'error', label: 'Rejected' },
    revision_requested: { variant: 'warning', label: 'Revision Requested' },
  };

  const config = map[status] ?? { variant: 'default' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
