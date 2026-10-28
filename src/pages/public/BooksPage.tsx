import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Book } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('books')
      .select('*')
      .eq('status', 'published')
      .order('sort_order, publish_date', { ascending: false })
      .then(({ data }) => {
        setBooks((data as unknown as Book[]) || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Loading books..." />;

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Books & eBooks</h1>
          <p className="text-navy-500">Academic books published by SCINS MEDIA.</p>
        </div>
      </div>
      <div className="container-wide py-8">
        {books.length === 0 ? (
          <EmptyState title="No books published yet" description="New book titles will appear here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card key={book.id} hover className="h-full">
                <CardBody>
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-56 object-cover rounded-lg mb-4 shadow-md" />
                  ) : (
                    <div className="w-full h-56 rounded-lg bg-gradient-to-br from-navy-100 to-teal-50 flex items-center justify-center mb-4">
                      <BookOpen className="h-12 w-12 text-navy-300" />
                    </div>
                  )}
                  <h3 className="text-base font-serif font-bold text-navy-900 mb-1 line-clamp-2">{book.title}</h3>
                  {book.subtitle && <p className="text-sm text-navy-400 line-clamp-1 mb-2">{book.subtitle}</p>}
                  {book.authors && <p className="text-xs text-navy-500 mb-2">By {book.authors}</p>}
                  {book.category && <Badge variant="teal">{book.category}</Badge>}
                  {book.isbn && <p className="text-xs text-navy-400 mt-2">ISBN: {book.isbn}</p>}
                  <div className="flex gap-2 mt-3">
                    {book.preview_url && (
                      <a href={book.preview_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 inline-flex items-center gap-1 hover:text-teal-700">
                        <ExternalLink size={12} /> Preview
                      </a>
                    )}
                    {book.download_url && (
                      <a href={book.download_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 inline-flex items-center gap-1 hover:text-teal-700">
                        <Download size={12} /> Download
                      </a>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
