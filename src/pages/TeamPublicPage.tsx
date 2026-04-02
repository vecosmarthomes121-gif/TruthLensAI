import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Users,
  CheckCircle,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Award,
  XCircle,
  AlertTriangle,
  Globe,
  Copy,
} from 'lucide-react';
import { getPublicTeamProfile, getPublicTeamShowcase, PublicTeamProfile } from '@/lib/team-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShowcaseVerification {
  id: string;
  claim: string;
  truth_score: number;
  status: string;
  explanation: string;
  created_at: string;
  sources: any[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'true':         { label: 'TRUE',         color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  'mostly-true':  { label: 'MOSTLY TRUE',  color: 'text-blue-700',   bg: 'bg-blue-100',   icon: CheckCircle },
  'disputed':     { label: 'DISPUTED',     color: 'text-amber-700',  bg: 'bg-amber-100',  icon: AlertTriangle },
  'mostly-false': { label: 'MOSTLY FALSE', color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle },
  'false':        { label: 'FALSE',        color: 'text-red-800',    bg: 'bg-red-100',    icon: XCircle },
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.4;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#2563eb' : score >= 35 ? '#d97706' : '#dc2626';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.1} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={size * 0.1}
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fill={color}
        fontSize={size * 0.2} fontWeight="800" fontFamily="-apple-system,sans-serif">{score}</text>
      <text x={size / 2} y={size / 2 + size * 0.14} textAnchor="middle" fill={color}
        fontSize={size * 0.11} fontWeight="600" fontFamily="-apple-system,sans-serif">%</text>
    </svg>
  );
}

export default function TeamPublicPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicTeamProfile | null>(null);
  const [showcase, setShowcase] = useState<ShowcaseVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (teamId) loadPublicData();
  }, [teamId]);

  const loadPublicData = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const [profileData, showcaseData] = await Promise.all([
        getPublicTeamProfile(teamId),
        getPublicTeamShowcase(teamId),
      ]);
      setProfile(profileData);
      setShowcase(showcaseData);
    } catch (err: any) {
      console.error('Failed to load public profile:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading team profile…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Globe className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Team Not Found</h2>
        <p className="text-muted-foreground max-w-sm">
          This team profile is either private or doesn't exist. Ask the team owner to make their profile public.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        >
          Go to TruthLens
        </button>
      </div>
    );
  }

  const completionRate = profile.stats.total_assignments > 0
    ? Math.round((profile.stats.completed / profile.stats.total_assignments) * 100)
    : 0;

  const avgScore = profile.stats.avg_truth_score || 0;

  return (
    <div className="flex flex-col">
      {/* ── Hero Band ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white py-16 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full border border-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full border border-white/8 -translate-y-1/4 translate-x-1/4" />

        <div className="container relative">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            {/* Team Avatar */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl border-2 border-white/20">
                <Shield className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
              </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">
                  <Globe className="h-3 w-3" /> Public Team
                </span>
                <span className="text-white/40 text-xs">
                  Since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 leading-tight">{profile.name}</h1>
              {profile.description && (
                <p className="text-white/70 text-base max-w-2xl leading-relaxed">{profile.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={copyProfileLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all"
              >
                <Copy className="h-4 w-4" />
                Share Profile
              </button>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold hover:shadow-xl transition-all"
              >
                Verify a Claim
              </Link>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold">{profile.stats.member_count}</div>
              <div className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5">
                <Users className="h-3.5 w-3.5" /> Team Members
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{profile.stats.total_assignments}</div>
              <div className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5">
                <BarChart3 className="h-3.5 w-3.5" /> Verifications
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="h-3.5 w-3.5" /> Completion Rate
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{avgScore > 0 ? `${avgScore}%` : '—'}</div>
              <div className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5" /> Avg. Truth Score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Zone ──────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="container">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

            {/* ── Left: Sidebar Stats ── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Verdict Breakdown */}
              <div className="bg-card border rounded-2xl p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Verdict Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'True / Mostly True', value: profile.stats.true_count, color: 'bg-green-500' },
                    { label: 'Disputed',            value: profile.stats.disputed_count, color: 'bg-amber-500' },
                    { label: 'False / Mostly False', value: profile.stats.false_count, color: 'bg-red-500' },
                  ].map(({ label, value, color }) => {
                    const pct = profile.stats.total_assignments > 0
                      ? Math.round((value / profile.stats.total_assignments) * 100)
                      : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">{value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assignment Status */}
              <div className="bg-card border rounded-2xl p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Task Status
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Completed', value: profile.stats.completed, total: profile.stats.total_assignments, color: 'bg-green-500' },
                    { label: 'In Progress', value: profile.stats.in_progress, total: profile.stats.total_assignments, color: 'bg-blue-500' },
                    { label: 'Pending',    value: profile.stats.pending,     total: profile.stats.total_assignments, color: 'bg-amber-400' },
                  ].map(({ label, value, total, color }) => {
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Credibility Badge */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <div className="text-2xl font-bold mb-0.5">{completionRate}%</div>
                <div className="text-sm text-white/80">Verification Completion</div>
                <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/60">
                  Verified by TruthLens AI Platform
                </div>
              </div>

              {/* CTA */}
              <div className="bg-card border rounded-2xl p-5 text-center">
                <p className="text-sm text-muted-foreground mb-3">Want your team's fact-checking to be public?</p>
                <Link
                  to="/teams"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold hover:shadow-lg transition-all"
                >
                  <Users className="h-4 w-4" /> Create Your Team
                </Link>
              </div>
            </div>

            {/* ── Right: Verified Claim Showcase ── */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">Notable Verifications</h2>
                <span className="text-sm text-muted-foreground">{showcase.length} recent results</span>
              </div>

              {showcase.length === 0 ? (
                <div className="rounded-2xl border bg-muted/30 py-16 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-muted-foreground">No completed verifications yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Results will appear here once the team completes assignments.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {showcase.map((v) => {
                    const cfg = statusConfig[v.status] || statusConfig['disputed'];
                    const Icon = cfg.icon;
                    return (
                      <article
                        key={v.id}
                        className="bg-card border rounded-2xl p-5 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex gap-4 items-start">
                          {/* Score Ring */}
                          <ScoreRing score={v.truth_score} size={72} />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Status badge */}
                            <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2', cfg.bg, cfg.color)}>
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </div>

                            {/* Claim */}
                            <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2">
                              "{v.claim}"
                            </h3>

                            {/* Explanation */}
                            {v.explanation && (
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                {v.explanation}
                              </p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {Array.isArray(v.sources) && v.sources.length > 0 && (
                                  <span>{v.sources.length} source{v.sources.length !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                              <Link
                                to={`/result/${v.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                Full Report <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Bottom CTA */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/40 p-6 text-center">
                <h3 className="font-bold mb-2">Fact-Check Something Now</h3>
                <p className="text-sm text-muted-foreground mb-4">Use TruthLens AI to verify any claim, article, image, or video instantly.</p>
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition-all"
                >
                  <Shield className="h-4 w-4" /> Start Verifying
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
