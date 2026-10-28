import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-navy-50">
      <div className="text-center px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-900 text-teal-400 font-serif font-bold text-4xl">
            404
          </div>
        </div>
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-3">Page Not Found</h1>
        <p className="text-navy-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 border border-navy-200 hover:border-teal-400 text-navy-700 hover:text-teal-600 font-medium px-5 py-2.5 rounded-lg transition-colors bg-white"
          >
            <Search size={18} />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
