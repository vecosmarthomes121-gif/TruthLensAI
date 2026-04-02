import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Download,
  Chrome,
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
} from 'lucide-react';

const steps = [
  {
    icon: Download,
    label: 'Download Project',
    desc: 'Click the Download button in OnSpace (top-right toolbar) to get the full project as a ZIP file.',
  },
  {
    icon: FolderOpen,
    label: 'Find the Folder',
    desc: 'Unzip the file and locate the browser-extension/ folder inside.',
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
    label: "You're Done!",
    desc: 'The TruthLens shield icon appears in your toolbar. Pin it for quick access.',
  },
];

const methods = [
  {
    icon: Type,
    title: 'Text Selection',
    desc: 'Highlight any text on the page (15–600 chars) and click the "Verify with TruthLens" bubble that appears.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    icon: MousePointer,
    title: 'Right-Click Menu',
    desc: 'Right-click selected text, any image, a link, or blank space and choose the appropriate TruthLens option.',
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
    // Explain to user how to get the extension
    const instructions = [
      'TruthLens AI Browser Extension – Installation',
      '',
      '1. Click the Download button in OnSpace (top-right toolbar)',
      '2. Unzip the downloaded file',
      '3. Find the browser-extension/ folder inside',
      '4. Open chrome://extensions in Chrome/Edge/Brave',
      '5. Enable Developer Mode (top-right toggle)',
      '6. Click "Load unpacked" and select the browser-extension/ folder',
      '7. Pin TruthLens AI from the extensions toolbar',
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-sm font-semibold mb-6 backdrop-blur-sm border border-white/20">
              <Chrome className="h-4 w-4" />
              Chrome · Edge · Brave · Firefox
            </div>

            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              TruthLens AI
              <br />
              <span className="text-white/80 text-3xl lg:text-4xl font-semibold">Browser Extension</span>
            </h1>
            <p className="text-lg text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
              Fact-check anything on the web without leaving the page. Right-click text, images, or links to verify instantly with AI-powered analysis and real source citations.
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
                Try in Browser Instead
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Chips */}
      <section className="bg-gray-950 py-5">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {['Free to Install', 'No Account Required', 'Privacy First', 'Works on All Sites', '60s Verification', 'Open Source'].map(chip => (
              <span key={chip} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                <CheckCircle className="h-3 w-3 text-green-400" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Install in 6 Steps</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              No Web Store required — load it directly from your downloaded project
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((step, i) => {
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

          {/* Firefox note */}
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
            <span className="text-amber-600 text-xl flex-shrink-0">🦊</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Firefox Users</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Go to <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">about:debugging#/runtime/this-firefox</code> → "Load Temporary Add-on" → select the <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">manifest.json</code> file inside the browser-extension folder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Methods */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">5 Ways to Verify</h2>
            <p className="text-lg text-muted-foreground">The extension works wherever you browse</p>
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

      {/* Supported Sites */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Works on 30+ Sites</h2>
            <p className="text-muted-foreground">Floating verify button appears automatically on these platforms</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {supported.map(site => (
              <span key={site} className="px-4 py-2 rounded-full bg-card border text-sm font-medium hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                {site}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Text selection and right-click verification work on <strong>all websites</strong>
          </p>
        </div>
      </section>

      {/* Result Preview */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Beautiful Results,<br />Right on the Page
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                When verification completes, a sleek modal overlay shows your results — no new tabs, no interruptions. See the truth score, AI explanation, and source citations without ever leaving the site.
              </p>
              <ul className="space-y-3">
                {[
                  'Animated donut-chart truth score (0–100%)',
                  'Color-coded verdict: TRUE / DISPUTED / FALSE',
                  'Plain-language AI explanation',
                  'Up to 4 credibility-rated source links',
                  'One-click to full report on TruthLens web app',
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
                {/* Mock header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Shield className="h-5 w-5" />
                    TruthLens AI
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm">✕</div>
                </div>

                {/* Mock claim */}
                <div className="px-5 py-4 border-b text-sm text-muted-foreground italic">
                  "Scientists discover revolutionary breakthrough in cancer treatment…"
                </div>

                {/* Mock score */}
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

                {/* Mock source */}
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

      {/* Privacy Note */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy by Design</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The extension never collects your browsing history. Verification API calls happen <strong>only when you explicitly trigger them</strong>. The only data stored locally is your verification count and the last 5 results — never shared externally.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Fight Misinformation?</h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto">
              Install the extension and fact-check anything on the web in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow"
              >
                <Download className="h-5 w-5" />
                Get Install Guide
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
