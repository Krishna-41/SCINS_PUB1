import { type ReactNode } from 'react';
import { Header, type NavVariant } from './Header';
import { Footer } from './Footer';

export function PublicLayout({ children, variant }: { children: ReactNode; variant?: NavVariant }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header variant={variant} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
