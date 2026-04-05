import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getVerificationById } from '@/lib/api';
import { VerificationResult } from '@/types';
import TruthScore from '@/components/features/TruthScore';
import SourceCard from '@/components/features/SourceCard';
import ShareCard from '@/components/features/ShareCard';
import VerificationComments from '@/components/features/VerificationComments';
import {
  Share2, ArrowLeft, FileText, ExternalLink, Link as LinkIcon,
  Image as ImageIcon, Video as VideoIcon, Download, Loader2,
  AlertTriangle, CheckCircle, XCircle, ShieldAlert, ShieldCheck,
  AlertOctagon, Zap, Mic, Film, Eye, Search,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';

// ── Verdict badge helpers ─────────────────────────────────────────────────────
function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    AUTHENTIC: {
      label: 'AUTHENTIC',
      cls: 'bg-green-100 text-green-800 border-green-300',
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    'AI-GENERATED': {
      label: 'AI GENERATED',
      cls: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: <Zap className="h-4 w-4" />,
    },
    DEEPFAKE: {
      label: 'DEEPFAKE DETECTED',
      cls: 'bg-red-100 text-red-800 border-red-300',
      icon: <AlertOctagon className="h-4 w-4" />,
    },
    MANIPULATED: {
      label: 'MANIPULATED',
      cls: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle className="h-4 w-4" />,
    },
    MISINFORMATION: {
      label: 'MISINFORMATION',
      cls: 'bg-red-100 text-red-800 border-red-300',
      icon: <AlertOctagon className="h-4 w-4" />,
    },
    UNCERTAIN: {
      label: 'UNCERTAIN',
      cls: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  };
  const item = map[verdict] || map['UNCERTAIN'];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold',
        item.cls
      )}
    >
      {item.icon}
      {item.label}
    </span>
  );
}

// ── Risk level badge ─────────────────────────────────────────────────────────
function RiskBadge({ risk, label }: { risk: string; label: string }) {
  const colorMap: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
    LOW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    NONE: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
          colorMap[risk] || colorMap['NONE']
        )}
      >
        {risk}
      </span>
    </div>
  );
}

// ── Confidence bar ────────────────────────────────────────────────────────────
function ConfidenceBar({ value, label, color = 'bg-blue-600' }: { value: number; label: string; color?: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ── Anomaly list ──────────────────────────────────────────────────────────────
function AnomalyList({ items, icon: Icon, label }: { items: string[]; icon: any; label: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icon className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      getVerificationById(id)
        .then(data => { setResult(data); setLoading(false); })
        .catch(() => { toast.error('Failed to load verification'); setLoading(false); });
    }
  }, [id]);

  const shareToWhatsApp = () => {
    const text = `TruthLens AI Verification:\n"${result?.claim}"\n\nTruth Score: ${result?.truthScore}%\n${result?.explanation}\n\nVerify at: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareToTwitter = () => {
    const text = `"${result?.claim}" - Truth Score: ${result?.truthScore}% | Verified by TruthLens AI`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };
  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); setShowShareMenu(false); };

  const handleShare = async () => {
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try { await navigator.share({ title: 'TruthLens AI', text: `"${result?.claim}" - ${result?.truthScore}%`, url: window.location.href }); } catch { }
    } else { setShowShareMenu(p => !p); }
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || !result) return;
    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `truthlens-${result.id}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Share card downloaded!');
    } catch { toast.error('Failed to generate share card'); } finally { setGeneratingImage(false); }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground mt-4">Loading verification...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Verification result not found</p>
        <button onClick={() => navigate('/verify')} className="mt-4 px-6 py-2 rounded-lg bg-primary text-white">Start New Verification</button>
      </div>
    );
  }

  const ia = result.contentAnalysis?.imageAnalysis;
  const va = result.contentAnalysis?.videoAnalysis;
  const isMediaVerification = result.inputType === 'image' || result.inputType === 'video';

  // Determine threat color for media verification header
  const getThreatLevel = () => {
    if (ia) {
      if (ia.deepfakeDetected || ia.overallVerdict === 'DEEPFAKE') return 'red';
      if (ia.isAiGenerated || ia.manipulationDetected || ia.overallVerdict === 'MANIPULATED') return 'orange';
      if (ia.overallVerdict === 'AUTHENTIC') return 'green';
      return 'yellow';
    }
    if (va) {
      if (va.deepfakeRisk === 'HIGH' || va.deepfakeDetected || va.overallVerdict === 'DEEPFAKE') return 'red';
      if (va.deepfakeRisk === 'MEDIUM' || va.isMisinformation) return 'orange';
      if (va.overallVerdict === 'AUTHENTIC') return 'green';
      return 'yellow';
    }
    return 'blue';
  };

  const threatColorMap: Record<string, string> = {
    red: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20',
    orange: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-900/20',
    green: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20',
    yellow: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/20',
    blue: 'from-blue-50 to-purple-50',
  };

  const threatLevel = getThreatLevel();

  return (
    <div className="container py-8 lg:py-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className={cn('bg-gradient-to-br rounded-2xl p-8 lg:p-12 mb-8', threatColorMap[threatLevel])}>
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <TruthScore score={result.truthScore} status={result.status} size="lg" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Verified {formatDate(result.verifiedAt)}</span>
                {/* Overall verdict badge for media */}
                {(ia?.overallVerdict || va?.overallVerdict) && (
                  <VerdictBadge verdict={ia?.overallVerdict || va?.overallVerdict || 'UNCERTAIN'} />
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-4">{result.claim}</h1>
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 z-50">
                      <button onClick={shareToWhatsApp} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        WhatsApp
                      </button>
                      <button onClick={shareToFacebook} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </button>
                      <button onClick={shareToTwitter} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4" fill="#1DA1F2" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        Twitter / X
                      </button>
                      <button onClick={copyLink} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-sm">
                        <LinkIcon className="h-4 w-4" /> Copy Link
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDownloadCard}
                  disabled={generatingImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download Card
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden share card */}
        <div className="fixed -left-[9999px] top-0">
          <div ref={shareCardRef}><ShareCard result={result} /></div>
        </div>

        {/* ── IMAGE DEEPFAKE ANALYSIS ────────────────────────────── */}
        {ia && (
          <div className="mb-8">
            {/* Alert banner if deepfake */}
            {(ia.deepfakeDetected || ia.isAiGenerated || ia.manipulationDetected) && (
              <div className={cn(
                'flex items-start gap-3 p-4 rounded-xl mb-5 border',
                ia.deepfakeDetected
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800'
                  : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800'
              )}>
                <ShieldAlert className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-base mb-0.5">
                    {ia.deepfakeDetected
                      ? 'Deepfake Detected — This image may be fabricated to spread misinformation'
                      : ia.isAiGenerated
                      ? 'AI-Generated Image — This image was likely created by an AI model, not a real photograph'
                      : 'Manipulation Detected — This image shows signs of editing or doctoring'}
                  </p>
                  <p className="text-sm opacity-90">{ia.manipulationDetails || 'Treat this content with caution before sharing.'}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Image Forensic Analysis
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Overall verdict + scores */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-bold mb-4 text-base">Detection Results</h3>
                <div className="flex items-center gap-3 mb-5">
                  <VerdictBadge verdict={ia.overallVerdict || 'UNCERTAIN'} />
                </div>
                <div className="space-y-4">
                  <ConfidenceBar
                    value={ia.authenticityScore || 0}
                    label="Authenticity Score"
                    color={ia.authenticityScore >= 70 ? 'bg-green-500' : ia.authenticityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}
                  />
                  {ia.deepfakeDetected && (
                    <ConfidenceBar
                      value={ia.deepfakeConfidence || 0}
                      label="Deepfake Confidence"
                      color="bg-red-500"
                    />
                  )}
                  {ia.isAiGenerated && (
                    <ConfidenceBar
                      value={ia.aiGenerationConfidence || 0}
                      label="AI Generation Confidence"
                      color="bg-orange-500"
                    />
                  )}
                </div>

                {ia.deepfakeType && ia.deepfakeType !== 'none' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Deepfake Type</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold capitalize">
                      {ia.deepfakeType.replace(/-/g, ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Detection breakdown */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-bold mb-4 text-base">Forensic Checks</h3>
                <div className="space-y-0 divide-y">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertOctagon className="h-4 w-4 text-muted-foreground" /> Deepfake
                    </div>
                    {ia.deepfakeDetected
                      ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">DETECTED</span>
                      : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">CLEAR</span>}
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-muted-foreground" /> AI Generated
                    </div>
                    {ia.isAiGenerated
                      ? <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">DETECTED</span>
                      : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">CLEAR</span>}
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-muted-foreground" /> Manipulation
                    </div>
                    {ia.manipulationDetected
                      ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">DETECTED</span>
                      : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">CLEAR</span>}
                  </div>
                </div>
              </div>

              {/* Forensic AI analysis */}
              <div className="bg-card border rounded-xl p-6 md:col-span-2">
                <h3 className="font-bold mb-3 text-base">Forensic Report</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {result.contentAnalysis?.summary}
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <AnomalyList items={ia.facialAnomalies || []} icon={AlertTriangle} label="Facial Anomalies" />
                  <AnomalyList items={ia.backgroundAnomalies || []} icon={AlertTriangle} label="Background Anomalies" />
                  <AnomalyList items={ia.compressionAnomalies || []} icon={AlertTriangle} label="Compression Artifacts" />
                </div>
                {ia.suspiciousElements && ia.suspiciousElements.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">All Suspicious Elements</p>
                    <div className="flex flex-wrap gap-2">
                      {ia.suspiciousElements.map((el: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200">
                          <AlertTriangle className="h-3 w-3" /> {el}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Context results (debunking sources) */}
              {ia.contextResults && ia.contextResults.length > 0 && (
                <div className="bg-card border rounded-xl p-6 md:col-span-2">
                  <h3 className="font-bold mb-3 text-base flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" /> Related Fact-Checks & Debunks
                  </h3>
                  <div className="space-y-3">
                    {ia.contextResults.map((r: any, i: number) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="block p-3 bg-muted/40 hover:bg-muted rounded-lg transition-colors">
                        <p className="text-sm font-semibold line-clamp-1">{r.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.snippet}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Reverse image search */}
              {ia.reverseSearchResults && ia.reverseSearchResults.length > 0 && (
                <div className="bg-card border rounded-xl p-6 md:col-span-2">
                  <h3 className="font-bold mb-3 text-base">Similar Images Found Online</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ia.reverseSearchResults.map((r: any, i: number) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="border rounded-lg p-3 hover:border-primary/50 transition-colors bg-muted/20">
                        <p className="text-xs font-medium line-clamp-2 mb-1">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.source}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VIDEO DEEPFAKE ANALYSIS ────────────────────────────── */}
        {va && (
          <div className="mb-8">
            {/* Alert banner */}
            {(va.deepfakeDetected || va.deepfakeRisk === 'HIGH' || va.isMisinformation) && (
              <div className="flex items-start gap-3 p-4 rounded-xl mb-5 border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800">
                <ShieldAlert className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-base mb-0.5">
                    {va.deepfakeDetected
                      ? 'Deepfake Video Detected — This video may be synthetically generated or manipulated'
                      : va.isMisinformation
                      ? 'Misinformation Risk — This video content may contain false or misleading claims'
                      : 'High Deepfake Risk — Treat this video with caution'}
                  </p>
                  <p className="text-sm opacity-90">
                    {va.misinformationDetails || 'Verify the source before sharing this video.'}
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Video Deepfake Analysis
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Verdict + risk levels */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-bold mb-4 text-base">Detection Results</h3>
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <VerdictBadge verdict={va.overallVerdict || 'UNCERTAIN'} />
                  {va.platform && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      <VideoIcon className="h-3.5 w-3.5" /> {va.platform}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {va.deepfakeRisk && <RiskBadge risk={va.deepfakeRisk} label="Deepfake Risk" />}
                  {va.voiceCloningRisk && <RiskBadge risk={va.voiceCloningRisk} label="Voice Cloning Risk" />}
                </div>
                {va.authenticityScore !== undefined && (
                  <div className="mt-4">
                    <ConfidenceBar
                      value={va.authenticityScore}
                      label="Authenticity Score"
                      color={va.authenticityScore >= 70 ? 'bg-green-500' : va.authenticityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}
                    />
                  </div>
                )}
                {va.deepfakeConfidence !== undefined && va.deepfakeConfidence > 0 && (
                  <div className="mt-3">
                    <ConfidenceBar value={va.deepfakeConfidence} label="Deepfake Confidence" color="bg-red-500" />
                  </div>
                )}
              </div>

              {/* Forensic details */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-bold mb-4 text-base">Forensic Findings</h3>
                {va.deepfakeType && va.deepfakeType !== 'none' && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Deepfake Type</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold capitalize">
                      {va.deepfakeType.replace(/-/g, ' ')}
                    </span>
                  </div>
                )}
                <AnomalyList items={va.facialAnomalies || []} icon={Eye} label="Facial Anomalies" />
                <AnomalyList items={va.audioAnomalies || []} icon={Mic} label="Audio / Voice Anomalies" />
                <AnomalyList items={va.temporalAnomalies || []} icon={Film} label="Temporal / Motion Anomalies" />
                {(!va.facialAnomalies?.length && !va.audioAnomalies?.length && !va.temporalAnomalies?.length) && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" /> No forensic anomalies detected
                  </div>
                )}
              </div>

              {/* Deepfake indicators */}
              {va.deepfakeIndicators && va.deepfakeIndicators.length > 0 && (
                <div className="bg-card border rounded-xl p-6 md:col-span-2">
                  <h3 className="font-bold mb-3 text-base">Deepfake Indicators</h3>
                  <div className="flex flex-wrap gap-2">
                    {va.deepfakeIndicators.map((ind: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs border border-red-200">
                        <AlertTriangle className="h-3 w-3" /> {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {result.contentAnalysis?.summary && (
                <div className="bg-card border rounded-xl p-6 md:col-span-2">
                  <h3 className="font-bold mb-3 text-base">Analysis Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.contentAnalysis.summary}
                  </p>
                  {va.extractedClaims && va.extractedClaims.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Extracted Claims</p>
                      <ul className="space-y-1.5">
                        {va.extractedClaims.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                            <span className="text-muted-foreground">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── URL Content Analysis ─────────────────────────────────── */}
        {result.contentAnalysis && !ia && !va && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Content Analysis</h2>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                {result.contentAnalysis.contentType === 'article' && <FileText className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                {result.contentAnalysis.contentType === 'image' && <ImageIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                {result.contentAnalysis.contentType === 'video' && <VideoIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-purple-700 mb-1 capitalize">
                    {result.contentAnalysis.contentType?.replace('-', ' ')} Content
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{result.contentAnalysis.summary}</p>
                  {result.contentAnalysis.mainClaim && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <span className="text-xs font-semibold text-purple-600">Extracted Claim: </span>
                      <span className="text-sm italic">"{result.contentAnalysis.mainClaim}"</span>
                    </div>
                  )}
                </div>
              </div>
              {result.contentAnalysis.extractedMedia && result.contentAnalysis.extractedMedia.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {result.contentAnalysis.extractedMedia.map((media: any, idx: number) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-white border border-purple-200">
                      {media.type === 'image' ? (
                        <img src={media.url} alt={media.caption || 'Extracted media'} className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <VideoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{media.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Verification Explanation ─────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Verification Analysis</h2>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-foreground/90 leading-relaxed">{result.explanation}</p>
          </div>
        </div>

        {/* ── Sources ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Source Evidence ({result.sources.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {result.sources.map(source => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>

        {/* ── Related Claims ───────────────────────────────────────── */}
        {result.relatedClaims.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Related Claims</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {result.relatedClaims.map((claim, index) => (
                <div key={`claim-${index}`} className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card">
                  <p className="text-sm mb-3 line-clamp-2">{claim.claim}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-lg font-bold', claim.truthScore >= 60 ? 'text-green-600' : claim.truthScore >= 40 ? 'text-yellow-600' : 'text-red-600')}>
                      {claim.truthScore}%
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Team Comments ────────────────────────────────────────── */}
        <VerificationComments verificationId={result.id} />

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <div className="mt-12 text-center bg-muted/50 rounded-xl p-8">
          <h3 className="text-lg font-semibold mb-2">Verify Another Claim</h3>
          <p className="text-sm text-muted-foreground mb-4">Submit text, URLs, images, or videos for AI deepfake detection and fact-checking</p>
          <button onClick={() => navigate('/verify')} className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow">
            Start New Verification
          </button>
        </div>
      </div>
    </div>
  );
}
