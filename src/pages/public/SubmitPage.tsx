import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SubmitPage() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [refNum, setRefNum] = useState('');

  const steps = [
    { num: 1, label: 'Manuscript Info' },
    { num: 2, label: 'Authors' },
    { num: 3, label: 'Declarations' },
    { num: 4, label: 'Review & Submit' },
  ];

  if (success) {
    return (
      <div className="container-prose py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-success-500 mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">Manuscript Submitted!</h1>
        <p className="text-navy-500 mb-4">Your manuscript reference number is:</p>
        <p className="text-xl font-mono font-bold text-teal-600 mb-6">{refNum}</p>
        <p className="text-sm text-navy-400 mb-6">You will receive updates on your submission status. Sign in to track your manuscript in your dashboard.</p>
        <Link to="/login" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg">
          Sign In to Track <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-wide py-12">
          <h1 className="text-4xl font-serif font-bold text-navy-900 mb-2">Submit Manuscript</h1>
          <p className="text-navy-500 max-w-2xl">
            Submit your research to SCINS MEDIA. Our editorial team will review your submission
            and guide you through the peer-review process.
          </p>
        </div>
      </div>

      <div className="container-prose py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-teal-600' : 'text-navy-300'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step >= s.num ? 'bg-teal-600 text-white' : 'bg-navy-100 text-navy-400'
                }`}>
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-teal-400' : 'bg-navy-100'}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardBody>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif font-bold text-navy-900">Manuscript Information</h2>
                <Select label="Article Type" defaultValue="Research Article">
                  <option>Research Article</option>
                  <option>Review Article</option>
                  <option>Case Report</option>
                  <option>Short Communication</option>
                  <option>Letter to Editor</option>
                </Select>
                <Input label="Manuscript Title" placeholder="Enter the full title of your manuscript" required />
                <Textarea label="Abstract" placeholder="Paste your abstract here..." required />
                <Input label="Keywords (comma-separated)" placeholder="e.g. cancer, immunotherapy, clinical trial" />
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif font-bold text-navy-900">Author Information</h2>
                <Input label="Corresponding Author Name" placeholder="Dr. Jane Smith" required />
                <Input label="Corresponding Author Email" type="email" placeholder="jane@university.edu" required />
                <Input label="Affiliation" placeholder="Department of Biology, University X" />
                <Input label="Country" placeholder="United States" />
                <Input label="ORCID (if available)" placeholder="0000-0000-0000-0000" />
                <Input label="Co-author Names (comma-separated)" placeholder="Dr. John Doe, Dr. Mary Jones" />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif font-bold text-navy-900">Declarations</h2>
                <Textarea label="Funding Statement" placeholder="Describe funding sources, if any" />
                <Textarea label="Conflict of Interest" placeholder="Declare any conflicts of interest" />
                <Textarea label="Ethics Approval" placeholder="Provide ethics approval details if applicable" />
                <Textarea label="Data Availability Statement" placeholder="Describe data availability" />
                <div className="rounded-lg bg-accent-50 border border-accent-100 p-4 flex items-start gap-3">
                  <Info size={18} className="text-accent-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-navy-600">
                    By submitting, you confirm this manuscript is original, not under review elsewhere,
                    and all authors have approved its submission.
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)}>Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif font-bold text-navy-900">Review & Submit</h2>
                <div className="rounded-lg bg-navy-50 border border-navy-100 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Ready</Badge>
                    <span className="text-sm text-navy-600">Your manuscript information is complete</span>
                  </div>
                  <p className="text-sm text-navy-500">
                    Please review all information before submitting. You will receive a confirmation
                    email and a unique manuscript reference number.
                  </p>
                </div>
                <p className="text-sm text-navy-400">
                  Note: This is a demonstration submission form. To submit an actual manuscript,
                  please sign in or create an account first.
                </p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button
                    onClick={() => {
                      const ref = `SCINS-MAN-${Date.now().toString(36).toUpperCase()}`;
                      setRefNum(ref);
                      setSuccess(true);
                    }}
                  >
                    <FileText size={16} /> Submit Manuscript
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
