import { VerificationResult } from '@/types';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareCardProps {
  result: VerificationResult;
}

export default function ShareCard({ result }: ShareCardProps) {
  const statusConfig = {
    'true': { color: 'bg-green-500', gradient: 'from-green-400 to-green-600', text: 'TRUE' },
    'mostly-true': { color: 'bg-green-400', gradient: 'from-green-300 to-green-500', text: 'MOSTLY TRUE' },
    'disputed': { color: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500', text: 'DISPUTED' },
    'mostly-false': { color: 'bg-orange-500', gradient: 'from-orange-400 to-red-500', text: 'MOSTLY FALSE' },
    'false': { color: 'bg-red-500', gradient: 'from-red-400 to-red-600', text: 'FALSE' },
  };

  const config = statusConfig[result.status];

  return (
    <div className="w-[1080px] h-[1080px] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-16 flex flex-col justify-between relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-2xl">
              <Shield className="h-14 w-14 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight">
                TruthLens AI
              </h1>
              <p className="text-white/80 text-2xl font-medium mt-1">Fact Verification Engine</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center mb-12">
          {/* Claim */}
          <div className="mb-12">
            <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <span className="text-white/90 text-xl font-medium">CLAIM VERIFICATION</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mb-8 line-clamp-4">
              "{result.claim}"
            </h2>
          </div>

          {/* Truth Score - Centered & Large */}
          <div className="flex items-center justify-center gap-12">
            <div className="relative">
              <div className={cn(
                "w-72 h-72 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br",
                config.gradient
              )}>
                <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <div className="text-center">
                    <div className="text-9xl font-black text-white">{result.truthScore}</div>
                    <div className="text-4xl text-white/90 font-bold">%</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="px-8 py-4 bg-white rounded-2xl shadow-2xl">
                  <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{config.text}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">{result.sources.length}</div>
                  <div className="text-xl text-white/80">Sources Verified</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">AI</div>
                  <div className="text-xl text-white/80">Powered Analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t-2 border-white/20 pt-8">
        <div className="text-center">
          <p className="text-white/90 text-3xl font-medium">
            Verify any claim at <span className="font-black text-white">TruthLens.AI</span>
          </p>
          <p className="text-white/60 text-xl mt-2">Powered by OnSpace AI • Real-time Web Search</p>
        </div>
      </div>
    </div>
  );
}
