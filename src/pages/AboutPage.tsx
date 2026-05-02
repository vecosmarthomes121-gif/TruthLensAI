import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  CheckCircle,
  Globe,
  Lock,
  Zap,
  BarChart3,
  Users,
  Eye,
  ArrowRight,
  Database,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
} from 'lucide-react';

// ── Data ───────────────────────────────────────────────────────────────────────

const howItWorksSteps = [
  {
    icon: Search,
    title: 'Submit Any Content',
    desc: 'Paste a text claim, news headline, URL, image, or video link into TruthLens AI. We accept any format — no reformatting needed.',
    color: 'from-blue-500 to-blue-700',
    number: '01',
  },
  {
    icon: Globe,
    title: 'Real-Time Web Search',
    desc: 'Our system instantly queries live web sources via Serper — news outlets, academic papers, government sites, and fact-checking organisations — to find current evidence.',
    color: 'from-indigo-500 to-indigo-700',
    number: '02',
  },
  {
    icon: Eye,
    title: 'AI Forensic Analysis',
    desc: 'For images and videos, Gemini 3 performs multi-layer deepfake detection: facial anomaly scanning, AI-generation artifact checks, compression forensics, and voice-clone risk scoring.',
    color: 'from-purple-500 to-purple-700',
    number: '03',
  },
  {
    icon: BarChart3,
    title: 'Truth Score Generated',
    desc: 'The AI synthesises all evidence into a 0–100 truth score with a plain-English verdict (True · Mostly True · Disputed · Mostly False · False), source citations, and a forensic explanation.',
    color: 'from-green-500 to-green-700',
    number: '04',
  },
];

const inputTypes = [
  { icon: FileText, label: 'Text Claims', desc: 'Headlines, quotes, political statements', color: 'text-blue-600 bg-blue-50' },
  { icon: LinkIcon, label: 'URLs', desc: 'Full news articles and blog posts', color: 'text-indigo-600 bg-indigo-50' },
  { icon: ImageIcon, label: 'Images', desc: 'Deepfake & AI-generation detection', color: 'text-purple-600 bg-purple-50' },
  { icon: VideoIcon, label: 'Videos', desc: 'YouTube, TikTok & uploaded clips', color: 'text-pink-600 bg-pink-50' },
];

const trustSignals = [
  { value: '4', label: 'Verification Methods', sub: 'Text · URL · Image · Video', icon: CheckCircle, color: 'text-blue-600' },
  { value: '100%', label: 'Real Sources Only', sub: 'No mock data, ever', icon: Database, color: 'text-green-600' },
  { value: '0', label: 'Browsing Data Stored', sub: 'Privacy-first architecture', icon: Lock, color: 'text-purple-600' },
  { value: '2026', label: 'Knowledge Current To', sub: 'Live web search on every query', icon: Globe, color: 'text-orange-600' },
];

const privacyPoints = [
  'Verification history is strictly personal — only visible when you are logged in',
  'Anonymous verifications are never linked to any identity',
  'Trending topics only emerge when 2+ independent users verify the same claim',
  'No browsing patterns or page visits are tracked or stored',
  'Media files uploaded for verification are stored securely and isolated per user',
];

const team = [
  { name: 'Coming Soon', role: 'Founder & CEO', initials: 'TL' },
  { name: 'Coming Soon', role: 'Head of AI Research', initials: 'TL' },
  { name: 'Coming Soon', role: 'Lead Engineer', initials: 'TL' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-24 text-white relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-white opacity-[0.06]" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white opacity-[0.06]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-semibold mb-8">
              <Shield className="h-4 w-4 text-yellow-300" />
              Fighting Misinformation with AI
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Truth in the Age<br />
              <span className="text-white/80">of Misinformation</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto mb-10">
              TruthLens AI is a real-time fact-checking platform powered by frontier AI and live web search — built to help individuals, journalists, and newsrooms cut through noise and verify what's real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow"
              >
                <Zap className="h-5 w-5" />
                Start Verifying Free
              </button>
              <button
                onClick={() => navigate('/trending')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/15 text-white font-semibold border border-white/25 hover:bg-white/25 transition-all"
              >
                See Trending Claims
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-background border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
                <Shield className="h-4 w-4" /> Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                A World Where Truth<br />Has a Fighting Chance
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Every day, billions of people encounter headlines, images, and videos designed to mislead. Misinformation spreads faster than fact-checking can keep up with — until now.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-5">
                TruthLens AI combines frontier multimodal AI (Google Gemini 3) with real-time web search to give anyone — regardless of technical background — instant access to professional-grade fact-checking.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built this for journalists, students, researchers, and everyday readers who deserve to know what's true before they share it.
              </p>
            </div>

            {/* Mission pillars */}
            <div className="space-y-4">
              {[
                { icon: Zap, title: 'Speed', desc: 'Results in seconds, not hours — because misinformation spreads in real time.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
                { icon: Globe, title: 'Breadth', desc: 'Every input type covered: text, URLs, images, and videos from any platform.', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
                { icon: Lock, title: 'Privacy', desc: 'Your verifications are yours alone. No user data is ever shared or sold.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
                { icon: Users, title: 'Access', desc: 'Free to use for individuals. Built for the teams and newsrooms that need it most.', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl border bg-card">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-0.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Signals ─────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {trustSignals.map(({ value, label, sub, icon: Icon, color }) => (
              <div key={label} className="bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <Icon className={`h-8 w-8 mx-auto mb-3 ${color}`} />
                <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
                <div className="font-semibold text-sm mb-1">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <BarChart3 className="h-4 w-4" /> How It Works
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">From Claim to Verdict in Seconds</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Four stages of AI-powered analysis run in parallel — every single time you verify.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {howItWorksSteps.map(({ icon: Icon, title, desc, color, number }) => (
              <div key={title} className="relative bg-card border rounded-2xl p-7 hover:shadow-lg transition-all group hover:-translate-y-0.5 overflow-hidden">
                {/* Background number */}
                <span className="absolute top-4 right-5 text-7xl font-black text-muted/20 select-none leading-none">
                  {number}
                </span>
                <div className={`h-13 w-13 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`} style={{ width: 52, height: 52 }}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Input Types ───────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Verify Any Format</h2>
            <p className="text-muted-foreground">One platform handles everything you encounter online</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {inputTypes.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-1">{label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Technology ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            {/* Tech stack */}
            <div className="order-2 lg:order-1 space-y-4">
              {[
                {
                  title: 'Google Gemini 3 Flash',
                  badge: 'Primary AI',
                  desc: 'Frontier multimodal model capable of analyzing text, images, video frames, and audio. Powers deepfake detection, forensic image analysis, and fact-checking synthesis.',
                  badgeColor: 'bg-blue-100 text-blue-700',
                },
                {
                  title: 'Serper Real-Time Search',
                  badge: 'Live Web Search',
                  desc: 'Every verification triggers a live web search across news sources, fact-checkers, and official outlets. We never rely on AI training data alone for current events.',
                  badgeColor: 'bg-green-100 text-green-700',
                },
                {
                  title: 'Forensic Deepfake Engine',
                  badge: 'Media Analysis',
                  desc: 'Multi-layer detection covering face-swap artifacts, AI generation patterns (Stable Diffusion, DALL-E, Midjourney), voice cloning, temporal anomalies, and compression forensics.',
                  badgeColor: 'bg-purple-100 text-purple-700',
                },
              ].map(({ title, badge, desc, badgeColor }) => (
                <div key={title} className="p-5 bg-card border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                    <h3 className="font-bold">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
                <Zap className="h-4 w-4" /> Our Technology
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                Frontier AI,<br />Grounded in Real Sources
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                We deliberately chose to combine cutting-edge AI with live web search rather than relying on an AI model's training data — which can be months out of date.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every verification queries the live web in real time, then asks the AI to reason only from those fresh results. This means TruthLens is always current — even for breaking news stories happening today.
              </p>
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Transparency note:</strong> No AI system is 100% accurate. TruthLens AI provides evidence-based analysis — always apply your own judgment alongside our results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <Lock className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Privacy is Not Optional</h2>
              <p className="text-white/75 max-w-xl mx-auto text-lg leading-relaxed">
                We built TruthLens on the principle that protecting truth should never come at the cost of your privacy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {privacyPoints.map(point => (
                <div key={point} className="flex items-start gap-3 p-4 bg-white/8 border border-white/10 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/85 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => window.open('mailto:privacy@truthlens.ai', '_blank')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 text-white font-semibold border border-white/20 hover:bg-white/25 transition-all"
              >
                <Lock className="h-4 w-4" />
                privacy@truthlens.ai
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <Users className="h-4 w-4" /> The Team
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Built by People Who Care</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              TruthLens AI is early-stage and actively growing. Full team profiles coming soon.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {team.map(({ name, role, initials }) => (
              <div key={role} className="flex flex-col items-center gap-3 w-48">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {initials}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-muted-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Interested in joining us?{' '}
            <a href="mailto:team@truthlens.ai" className="text-blue-600 hover:underline font-semibold">
              team@truthlens.ai
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-12 text-center text-white">
            <Shield className="h-12 w-12 mx-auto mb-5 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Ready to Fight Misinformation?</h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto leading-relaxed">
              Free to use. No account required. Start verifying any claim, image, video, or URL right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/verify')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-shadow"
              >
                <Zap className="h-5 w-5" />
                Verify Now — It's Free
              </button>
              <button
                onClick={() => navigate('/teams')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/15 text-white font-semibold border border-white/25 hover:bg-white/25 transition-all"
              >
                <Users className="h-5 w-5" />
                Team Workspaces
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
