import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Search, Users, ClipboardCheck, Gavel, RefreshCw, CircleCheck as CheckCircle2, Globe, ChevronDown, ChevronUp, ArrowRight, UserCheck, Mail, CircleAlert as AlertCircle, BookOpen } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

interface Stage {
  num: number;
  title: string;
  icon: typeof FileText;
  description: string;
  details: string[];
}

const stages: Stage[] = [
  {
    num: 1,
    title: 'Manuscript Submission',
    icon: FileText,
    description: 'Authors submit manuscripts through the online system with full metadata and supporting files.',
    details: [
      'Author provides title, abstract, keywords, and author affiliations.',
      'Supporting files, declarations, and funding statements are uploaded.',
      'An automatic acknowledgement and reference number is generated.',
    ],
  },
  {
    num: 2,
    title: 'Editorial Screening',
    icon: Search,
    description: 'The editorial team performs an initial assessment for scope, formatting, and ethics.',
    details: [
      'Editors verify the manuscript fits the journal scope and aims.',
      'Plagiarism and ethical compliance checks are conducted.',
      'Out-of-scope or non-compliant manuscripts may be returned or rejected at this stage.',
    ],
  },
  {
    num: 3,
    title: 'Reviewer Assignment',
    icon: Users,
    description: 'Independent, qualified experts in the subject matter are selected to review the manuscript.',
    details: [
      'Reviewers are chosen based on subject-matter expertise and absence of conflicts of interest.',
      'A double-blind model keeps both author and reviewer identities confidential.',
      'Reviewers are invited and given a defined timeframe to complete their assessment.',
    ],
  },
  {
    num: 4,
    title: 'Peer Review',
    icon: ClipboardCheck,
    description: 'Reviewers evaluate originality, scientific quality, clarity, and ethical considerations.',
    details: [
      'Originality and significance of the research are assessed.',
      'Methodology, results, and conclusions are checked for soundness.',
      'Constructive feedback and revision suggestions are compiled.',
    ],
  },
  {
    num: 5,
    title: 'Editorial Decision',
    icon: Gavel,
    description: 'The editor considers reviewer recommendations and decides on the manuscript.',
    details: [
      'Accept: the manuscript meets journal standards and is approved for publication.',
      'Minor revisions: small improvements are requested before final acceptance.',
      'Major revisions: substantial changes are required, followed by another review round.',
      'Reject: the manuscript does not meet the journal standards.',
    ],
  },
  {
    num: 6,
    title: 'Revisions',
    icon: RefreshCw,
    description: 'Authors address reviewer comments and resubmit a revised manuscript.',
    details: [
      'Authors revise the manuscript and provide a point-by-point response to reviewers.',
      'Revised manuscripts may undergo a further round of review.',
      'The cycle continues until the manuscript is deemed ready for publication.',
    ],
  },
  {
    num: 7,
    title: 'Publication',
    icon: Globe,
    description: 'Accepted articles undergo final formatting and are published as open access.',
    details: [
      'Final proofreading, typesetting, and quality checks are performed.',
      'A DOI is assigned and the article is indexed for discoverability.',
      'The article is made freely available to readers worldwide under an open access license.',
    ],
  },
];

const reviewerResponsibilities = [
  'Accept review invitations only when you have the relevant expertise and time to complete the review.',
  'Declare any conflicts of interest that could bias your assessment.',
  'Maintain confidentiality of the manuscript throughout the review process.',
  'Provide constructive, objective, and clearly reasoned feedback to the authors.',
  'Submit your review within the agreed timeframe or notify the editor promptly if delays arise.',
  'Avoid using unpublished material from the manuscript for personal advantage.',
];

const authorGuidance = [
  'Ensure your manuscript is original, not under review elsewhere, and approved by all authors.',
  'Follow the journal formatting and submission guidelines closely.',
  'Provide complete declarations for funding, conflicts of interest, and ethics approval.',
  'Respond to reviewer comments with a detailed, point-by-point cover letter.',
  'Resubmit revised manuscripts within the timeframe specified by the editor.',
];

const faqs = [
  {
    q: 'What review model does SCINS MEDIA follow?',
    a: 'SCINS MEDIA journals generally follow a double-blind peer review model, where the identities of both authors and reviewers remain confidential throughout the process. The specific model per journal is listed on each journal page.',
  },
  {
    q: 'How long does the peer review process take?',
    a: 'The timeline varies by journal and reviewer availability. After editorial screening, the peer review stage typically takes several weeks. Authors are kept informed at each stage of the process.',
  },
  {
    q: 'What are the possible editorial decisions?',
    a: 'Editors may accept the manuscript, request minor or major revisions, or reject it. Decisions are based on reviewer feedback and the journal editorial standards.',
  },
  {
    q: 'How do I respond to reviewer comments?',
    a: 'Prepare a point-by-point response letter. For each comment, describe the change made in the revised manuscript or provide a clear rationale if a suggestion was not incorporated.',
  },
  {
    q: 'Can I suggest reviewers for my manuscript?',
    a: 'Authors may suggest potential reviewers during submission. Editors consider these suggestions but are not obligated to use them and independently select qualified reviewers.',
  },
  {
    q: 'How can I become a reviewer for SCINS MEDIA journals?',
    a: 'Qualified scholars are welcome to join our reviewer pool. Contact the editorial team with your areas of expertise and a summary of your qualifications.',
  },
];

function StageCard({ stage, active, onClick }: { stage: Stage; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-5 transition-all ${
        active
          ? 'border-teal-400 bg-teal-50 shadow-sm'
          : 'border-navy-100 bg-white hover:border-teal-200 hover:bg-navy-50/50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 transition-colors ${
            active ? 'bg-teal-600 text-white' : 'bg-navy-50 text-navy-500'
          }`}
        >
          <stage.icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-600">STEP {stage.num}</span>
          </div>
          <h3 className="text-base font-serif font-bold text-navy-900">{stage.title}</h3>
        </div>
        <div className="flex-shrink-0">
          {active ? <ChevronUp size={18} className="text-navy-400" /> : <ChevronDown size={18} className="text-navy-400" />}
        </div>
      </div>
    </button>
  );
}

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-navy-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-navy-800">
          <span className="text-teal-600 font-bold mr-2">{index + 1}.</span>
          {faq.q}
        </span>
        {open ? <ChevronUp size={18} className="text-navy-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-navy-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-navy-600 leading-relaxed animate-slide-down">
          {faq.a}
        </div>
      )}
    </div>
  );
}

export function PeerReviewPage() {
  const [activeStage, setActiveStage] = useState(1);
  const stage = stages.find((s) => s.num === activeStage) ?? stages[0];
  const progress = Math.round((activeStage / stages.length) * 100);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(20,184,166,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 80%, rgba(14,165,233,0.3) 0%, transparent 50%)'
        }} />
        <div className="container-wide relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-4 py-1.5 mb-6">
              <ShieldCheck size={16} className="text-teal-400" />
              <span className="text-sm text-teal-300 font-medium">Rigorous &amp; Transparent</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight mb-6">
              Peer Review Process
            </h1>
            <p className="text-lg text-navy-200 leading-relaxed mb-8 max-w-2xl">
              SCINS MEDIA upholds the highest standards of scholarly integrity. Our peer review
              process ensures every published article meets rigorous academic and ethical standards,
              with expert reviewers evaluating the quality, originality, and scientific merit of each submission.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                Submit Manuscript <ArrowRight size={18} />
              </Link>
              <Link
                to="/pages/peer-review-policy"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Review Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">The Review Journey</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              Follow a manuscript through each stage of the peer review process. Click a step to explore it.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-navy-600">Progress</span>
              <span className="text-sm font-bold text-teal-600">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {/* Stage list */}
            <div className="lg:col-span-2 space-y-3">
              {stages.map((s) => (
                <StageCard
                  key={s.num}
                  stage={s}
                  active={activeStage === s.num}
                  onClick={() => setActiveStage(s.num)}
                />
              ))}
            </div>

            {/* Active stage detail */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardBody>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white">
                      <stage.icon size={28} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-teal-600">STEP {stage.num} OF {stages.length}</div>
                      <h3 className="text-xl font-serif font-bold text-navy-900">{stage.title}</h3>
                    </div>
                  </div>
                  <p className="text-navy-600 leading-relaxed mb-5">{stage.description}</p>
                  <ul className="space-y-3">
                    {stage.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-navy-700">{d}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Navigation buttons */}
                  <div className="flex justify-between mt-6 pt-4 border-t border-navy-100">
                    <button
                      onClick={() => setActiveStage(Math.max(1, activeStage - 1))}
                      disabled={activeStage === 1}
                      className="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={16} className="rotate-90" /> Previous
                    </button>
                    <button
                      onClick={() => setActiveStage(Math.min(stages.length, activeStage + 1))}
                      disabled={activeStage === stages.length}
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronDown size={16} className="-rotate-90" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Reviewer responsibilities */}
      <section className="bg-navy-50 py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <UserCheck className="h-10 w-10 text-teal-600 mx-auto mb-3" />
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Reviewer Responsibilities</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              Reviewers play a critical role in safeguarding the quality of published research.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {reviewerResponsibilities.map((r) => (
              <div key={r} className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-5">
                <ShieldCheck className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-navy-700">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author guidance */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <FileText className="h-10 w-10 text-teal-600 mx-auto mb-3" />
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Guidance for Authors</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              How to prepare your manuscript and navigate the review process smoothly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {authorGuidance.map((g) => (
              <div key={g} className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-5">
                <BookOpen className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-navy-700">{g}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-navy-50 py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <AlertCircle className="h-10 w-10 text-teal-600 mx-auto mb-3" />
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-navy-500 max-w-2xl mx-auto">
              Common questions about the peer review process at SCINS MEDIA.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-10 lg:p-14 text-center">
            <Mail className="h-12 w-12 text-teal-400 mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-white mb-3">
              Questions about peer review?
            </h2>
            <p className="text-navy-200 max-w-xl mx-auto mb-6">
              Our editorial team is here to help. Submit your manuscript or reach out with any questions
              about the review process.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                Submit Manuscript <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Contact Editorial Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
