import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getVerificationById } from '@/lib/api';
import { VerificationResult } from '@/types';
import TruthScore from '@/components/features/TruthScore';
import SourceCard from '@/components/features/SourceCard';
import ShareCard from '@/components/features/ShareCard';
import { Share2, ArrowLeft, FileText, ExternalLink, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon, FileText as ArticleIcon, Download, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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

  const handleShare = async () => {
    const shareData = {
      title: 'TruthLens AI Verification Result',
      text: `"${result?.claim}" - Truth Score: ${result?.truthScore}%`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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

              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </button>
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
