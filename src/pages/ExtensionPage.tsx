import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  MousePointer,
  Type,
  Image,
  Link as LinkIcon,
  Zap,
  ArrowRight,
  Bell,
  Globe,
  Lock,
  Star,
  Chrome,
  Layers,
} from 'lucide-react';

const methods = [
  {
    icon: Type,
    title: 'Select Any Text',
    desc: 'Highlight a claim or headline on any page and click the "Verify" bubble that appears next to your cursor.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    icon: MousePointer,
    title: 'Right-Click to Verify',
    desc: 'Right-click text, images, or links for an instant TruthLens option in the context menu.',
    color: 'from-purple-600 to-violet-600',
  },
  {
    icon: Zap,
    title: 'Toolbar Popup',
    desc: 'Click the shield icon in your browser toolbar, type or paste anything, and get results in seconds.',
    color: 'from-green-600 to-emerald-600',
  },
  {
    icon: Image,
    title: 'Image Deepfake Check',
    desc: 'Right-click any image to detect AI generation, manipulation, or deepfakes with forensic analysis.',
    color: 'from-orange-600 to-amber-600',
  },
  {
    icon: LinkIcon,
    title: 'Fact-Check Articles',
    desc: 'A floating "Verify Page" button appears automatically on news sites and social platforms.',
    color: 'from-pink-600 to-rose-600',
  },
  {
    icon: Layers,
    title: 'Inline Results',
    desc: 'Results appear as a sleek overlay — truth score, sources, and AI analysis without leaving the page.',
    color: 'from-teal-600 to-cyan-600',
  },
];

const supported = [
  'CNN', 'BBC', 'Reuters', 'AP News', 'New York Times', 'Washington Post',
  'The Guardian', 'Fox News', 'Bloomberg', 'Al Jazeera', 'Twitter / X',
  'Facebook', 'Reddit', 'YouTube', 'LinkedIn', 'TikTok', 'Threads',
];

const features = [
  'Truth score 0–100% with AI explanation',
  'Credibility-rated source citations',
  'Deepfake & AI image detection',
  'Video misinformation analysis',
  'Works on every website automatically',
  'Results appear in-page — no new tabs',
  'Text, images, links & full articles',
  'Privacy-first — no browsing history stored',
];

export default function ExtensionPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-white rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white rounded-full" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm text-sm font-semibold mb-8">
              <span className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse" />
              Coming Soon to Chrome Web Store
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              TruthLens AI
              <br />
              <span className="text-white/80 text-3xl lg:text-4xl font-semibold">Browser Extension</span>
            </h1>
            <p className="text-lg text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
              Fact-check anything on the web in one click — no tab switching, no copy-pasting. Just highlight text, right-click an image, or paste a link and get instant AI verification results right on the page.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                disabled
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-base opacity-75 cursor-not-allowed"
              >
                <Chrome className="h-5 w-5" />
                Add to Chrome — Coming Soon
              </button>
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/15 text-white font-semibold text-base border border-white/25 hover:bg-white/25 transition-all backdrop-blur-sm"
              >
                Use Web App Now
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <p className="text-white/60 text-sm mt-5">Free · Chrome · Edge · Brave · Firefox</p>
          </div>
        </div>
      </section>

      {/* ── Trust chips ─────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-5">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {['One-click install', 'Works on every website', 'No browsing data collected', 'Results appear in-page', 'Free to use'].map(chip => (
              <span key={chip} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                <CheckCircle className="h-3 w-3 text-green-400" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — for users ────────────────────────────────── */}
      <section className="py-20 bg-green-50 dark:bg-green-950/10 border-b border-green-100 dark:border-green-900/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Install in Seconds</h2>
            <p className="text-muted-foreground mb-12">
              Once available on the Chrome Web Store, installing TruthLens is the same as any other extension — no technical steps required.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
              {[
                { step: '1', icon: Globe, label: 'Visit the Chrome Web Store page', color: 'from-blue-500 to-blue-600' },
                { step: '2', icon: Chrome, label: 'Click "Add to Chrome"', color: 'from-indigo-500 to-purple-600' },
                { step: '3', icon: Shield, label: 'Grant permission once — done!', color: 'from-green-500 to-emerald-600' },
              ].map(({ step, icon: Icon, label, color }) => (
                <div key={step} className="flex flex-col items-center gap-3">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg text-white relative`}>
                    <Icon className="h-8 w-8" />
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border-2 border-gray-100 text-gray-800 text-xs font-black flex items-center justify-center shadow">
                      {step}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-card border border-green-200 dark:border-green-800 rounded-xl max-w-xl mx-auto text-left flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                After installing, the extension activates automatically on every website. You'll be asked to grant permission once — that's all. It then works silently in the background, ready whenever you need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 Verification Methods ──────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">6 Ways to Fact-Check Anything</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The extension fits naturally into how you already browse — no extra steps, no new habits to learn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {methods.map((method, i) => {
              const Icon = method.icon;
              return (
                <div key={i} className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all group hover:-translate-y-0.5">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{method.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{method.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features list + mock result ────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Everything You Need,<br />Right on the Page
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                When verification completes, a sleek overlay appears showing you everything — no new tabs, no navigation, no interruption to your reading.
              </p>
              <ul className="space-y-3">
                {features.map(feat => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock overlay preview */}
            <div className="relative">
              <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Shield className="h-5 w-5" /> TruthLens AI
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs">✕</div>
                </div>
                {/* Claim */}
                <div className="px-5 py-3 border-b text-sm text-muted-foreground italic bg-muted/30">
                  "Scientists confirm breakthrough in Alzheimer's treatment…"
                </div>
                {/* Score + verdict */}
                <div className="px-5 py-5 bg-amber-50 dark:bg-amber-950/20 border-b flex items-center gap-5">
                  <div className="flex-shrink-0">
                    <svg width="84" height="84" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#d97706" strokeWidth="10"
                        strokeDasharray="251" strokeDashoffset="100"
                        strokeLinecap="round" transform="rotate(-90 50 50)"/>
                      <text x="50" y="46" textAnchor="middle" fill="#d97706" fontSize="20" fontWeight="800" fontFamily="sans-serif">60</text>
                      <text x="50" y="62" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="600" fontFamily="sans-serif">%</text>
                    </svg>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                      ⚠️ DISPUTED
                    </span>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[200px]">
                      Preliminary study shows promise but peer review is pending. Treat with caution.
                    </p>
                  </div>
                </div>
                {/* Sources */}
                <div className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Top Sources</p>
                  <div className="space-y-1.5">
                    {[['Reuters', '92'], ['The Lancet', '96'], ['BBC Health', '88']].map(([name, score]) => (
                      <div key={name} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg border-l-2 border-blue-500">
                        <span className="text-xs font-semibold">{name}</span>
                        <span className="text-xs font-bold text-green-600">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl opacity-15 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Supported Sites ─────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Works Automatically on 30+ Platforms</h2>
            <p className="text-muted-foreground">Floating verify button appears on these sites after install</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {supported.map(site => (
              <span key={site} className="px-4 py-2 rounded-full bg-card border text-sm font-medium hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-default">
                {site}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-5">
            Text selection and right-click verification work on <strong>every website</strong>
          </p>
        </div>
      </section>

      {/* ── Privacy ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy by Design</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The extension never collects your browsing history. Verification requests are only sent when <strong>you explicitly trigger them</strong>. No background tracking, no data sharing — your activity stays yours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Notify CTA ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-12 text-center text-white max-w-3xl mx-auto">
            <Star className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Extension Launching Soon</h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto leading-relaxed">
              We're putting the final touches on the extension before publishing. In the meantime, the full TruthLens experience is available on the web — same AI, same results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow"
              >
                <Shield className="h-5 w-5" />
                Use Web App Now
              </button>
              <button
                onClick={() => navigate('/trending')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/15 text-white font-semibold border border-white/25 hover:bg-white/25 transition-all"
              >
                See Trending Claims
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
