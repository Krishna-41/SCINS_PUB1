import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Conference } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { Card, CardBody } from '@/components/ui/Card';

export function ConferenceRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [conf, setConf] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refNum, setRefNum] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', affiliation: '', country: '',
    registration_type: 'Standard', attendance_mode: 'In-person',
  });

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('conferences')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setConf((data as unknown as Conference) || null);
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conf) return;
    setSubmitting(true);
    const reference = `SCINS-REG-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('conference_registrations').insert({
      conference_id: conf.id,
      ...form,
      reference_number: reference,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      alert('Registration failed: ' + error.message);
    } else {
      setRefNum(reference);
      setSuccess(true);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!conf) return <div className="container-wide py-20"><EmptyState title="Conference not found" /></div>;

  if (success) {
    return (
      <div className="container-prose py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-success-500 mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">Registration Submitted!</h1>
        <p className="text-navy-500 mb-4">Your registration reference number is:</p>
        <p className="text-xl font-mono font-bold text-teal-600 mb-6">{refNum}</p>
        <p className="text-sm text-navy-400 mb-6">We will contact you at {form.email} with further details.</p>
        <Link to="/conferences" className="text-teal-600 font-medium inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to conferences
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-8">
          <Link to={`/conferences/${slug}`} className="text-sm text-teal-600 inline-flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Back to {conf.name}
          </Link>
          <h1 className="text-3xl font-serif font-bold text-navy-900">Register for {conf.name}</h1>
        </div>
      </div>
      <div className="container-prose py-8">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                <Input label="Affiliation" value={form.affiliation} onChange={(e) => setForm({...form, affiliation: e.target.value})} />
                <Input label="Country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} required />
                <Select label="Registration Type" value={form.registration_type} onChange={(e) => setForm({...form, registration_type: e.target.value})}>
                  <option>Standard</option>
                  <option>Student</option>
                  <option>Early Bird</option>
                  <option>Group</option>
                </Select>
                <Select label="Attendance Mode" value={form.attendance_mode} onChange={(e) => setForm({...form, attendance_mode: e.target.value})}>
                  <option>In-person</option>
                  <option>Virtual</option>
                  <option>Hybrid</option>
                </Select>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function ConferenceSubmitAbstractPage() {
  const { slug } = useParams<{ slug: string }>();
  const [conf, setConf] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '', abstract: '', keywords: '', presenting_author: '',
    authors_list: '', presentation_type: 'Oral', track: '',
  });

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('conferences')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setConf((data as unknown as Conference) || null);
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conf) return;
    setSubmitting(true);
    const keywords = form.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    const { error } = await supabase.from('conference_abstracts').insert({
      conference_id: conf.id,
      title: form.title,
      abstract: form.abstract,
      keywords,
      presenting_author: form.presenting_author,
      authors_list: form.authors_list,
      presentation_type: form.presentation_type,
      track: form.track,
      status: 'submitted',
    });
    setSubmitting(false);
    if (error) {
      alert('Submission failed: ' + error.message);
    } else {
      setSuccess(true);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!conf) return <div className="container-wide py-20"><EmptyState title="Conference not found" /></div>;

  if (success) {
    return (
      <div className="container-prose py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-success-500 mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">Abstract Submitted!</h1>
        <p className="text-navy-500 mb-6">Your abstract has been received and is under review.</p>
        <Link to="/conferences" className="text-teal-600 font-medium inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to conferences
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-8">
          <Link to={`/conferences/${slug}`} className="text-sm text-teal-600 inline-flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Back to {conf.name}
          </Link>
          <h1 className="text-3xl font-serif font-bold text-navy-900">Submit Abstract — {conf.name}</h1>
        </div>
      </div>
      <div className="container-prose py-8">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
              <Textarea label="Abstract" value={form.abstract} onChange={(e) => setForm({...form, abstract: e.target.value})} required />
              <Input label="Keywords (comma-separated)" value={form.keywords} onChange={(e) => setForm({...form, keywords: e.target.value})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Presenting Author" value={form.presenting_author} onChange={(e) => setForm({...form, presenting_author: e.target.value})} required />
                <Input label="All Authors" value={form.authors_list} onChange={(e) => setForm({...form, authors_list: e.target.value})} />
                <Select label="Presentation Type" value={form.presentation_type} onChange={(e) => setForm({...form, presentation_type: e.target.value})}>
                  <option>Oral</option>
                  <option>Poster</option>
                  <option>Workshop</option>
                  <option>Symposium</option>
                </Select>
                <Input label="Track / Topic" value={form.track} onChange={(e) => setForm({...form, track: e.target.value})} />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Abstract'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
