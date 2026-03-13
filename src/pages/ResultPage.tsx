import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getVerificationById } from '@/lib/api';
import { VerificationResult } from '@/types';
import TruthScore from '@/components/features/TruthScore';
import SourceCard from '@/components/features/SourceCard';
import ShareCard from '@/components/features/ShareCard';
import VerificationComments from '@/components/features/VerificationComments';
import { Share2, ArrowLeft, FileText, ExternalLink, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon, FileText as ArticleIcon, Download, Loader2, AlertTriangle, CheckCircle, XCircle, Video, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      getVerificationById(id)
        .then(data => {
          console.log('Loading verification result:', data);
          setResult(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load verification:', error);
          toast.error('Failed to load verification');
          setLoading(false);
        });
    }
  }, [id]);

  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareToWhatsApp = () => {
    const text = `TruthLens AI Verification:\n"${result?.claim}"\n\nTruth Score: ${result?.truthScore}%\n${result?.explanation}\n\nVerify at: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = `"${result?.claim}" - Truth Score: ${result?.truthScore}% | Verified by TruthLens AI`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShowShareMenu(false);
  };

  const handleShare = async () => {
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'TruthLens AI Verification Result',
          text: `"${result?.claim}" - Truth Score: ${result?.truthScore}%`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || !result) return;

    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `truthlens-verification-${result.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Share card downloaded!');
    } catch (error) {
      console.error('Failed to generate share card:', error);
      toast.error('Failed to generate share card');
    } finally {
      setGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading verification...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Verification result not found</p>
        <button 
          onClick={() => navigate('/verify')}
          className="mt-4 px-6 py-2 rounded-lg bg-primary text-white"
        >
          Start New Verification
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <TruthScore score={result.truthScore} status={result.status} size="lg" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Verified {formatDate(result.verifiedAt)}
                </span>
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-bold mb-4">
                {result.claim}
              </h1>

              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 z-50">
                      <button
                        onClick={shareToWhatsApp}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={shareToFacebook}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </button>
                      <button
                        onClick={shareToTwitter}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="#1DA1F2" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        Twitter
                      </button>
                      <button
                        onClick={copyLink}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDownloadCard}
                  disabled={generatingImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {generatingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Card
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Share Card for Image Generation */}
        <div className="fixed -left-[9999px] top-0">
          <div ref={shareCardRef}>
            <ShareCard result={result} />
          </div>
        </div>

        {/* Image Analysis Results */}
        {result.contentAnalysis?.imageAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Image Forensic Analysis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Generation Detection */}
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  {result.contentAnalysis.imageAnalysis.isAiGenerated ? (
                    <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">AI Generation Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.contentAnalysis.imageAnalysis.isAiGenerated
                        ? `Likely AI-generated (${result.contentAnalysis.imageAnalysis.confidence}% confidence)`
                        : `Appears authentic (${100 - result.contentAnalysis.imageAnalysis.confidence}% confidence)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manipulation Detection */}
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  {result.contentAnalysis.imageAnalysis.manipulationDetected ? (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">Manipulation Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.contentAnalysis.imageAnalysis.manipulationDetected
                        ? result.contentAnalysis.imageAnalysis.manipulationDetails
                        : 'No manipulation detected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authenticity Score */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-3">Authenticity Score</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">
                    {result.contentAnalysis.imageAnalysis.authenticityScore}%
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${result.contentAnalysis.imageAnalysis.authenticityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suspicious Elements */}
              {result.contentAnalysis.imageAnalysis.suspiciousElements.length > 0 && (
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-3">Suspicious Elements</h3>
                  <ul className="space-y-2">
                    {result.contentAnalysis.imageAnalysis.suspiciousElements.map((element, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Reverse Image Search Results */}
            {result.contentAnalysis.imageAnalysis.reverseSearchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Similar Images Found</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {result.contentAnalysis.imageAnalysis.reverseSearchResults.map((searchResult, idx) => (
                    <a
                      key={idx}
                      href={searchResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded-lg p-3 hover:border-primary/50 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-2 mb-1">{searchResult.title}</p>
                      <p className="text-xs text-muted-foreground">{searchResult.source}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Analysis Results */}
        {result.contentAnalysis?.videoAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Video Analysis</h2>
            <div className="bg-card border rounded-xl p-6">
              {result.contentAnalysis.videoAnalysis.platform && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <Video className="h-4 w-4" />
                    {result.contentAnalysis.videoAnalysis.platform}
                  </span>
                </div>
              )}
              {result.contentAnalysis.videoAnalysis.extractedClaims && (
                <div>
                  <h3 className="font-semibold mb-2">Extracted Claims:</h3>
                  <ul className="space-y-2">
                    {result.contentAnalysis.videoAnalysis.extractedClaims.map((claim: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-2"></div>
                        <span className="text-muted-foreground">{claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.contentAnalysis.videoAnalysis.note && (
                <p className="text-sm text-muted-foreground mt-3">
                  {result.contentAnalysis.videoAnalysis.note}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content Analysis (for URLs) */}
        {result.contentAnalysis && !result.contentAnalysis.imageAnalysis && !result.contentAnalysis.videoAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Content Analysis</h2>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                {result.contentAnalysis.contentType === 'article' && <ArticleIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                {result.contentAnalysis.contentType === 'image' && <ImageIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                {result.contentAnalysis.contentType === 'video' && <VideoIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                {result.contentAnalysis.contentType === 'social-post' && <LinkIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                {result.contentAnalysis.contentType === 'mixed' && <FileText className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-purple-700 mb-1 capitalize">
                    {result.contentAnalysis.contentType.replace('-', ' ')} Content
                  </div>
                  <p className="text-foreground/90 leading-relaxed">
                    {result.contentAnalysis.summary}
                  </p>
                  {result.contentAnalysis.mainClaim && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <span className="text-xs font-semibold text-purple-600">Extracted Claim: </span>
                      <span className="text-sm italic">"{result.contentAnalysis.mainClaim}"</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Extracted Media */}
              {result.contentAnalysis.extractedMedia && result.contentAnalysis.extractedMedia.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {result.contentAnalysis.extractedMedia.map((media, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-white border border-purple-200">
                      {media.type === 'image' ? (
                        <img 
                          src={media.url} 
                          alt={media.caption || 'Extracted media'}
                          className="w-full h-32 object-cover"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <VideoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                          {media.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Verification Analysis</h2>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-foreground/90 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* Sources */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Source Evidence ({result.sources.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {result.sources.map(source => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>

        {/* Related Claims */}
        {result.relatedClaims.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Related Claims</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {result.relatedClaims.map((claim, index) => (
                <div 
                  key={`claim-${index}`}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card"
                >
                  <p className="text-sm mb-3 line-clamp-2">{claim.claim}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      claim.truthScore >= 60 ? 'text-success' :
                      claim.truthScore >= 40 ? 'text-warning' :
                      'text-danger'
                    }`}>
                      {claim.truthScore}%
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Comments Section */}
        <VerificationComments verificationId={result.id} />

        {/* CTA */}
        <div className="mt-12 text-center bg-muted/50 rounded-xl p-8">
          <h3 className="text-lg font-semibold mb-2">Verify Another Claim</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Submit text, URLs, images, or videos for instant AI verification
          </p>
          <button
            onClick={() => navigate('/verify')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            Start New Verification
          </button>
        </div>
      </div>
    </div>
  );
}
