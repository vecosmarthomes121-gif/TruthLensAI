import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Key, Zap, Shield, Globe, BarChart3, CheckCircle, Copy,
  ArrowRight, Bell, Mail, Loader2, PartyPopper, Lock, Cpu,
  FileText, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Sample code snippets ──────────────────────────────────────────────────────

const curlExample = `curl -X POST https://api.truthlens.ai/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claim": "Scientists confirm a major breakthrough in Alzheimer treatment",
    "input_type": "text"
  }'`;

const jsExample = `const response = await fetch('https://api.truthlens.ai/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    claim: 'Scientists confirm a major breakthrough in Alzheimer treatment',
    input_type: 'text', // 'text' | 'url' | 'image' | 'video'
  }),
});

const result = await response.json();
console.log(result.truth_score); // 0–100
console.log(result.status);      // 'true' | 'mostly-true' | 'disputed' | ...
console.log(result.sources);     // Array of credibility-rated sources`;

const responseExample = `{
  "id": "ver_01HZ...",
  "claim": "Scientists confirm a major breakthrough in Alzheimer treatment",
  "input_type": "text",
  "truth_score": 62,
  "status": "disputed",
  "explanation": "Preliminary research published in Nature shows promising results, but the study involved only 120 participants and has not yet been replicated. Multiple sources note it is early-stage and peer review is ongoing.",
  "sources": [
    {
      "name": "Reuters",
      "url": "https://reuters.com/...",
      "credibility_score": 92,
      "stance": "neutral",
      "excerpt": "Researchers at Johns Hopkins report early-stage trial results..."
    }
  ],
  "verified_at": "2026-05-02T14:23:11Z"
}`;

// ── Plans ─────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Free',
    badge: null,
    price: '$0',
    period: '/mo',
    desc: 'For individuals and small projects',
    features: [
      '100 verifications / month',
      'Text and URL verification',
      'Standard response time (~3s)',
      'JSON API responses',
      'Community support',
    ],
    cta: 'Get Early Access',
    highlighted: false,
  },
  {
    name: 'Pro',
    badge: 'Most Popular',
    price: '$49',
    period: '/mo',
    desc: 'For newsrooms and growing teams',
    features: [
      '5,000 verifications / month',
      'All input types (text, URL, image, video)',
      'Deepfake & AI generation detection',
      'Priority response time (~1s)',
      'Webhook callbacks',
      'Team API key management',
      'Email support',
    ],
    cta: 'Get Early Access',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    badge: null,
    price: 'Custom',
    period: '',
    desc: 'For large media organisations',
    features: [
      'Unlimited verifications',
      'Dedicated API infrastructure',
      'Custom rate limits',
      'SLA guarantee (99.9% uptime)',
      'SSO & audit logs',
      'On-premise deployment option',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

// ── Endpoint table ────────────────────────────────────────────────────────────

const endpoints = [
  {
    method: 'POST',
    path: '/v1/verify',
    desc: 'Submit a claim, URL, image URL, or video URL for AI verification',
    icon: Zap,
    color: 'text-green-600 bg-green-50',
  },
  {
    method: 'GET',
    path: '/v1/verify/:id',
    desc: 'Retrieve a previous verification result by ID',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    method: 'GET',
    path: '/v1/trending',
    desc: 'Fetch currently trending claims verified by multiple users',
    icon: BarChart3,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    method: 'GET',
    path: '/v1/history',
    desc: 'List all verifications made by your API key (paginated)',
    icon: Globe,
    color: 'text-indigo-600 bg-indigo-50',
  },
];

// ── Input types ───────────────────────────────────────────────────────────────

const inputTypes = [
  { icon: FileText, label: 'text', desc: 'Claims, headlines, and political statements', color: 'text-blue-600 bg-blue-50' },
  { icon: LinkIcon, label: 'url', desc: 'Full articles — TruthLens extracts and analyses content', color: 'text-indigo-600 bg-indigo-50' },
  { icon: ImageIcon, label: 'image', desc: 'Deepfake, AI-generation, and manipulation detection', color: 'text-purple-600 bg-purple-50' },
  { icon: VideoIcon, label: 'video', desc: 'YouTube, TikTok, and uploaded video misinformation analysis', color: 'text-pink-600 bg-pink-50' },
];

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
      title="Copy"
    >
      {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

// ── CodeBlock ─────────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">{label}</span>
      </div>
      <div className="relative bg-gray-900">
        <pre className="p-5 text-sm text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
          {code}
        </pre>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ApiAccessPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'response'>('curl');

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('extension_waitlist')
      .insert({ email: email.trim().toLowerCase() });
    setSubmitting(false);
    if (error) {
      if (error.code === '23505') {
        toast.info("You're already on the list — we'll be in touch!");
        setSubmitted(true);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      return;
    }
    setSubmitted(true);
    setEmail('');
    toast.success("Got it! We'll send you API access credentials when we launch.");
  };

  const tabs: { id: 'curl' | 'js' | 'response'; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'js', label: 'JavaScript' },
    { id: 'response', label: 'Response' },
  ];

  return (
    <div className="flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold mb-8">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              API Access — Coming Soon · Join the Waitlist
            </div>

            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
                <Code2 className="h-10 w-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              TruthLens AI API
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Integrate real-time AI fact-checking and deepfake detection directly into your application, CMS, or newsroom workflow — with a single REST API call.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#early-access" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow">
                <Key className="h-5 w-5" />
                Request Early Access
              </a>
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Try Web Interface
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key stats ───────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-5">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Input types supported', value: '4' },
              { label: 'Avg response time', value: '~3s' },
              { label: 'JSON REST API', value: '✓' },
              { label: 'Webhook support', value: '✓' },
              { label: 'Knowledge current to', value: '2026' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/8 border border-white/10">
                <span className="font-bold text-white text-sm">{value}</span>
                <span className="text-white/50 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code example ────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-900">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm mb-4">
                <Code2 className="h-4 w-4" /> Simple Integration
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-5 leading-tight">
                One Endpoint.<br />Any Content Type.
              </h2>
              <p className="text-white/65 leading-relaxed mb-6">
                Send a POST request with your claim, URL, image URL, or video URL. TruthLens handles the rest — web search, AI forensics, deepfake detection, and source citations — and returns a structured JSON response in seconds.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {inputTypes.map(({ icon: Icon, label, desc, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-white font-mono text-sm font-bold mb-0.5">"{label}"</p>
                    <p className="text-white/45 text-xs leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Code tabs */}
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div className="bg-gray-800 flex items-center gap-1 px-4 py-3">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-white/50 hover:text-white/80'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative bg-gray-900">
                <pre className="p-5 text-sm text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre max-h-[380px]">
                  {activeTab === 'curl' && curlExample}
                  {activeTab === 'js' && jsExample}
                  {activeTab === 'response' && responseExample}
                </pre>
                <CopyButton
                  text={
                    activeTab === 'curl'
                      ? curlExample
                      : activeTab === 'js'
                      ? jsExample
                      : responseExample
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Endpoints ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <Globe className="h-4 w-4" /> REST Endpoints
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Clean, Predictable API</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Standard REST conventions with JSON responses, Bearer token auth, and HTTP status codes you already know.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {endpoints.map(({ method, path, desc, icon: Icon, color }) => (
              <div key={path} className="bg-card border rounded-xl p-5 flex items-start gap-5 hover:shadow-md transition-shadow">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide',
                      method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {method}
                    </span>
                    <code className="text-sm font-mono font-semibold">{path}</code>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Auth note */}
          <div className="max-w-4xl mx-auto mt-8 p-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
            <Key className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-200 mb-0.5">Authentication</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                All requests require a Bearer token in the <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono text-xs">Authorization</code> header.
                API keys are issued per account and can be rotated at any time from the developer dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Response format ─────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Structured, Predictable Responses</h2>
              <p className="text-muted-foreground">Every response includes truth score, verdict, explanation, and source citations</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <CodeBlock code={responseExample} label="Response · application/json" />
              <div className="space-y-4">
                {[
                  { field: 'truth_score', type: 'integer', desc: '0–100 confidence that the claim is true, based on live web sources', color: 'text-green-600' },
                  { field: 'status', type: 'enum', desc: '"true" | "mostly-true" | "disputed" | "mostly-false" | "false"', color: 'text-blue-600' },
                  { field: 'explanation', type: 'string', desc: 'AI-generated fact-check narrative referencing specific search results', color: 'text-purple-600' },
                  { field: 'sources', type: 'array', desc: 'Credibility-rated sources with stance (supports / contradicts / neutral)', color: 'text-indigo-600' },
                  { field: 'content_analysis', type: 'object', desc: 'For images/videos: deepfake verdict, confidence scores, and anomaly lists', color: 'text-orange-600' },
                ].map(({ field, type, desc, color }) => (
                  <div key={field} className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <code className={cn('text-sm font-mono font-bold', color)}>{field}</code>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <BarChart3 className="h-4 w-4" /> Pricing
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Usage-Based Plans</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free. Scale as your verification volume grows. No surprise overage fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map(({ name, badge, price, period, desc, features, cta, highlighted }) => (
              <div
                key={name}
                className={cn(
                  'rounded-2xl border p-7 flex flex-col',
                  highlighted
                    ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white border-transparent shadow-xl shadow-blue-600/20 scale-[1.02]'
                    : 'bg-card'
                )}
              >
                {badge && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 self-start">
                    {badge}
                  </span>
                )}
                <p className={cn('text-sm font-semibold mb-1', highlighted ? 'text-white/70' : 'text-muted-foreground')}>{name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black">{price}</span>
                  <span className={cn('text-sm mb-1', highlighted ? 'text-white/70' : 'text-muted-foreground')}>{period}</span>
                </div>
                <p className={cn('text-sm mb-6', highlighted ? 'text-white/70' : 'text-muted-foreground')}>{desc}</p>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {features.map(feat => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={cn('h-4 w-4 flex-shrink-0 mt-0.5', highlighted ? 'text-green-300' : 'text-green-600')} />
                      <span className={highlighted ? 'text-white/90' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a href="#early-access" className={cn(
                  'w-full py-3 rounded-xl font-bold text-sm text-center transition-all',
                  highlighted
                    ? 'bg-white text-blue-700 hover:shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                )}>
                  {cta}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans include access to the web interface and browser extension at no extra cost.
          </p>
        </div>
      </section>

      {/* ── Trust / Privacy ─────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Privacy by Design',
                desc: 'API requests are never logged for training purposes. Verification data is tied to your key, not shared across accounts.',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: Shield,
                title: 'Enterprise-Ready Security',
                desc: 'TLS 1.3 in transit, AES-256 at rest, key rotation support, and GDPR-compliant data handling.',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                icon: Cpu,
                title: 'Built on Frontier AI',
                desc: 'Powered by Google Gemini 3 and live Serper web search — always current, always sourced.',
                color: 'text-purple-600 bg-purple-50',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-card border rounded-xl p-6">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4', color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ──────────────────────────────────────────────── */}
      <section className="py-10 bg-amber-50 dark:bg-amber-950/10 border-b border-amber-100 dark:border-amber-900/30">
        <div className="container">
          <div className="max-w-3xl mx-auto flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>Developer Note:</strong> The TruthLens AI API is currently in pre-release development. The endpoints, request/response shapes, and pricing shown are subject to change before general availability. Request early access below to be first in line and shape the final specification.
            </p>
          </div>
        </div>
      </section>

      {/* ── Early Access CTA ────────────────────────────────────────── */}
      <section className="py-20" id="early-access">
        <div className="container">
          <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-10 lg:p-14 text-center text-white max-w-3xl mx-auto">
            {submitted ? (
              <>
                <PartyPopper className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-bold mb-3">You're on the Early Access List!</h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                  We'll send API credentials directly to your inbox before public launch. In the meantime, explore the full verification experience via the web app.
                </p>
              </>
            ) : (
              <>
                <Key className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-bold mb-3">Request Early API Access</h2>
                <p className="text-white/75 mb-8 max-w-lg mx-auto leading-relaxed">
                  Join the waitlist and receive your API key before the public launch. We'll also share the final OpenAPI spec and SDKs with early access members first.
                </p>
                <form onSubmit={handleRequestAccess} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="developer@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow disabled:opacity-60 whitespace-nowrap"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                    Request Access
                  </button>
                </form>
                <p className="text-white/40 text-xs mb-8">No spam. One notification when your key is ready.</p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow"
              >
                <Zap className="h-5 w-5" />
                Try the Web App
              </button>
              <button
                onClick={() => window.open('mailto:api@truthlens.ai', '_blank')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Contact API Team
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
