import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

export function ContactPage() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      ...form,
      status: 'unread',
    });
    setLoading(false);
    if (error) {
      alert('Failed to send message: ' + error.message);
    } else {
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Contact Us</h1>
          <p className="text-navy-500">Have a question? We'd love to hear from you.</p>
        </div>
      </div>
      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {settings.footer_contact_email && (
              <Card><CardBody className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><Mail size={20} /></div>
                <div><p className="text-xs text-navy-400">Email</p><a href={`mailto:${settings.footer_contact_email}`} className="text-sm font-medium text-navy-700 hover:text-teal-600">{settings.footer_contact_email}</a></div>
              </CardBody></Card>
            )}
            {settings.footer_phone && (
              <Card><CardBody className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><Phone size={20} /></div>
                <div><p className="text-xs text-navy-400">Phone</p><p className="text-sm font-medium text-navy-700">{settings.footer_phone}</p></div>
              </CardBody></Card>
            )}
            {settings.footer_address && (
              <Card><CardBody className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><MapPin size={20} /></div>
                <div><p className="text-xs text-navy-400">Address</p><p className="text-sm font-medium text-navy-700">{settings.footer_address}</p></div>
              </CardBody></Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardBody>
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-success-500 mx-auto mb-3" />
                    <h2 className="text-lg font-serif font-bold text-navy-900 mb-1">Message Sent!</h2>
                    <p className="text-sm text-navy-500">We'll get back to you as soon as possible.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Your Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                    </div>
                    <Input label="Subject" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} />
                    <Textarea label="Message" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required />
                    <Button type="submit" size="lg" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'}
                      {!loading && <Send size={16} />}
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
