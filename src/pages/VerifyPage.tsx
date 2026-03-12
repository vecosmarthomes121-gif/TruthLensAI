import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VerificationInput from '@/components/features/VerificationInput';
import { InputType } from '@/types';
import { verifyClaimWithAI } from '@/lib/api';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [initialClaim, setInitialClaim] = useState('');

  useEffect(() => {
    // Check if navigated from trending page with a claim
    if (location.state?.claim) {
      setInitialClaim(location.state.claim);
    }
  }, [location]);

  const handleVerify = async (input: string, type: InputType, mediaUrl?: string) => {
    console.log('Starting AI verification:', { input, type, mediaUrl });
    setIsLoading(true);

    try {
      const result = await verifyClaimWithAI(input, type, mediaUrl);
      console.log('AI verification complete:', result);
      toast.success('Verification complete!');
      navigate(`/result/${result.id}`);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Verification Engine
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Verify Any Claim Instantly
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Submit text, URLs, images, or videos for real-time fact-checking across 50,000+ global news sources
          </p>
        </div>

        {/* Verification Input */}
        <VerificationInput onVerify={handleVerify} isLoading={isLoading} />

        {/* Example Claims */}
        {!isLoading && (
          <div className="mt-12">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">
              Try these example claims:
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'New AI regulation passed in European Union',
                'China bans electric cars in Europe',
                'Official announcement of climate summit postponed',
                'Major tech company faces security breach'
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleVerify(example, 'text')}
                  className="text-left p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">2-5 sec</div>
            <p className="text-sm text-muted-foreground">Average verification time</p>
          </div>
          <div className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">50,000+</div>
            <p className="text-sm text-muted-foreground">Trusted news sources</p>
          </div>
          <div className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">Multi-format</div>
            <p className="text-sm text-muted-foreground">Text, URL, image, video</p>
          </div>
        </div>
      </div>
    </div>
  );
}
