import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Mic, ArrowRight, ChevronRight, Users, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Conference, ConferenceSpeaker } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export function ConferencesListPage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('conferences')
      .select('*')
      .eq('status', 'published')
      .order('start_date', { ascending: true })
      .then(({ data }) => {
        setConferences((data as unknown as Conference[]) || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Loading conferences..." />;

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Academic Conferences</h1>
          <p className="text-navy-500">Discover upcoming conferences organized by SCINS MEDIA.</p>
        </div>
      </div>
      <div className="container-wide py-8">
        {conferences.length === 0 ? (
          <EmptyState title="No upcoming conferences" description="New conference announcements will appear here." />
        ) : (
          <div className="space-y-6">
            {conferences.map((conf) => {
              const now = new Date();
              const start = conf.start_date ? new Date(conf.start_date) : null;
              const end = conf.end_date ? new Date(conf.end_date) : null;
              const isUpcoming = start && start > now;
              const isOngoing = start && end && start <= now && end >= now;
              const isPast = end && end < now;

              return (
                <Link key={conf.id} to={`/conferences/${conf.slug}`}>
                  <Card hover>
                    <CardBody className="flex flex-col md:flex-row gap-6">
                      {conf.banner_url ? (
                        <img src={conf.banner_url} alt={conf.name} className="w-full md:w-64 h-40 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-full md:w-64 h-40 rounded-lg bg-gradient-to-br from-teal-50 to-navy-50 flex items-center justify-center flex-shrink-0">
                          <Mic className="h-12 w-12 text-teal-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isUpcoming && <Badge variant="info">Upcoming</Badge>}
                          {isOngoing && <Badge variant="success">Ongoing</Badge>}
                          {isPast && <Badge variant="default">Past Event</Badge>}
                          {conf.acronym && <span className="text-sm text-navy-400 font-medium">{conf.acronym}</span>}
                        </div>
                        <h2 className="text-xl font-serif font-bold text-navy-900 mb-2">{conf.name}</h2>
                        <p className="text-sm text-navy-500 line-clamp-2 mb-3">{conf.theme || conf.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-navy-500">
                          {conf.start_date && (
                            <span className="flex items-center gap-1.5">
                              <Calendar size={16} className="text-navy-400" />
                              {new Date(conf.start_date).toLocaleDateString()}
                              {conf.end_date && ` – ${new Date(conf.end_date).toLocaleDateString()}`}
                            </span>
                          )}
                          {conf.city && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={16} className="text-navy-400" />
                              {conf.city}, {conf.country}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 text-sm text-teal-600 font-medium inline-flex items-center gap-1">
                          View details <ArrowRight size={14} />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConferenceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [conf, setConf] = useState<Conference | null>(null);
  const [speakers, setSpeakers] = useState<ConferenceSpeaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from('conferences')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!data) { setLoading(false); return; }
      setConf(data as unknown as Conference);

      const { data: spk } = await supabase
        .from('conference_speakers')
        .select('*')
        .eq('conference_id', data.id)
        .order('sort_order', { ascending: true });
      setSpeakers((spk as unknown as ConferenceSpeaker[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <LoadingSpinner label="Loading conference..." />;
  if (!conf) {
    return (
      <div className="container-wide py-20">
        <EmptyState
          title="Conference not found"
          action={<Link to="/conferences" className="text-teal-600 font-medium">Back to conferences</Link>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {conf.banner_url ? (
        <div className="relative h-64 bg-navy-900">
          <img src={conf.banner_url} alt={conf.name} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container-wide pb-6">
            <h1 className="text-3xl font-serif font-bold text-white">{conf.name}</h1>
            {conf.theme && <p className="text-navy-200 mt-1">{conf.theme}</p>}
          </div>
        </div>
      ) : (
        <div className="bg-navy-900 py-12">
          <div className="container-wide">
            <h1 className="text-3xl font-serif font-bold text-white">{conf.name}</h1>
            {conf.theme && <p className="text-navy-200 mt-1">{conf.theme}</p>}
          </div>
        </div>
      )}

      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm text-navy-400">
            <Link to="/" className="hover:text-navy-600">Home</Link>
            <ChevronRight size={14} />
            <Link to="/conferences" className="hover:text-navy-600">Conferences</Link>
            <ChevronRight size={14} />
            <span className="text-navy-600 truncate">{conf.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {conf.description && (
              <div>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">About this Conference</h2>
                <p className="text-navy-700 leading-relaxed">{conf.description}</p>
              </div>
            )}

            {conf.topics.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {conf.topics.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {conf.call_for_papers && (
              <div>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">Call for Papers</h2>
                <p className="text-navy-700 leading-relaxed">{conf.call_for_papers}</p>
              </div>
            )}

            {speakers.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">Speakers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {speakers.map((sp) => (
                    <Card key={sp.id}>
                      <CardBody className="flex items-start gap-4">
                        {sp.photo_url ? (
                          <img src={sp.photo_url} alt={sp.name} className="h-16 w-16 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                            <Users className="h-7 w-7 text-navy-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-serif font-bold text-navy-900">{sp.name}</h3>
                          {sp.title && <p className="text-xs text-teal-600 font-medium">{sp.title}</p>}
                          {sp.affiliation && <p className="text-xs text-navy-400">{sp.affiliation}</p>}
                          {sp.bio && <p className="text-xs text-navy-500 mt-1 line-clamp-3">{sp.bio}</p>}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h3 className="text-sm font-bold text-navy-900 mb-4">Event Details</h3>
                {conf.start_date && (
                  <div className="flex items-start gap-2 mb-3 text-sm">
                    <Calendar size={16} className="text-navy-400 mt-0.5" />
                    <div>
                      <p className="text-navy-700 font-medium">{new Date(conf.start_date).toLocaleDateString()}</p>
                      {conf.end_date && <p className="text-navy-400 text-xs">to {new Date(conf.end_date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                )}
                {conf.city && (
                  <div className="flex items-start gap-2 mb-3 text-sm">
                    <MapPin size={16} className="text-navy-400 mt-0.5" />
                    <p className="text-navy-700">{conf.venue ? `${conf.venue}, ` : ''}{conf.city}, {conf.country}</p>
                  </div>
                )}
                {conf.organizing_institution && (
                  <div className="flex items-start gap-2 mb-3 text-sm">
                    <Users size={16} className="text-navy-400 mt-0.5" />
                    <p className="text-navy-700">{conf.organizing_institution}</p>
                  </div>
                )}
                {conf.abstract_deadline && (
                  <div className="flex items-start gap-2 mb-3 text-sm">
                    <Clock size={16} className="text-navy-400 mt-0.5" />
                    <div>
                      <p className="text-navy-400 text-xs">Abstract Deadline</p>
                      <p className="text-navy-700 font-medium">{new Date(conf.abstract_deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {conf.contact_email && (
                  <a href={`mailto:${conf.contact_email}`} className="text-sm text-teal-600 hover:text-teal-700">
                    {conf.contact_email}
                  </a>
                )}
              </CardBody>
            </Card>

            <div className="flex flex-col gap-3">
              <Link
                to={`/conferences/${conf.slug}/register`}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                Register Now <ArrowRight size={16} />
              </Link>
              <Link
                to={`/conferences/${conf.slug}/submit`}
                className="inline-flex items-center justify-center gap-2 border border-navy-200 hover:border-teal-400 text-navy-700 hover:text-teal-600 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                Submit Abstract
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
