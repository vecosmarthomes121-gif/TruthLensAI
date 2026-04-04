import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Download,
  CheckCircle,
  MousePointer,
  Type,
  Image,
  Link as LinkIcon,
  Zap,
  ArrowRight,
  Monitor,
  Puzzle,
  ToggleRight,
  FolderOpen,
  Globe,
  Upload,
  CreditCard,
  Star,
  Users,
  Lock,
} from 'lucide-react';

/* ── Chrome Web Store Publishing Steps ───────────────────────── */
const publishSteps = [
  {
    icon: Download,
    label: 'Download Project',
    desc: 'Click the Download button (top-right in OnSpace) to get your project as a ZIP file. Unzip it.',
  },
  {
    icon: FolderOpen,
    label: 'Zip the Extension Folder',
    desc: 'Inside the unzipped project, find the browser-extension/ folder. Zip just that folder into browser-extension.zip.',
  },
  {
    icon: CreditCard,
    label: 'Register as Developer',
    desc: 'Go to chrome.google.com/webstore/devconsole → pay the one-time $5 registration fee with a Google account.',
  },
  {
    icon: Upload,
    label: 'Upload the ZIP',
    desc: 'In the Developer Console, click "New Item" → upload browser-extension.zip. Fill in name, description, and screenshots.',
  },
  {
    icon: Globe,
    label: 'Submit for Review',
    desc: 'Click "Submit for Review". Google reviews extensions in 1–3 business days. You will receive an email when approved.',
  },
  {
    icon: CheckCircle,
    label: 'Users Install in 1 Click',
    desc: 'Once published, share your Chrome Web Store link. Anyone clicks "Add to Chrome" → grant permissions → done. No developer mode needed.',
  },
];

/* ── Developer / Tester Install Steps ───────────────────────── */
const devSteps = [
  {
    icon: Download,
    label: 'Download Project',
    desc: 'Click the Download button in OnSpace (top-right) to get the full project as a ZIP. Unzip it.',
  },
  {
    icon: FolderOpen,
    label: 'Find the Folder',
    desc: 'Locate the browser-extension/ folder inside the unzipped project.',
  },
  {
    icon: Monitor,
    label: 'Open Extensions',
    desc: 'In Chrome/Edge/Brave, navigate to chrome://extensions (or edge://extensions).',
  },
  {
    icon: ToggleRight,
    label: 'Enable Dev Mode',
    desc: 'Toggle on Developer Mode in the top-right corner of the extensions page.',
  },
  {
    icon: Puzzle,
    label: 'Load Unpacked',
    desc: 'Click "Load unpacked" and select the browser-extension/ folder.',
  },
  {
    icon: CheckCircle,
    label: "You're Ready!",
    desc: 'The TruthLens shield icon appears in your toolbar. Pin it for quick access.',
  },
];

/* ── Verification Methods ─────────────────────────────────────── */
const methods = [
  {
    icon: Type,
    title: 'Text Selection',
    desc: 'Highlight any text (15–600 chars) and click the "Verify with TruthLens" bubble that appears.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    icon: MousePointer,
    title: 'Right-Click Menu',
    desc: 'Right-click selected text, any image, a link, or blank space and choose the TruthLens option.',
    color: 'from-purple-600 to-violet-600',
  },
  {
    icon: Zap,
    title: 'Popup Input',
    desc: 'Click the shield icon in your toolbar, type or paste a claim/URL, and press Go for instant results.',
    color: 'from-green-600 to-emerald-600',
  },
  {
    icon: Image,
    title: 'Image Verification',
    desc: 'Right-click any image → "Check Image Authenticity" to detect AI generation, manipulation, or deepfakes.',
    color: 'from-orange-600 to-amber-600',
  },
  {
    icon: LinkIcon,
    title: 'Article Fact-Check',
    desc: 'Click the floating "Verify Page" button that appears on 30+ news sites and social platforms.',
    color: 'from-pink-600 to-rose-600',
  },
  {
    icon: Shield,
    title: 'Inline Results',
    desc: 'Verification results appear in an overlay modal — truth score, sources, and AI analysis without leaving the page.',
    color: 'from-teal-600 to-cyan-600',
  },
];

const supported = [
  'CNN', 'BBC', 'Reuters', 'AP News', 'New York Times', 'Washington Post',
  'The Guardian', 'Fox News', 'Bloomberg', 'Al Jazeera', 'Twitter/X',
  'Facebook', 'Reddit', 'YouTube', 'LinkedIn', 'TikTok', 'Threads', '+ more',
];

export default function ExtensionPage() {
  const navigate = useNavigate();

  const handleDownloadGuide = () => {
    const instructions = [
      'TruthLens AI Browser Extension – Install Guide',
      '================================================',
      '',
      '── OPTION A: Publish to Chrome Web Store (Recommended for public users) ──',
      '',
      '1. Download your OnSpace project (Download button, top-right toolbar)',
      '2. Unzip the project → find the browser-extension/ folder',
      '3. Zip just that folder → browser-extension.zip',
      '4. Go to: https://chrome.google.com/webstore/devconsole',
      '5. Register as developer (one-time $5 Google fee)',
      '6. Click "New Item" → upload browser-extension.zip',
      '7. Fill in name, description, screenshots, and submit for review',
      '8. After approval (1-3 days) share your Web Store link',
      '9. Users just click "Add to Chrome" → grant permissions → works instantly!',
      '',
      '── OPTION B: Developer / Tester Install (No fee, for testing only) ──',
      '',
      '1. Download your OnSpace project (Download button, top-right toolbar)',
      '2. Unzip the file → find the browser-extension/ folder',
      '3. Open Chrome → go to chrome://extensions',
      '4. Toggle ON Developer Mode (top-right corner)',
      '5. Click "Load unpacked" → select the browser-extension/ folder',
      '6. Pin TruthLens AI from the toolbar puzzle-piece icon',
      '',
      '── Firefox ──',
      'Go to about:debugging#/runtime/this-firefox',
      '→ "Load Temporary Add-on" → select manifest.json inside browser-extension/',
      '',
      'Need help? Visit: https://doztmrzytayxhgjbdozt.onspace.app/extension',
    ].join('\n');

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TruthLens-Extension-Install-Guide.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-sm font-semibold mb-6 backdrop-blur-sm border border-white/20">
              Chrome · Edge · Brave · Firefox
            </div>

            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              TruthLens AI
              <br />
              <span className="text-white/80 text-3xl lg:text-4xl font-semibold">Browser Extension</span>
            </h1>
            <p className="text-lg text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
              Fact-check anything on the web without leaving the page. Right-click text, images, or links to verify instantly. Works automatically on every website — users only need to grant permission once.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-base hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                <Download className="h-5 w-5" />
                Download Install Guide
              </button>
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/15 text-white font-semibold text-base border border-white/25 hover:bg-white/25 transition-all backdrop-blur-sm"
              >
                Try Web App Instead
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Chips ─────────────────────────────────────────── */}
      <section className="bg-gray-950 py-5">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {['One-Click Install (Web Store)', 'Auto-works on every site', 'Permission-based only', 'No developer mode needed', 'Privacy first', 'Free to use'].map(chip => (
              <span key={chip} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                <CheckCircle className="h-3 w-3 text-green-400" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS FOR USERS ────────────────────────────────── */}
      <section className="py-16 bg-green-50 dark:bg-green-950/20 border-b border-green-100 dark:border-green-900/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-bold mb-4">
              <Users className="h-4 w-4" /> How Your Users Install It
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Once Published — Users Just Click "Add to Chrome"
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              After you publish to the Chrome Web Store, your users <strong>don't need developer mode</strong>. They visit your store link, click one button, and the extension is ready — just like any other extension.
            </p>

            {/* User flow visual */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { step: '1', icon: Globe, label: 'Visit Store Link', color: 'from-blue-500 to-blue-600' },
                { step: '2', icon: CheckCircle, label: 'Click "Add to Chrome"', color: 'from-indigo-500 to-purple-600' },
                { step: '3', icon: Shield, label: 'Grant Permission & Done!', color: 'from-green-500 to-emerald-600' },
              ].map(({ step, icon: Icon, label, color }) => (
                <div key={step} className="flex flex-col items-center gap-3">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg text-white`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-semibold text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-card border border-green-200 dark:border-green-800 rounded-xl flex gap-3 text-left max-w-xl mx-auto">
              <span className="text-green-600 text-xl flex-shrink-0">✅</span>
              <p className="text-sm text-muted-foreground">
                The extension automatically activates on every website. Users only see the permission dialog once — it asks to <em>"read and change data on websites you visit"</em> so the extension can show verification results inline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPTION A: Chrome Web Store Publish (Recommended) ──────── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-black">A</span>
              <h2 className="text-2xl lg:text-3xl font-bold">Publish to Chrome Web Store</h2>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">RECOMMENDED</span>
            </div>
            <p className="text-muted-foreground mb-10 ml-11">
              One-time $5 developer fee. Anyone can install with a single click — no technical knowledge needed. Works permanently on all devices.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publishSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
                      {i + 1}
                    </div>
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold mb-2">{step.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Cost breakdown */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/40 rounded-xl text-center">
                <div className="text-2xl font-black text-primary mb-1">$5</div>
                <div className="text-sm text-muted-foreground">One-time developer registration</div>
              </div>
              <div className="p-4 bg-muted/40 rounded-xl text-center">
                <div className="text-2xl font-black text-primary mb-1">1–3 days</div>
                <div className="text-sm text-muted-foreground">Google review time</div>
              </div>
              <div className="p-4 bg-muted/40 rounded-xl text-center">
                <div className="text-2xl font-black text-primary mb-1">∞ users</div>
                <div className="text-sm text-muted-foreground">Unlimited installs, no extra cost</div>
              </div>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              <a
                href="https://chrome.google.com/webstore/devconsole"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg transition-shadow"
              >
                <Globe className="h-4 w-4" />
                Open Chrome Developer Console
              </a>
              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Full Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPTION B: Developer Install (divider) ─────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-black">B</span>
              <h2 className="text-2xl font-bold">Developer / Tester Install</h2>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">FOR TESTING ONLY</span>
            </div>
            <p className="text-muted-foreground mb-10 ml-11">
              Free but requires Developer Mode in Chrome. Best for testing before publishing. <strong>Not recommended for regular users</strong> — it resets after some Chrome updates and requires re-loading.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {devSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative bg-card border rounded-xl p-6 opacity-90 hover:shadow-md transition-shadow">
                    <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold shadow">
                      {i + 1}
                    </div>
                    <div className="h-11 w-11 rounded-lg bg-muted border flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold mb-2">{step.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Firefox note */}
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
              <span className="text-amber-600 text-xl flex-shrink-0">🦊</span>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Firefox Users</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Go to <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">about:debugging#/runtime/this-firefox</code> → "Load Temporary Add-on" → select the <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">manifest.json</code> inside the browser-extension folder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Verification Methods ───────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">6 Ways to Verify</h2>
            <p className="text-lg text-muted-foreground">The extension works automatically on every website — no setup required after install</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {methods.map((method, i) => {
              const Icon = method.icon;
              return (
                <div key={i} className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow group">
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

      {/* ── Supported Sites ────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Works on 30+ Sites Automatically</h2>
            <p className="text-muted-foreground">Floating verify button appears automatically on these platforms after install</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {supported.map(site => (
              <span key={site} className="px-4 py-2 rounded-full bg-card border text-sm font-medium hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                {site}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Text selection and right-click verification work on <strong>every website</strong>
          </p>
        </div>
      </section>

      {/* ── Result Preview ─────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Beautiful Results,<br />Right on the Page
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                When verification completes, a sleek modal overlay shows results — no new tabs, no navigation. Users see the truth score, AI explanation, and source citations without leaving the site they're on.
              </p>
              <ul className="space-y-3">
                {[
                  'Animated donut-chart truth score (0–100%)',
                  'Color-coded verdict: TRUE / DISPUTED / FALSE',
                  'Plain-language AI explanation',
                  'Up to 4 credibility-rated source links',
                  'One-click to full report on TruthLens',
                  'Share results directly to clipboard',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock overlay preview */}
            <div className="relative">
              <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Shield className="h-5 w-5" />
                    TruthLens AI
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm">✕</div>
                </div>
                <div className="px-5 py-4 border-b text-sm text-muted-foreground italic">
                  "Scientists discover revolutionary breakthrough in cancer treatment…"
                </div>
                <div className="px-5 py-5 bg-amber-50 dark:bg-amber-950/20 border-b flex items-center gap-5">
                  <div className="flex-shrink-0">
                    <svg width="88" height="88" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#d97706" strokeWidth="10"
                        strokeDasharray="251" strokeDashoffset="100"
                        strokeLinecap="round" transform="rotate(-90 50 50)"/>
                      <text x="50" y="46" textAnchor="middle" fill="#d97706" fontSize="18" fontWeight="800" fontFamily="sans-serif">60</text>
                      <text x="50" y="62" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="600" fontFamily="sans-serif">%</text>
                    </svg>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">⚠️ DISPUTED</span>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">The study shows promising early results but has not yet completed peer review…</p>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Sources (3)</p>
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border-l-2 border-blue-500">
                    <span className="text-xs font-semibold">Reuters</span>
                    <span className="text-xs font-bold text-green-600">92%</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl opacity-20 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy Note ───────────────────────────────────────────── */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy by Design</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The extension never collects browsing history. Verification API calls happen <strong>only when explicitly triggered</strong> by the user. The only data stored locally is the last 5 verification results — never shared externally.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-12 text-center text-white">
            <Star className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Publish & Let Anyone Install in 1 Click</h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto">
              Submit to the Chrome Web Store for $5 once. Your users install it like any extension — no developer mode, no ZIP files, no technical steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://chrome.google.com/webstore/devconsole"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow"
              >
                <Globe className="h-5 w-5" />
                Open Chrome Web Store Console
              </a>
              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/15 text-white font-semibold border border-white/25 hover:bg-white/25 transition-all"
              >
                <Download className="h-4 w-4" />
                Download Guide
              </button>
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/15 text-white font-semibold border border-white/25 hover:bg-white/25 transition-all"
              >
                Use Web App Instead
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
