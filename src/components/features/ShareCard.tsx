import { VerificationResult } from '@/types';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareCardProps {
  result: VerificationResult;
}

export default function ShareCard({ result }: ShareCardProps) {
  const statusConfig = {
    'true': { color: 'bg-green-500', icon: CheckCircle, text: 'TRUE' },
    'mostly-true': { color: 'bg-green-400', icon: CheckCircle, text: 'MOSTLY TRUE' },
    'disputed': { color: 'bg-yellow-500', icon: AlertTriangle, text: 'DISPUTED' },
    'mostly-false': { color: 'bg-orange-500', icon: XCircle, text: 'MOSTLY FALSE' },
    'false': { color: 'bg-red-500', icon: XCircle, text: 'FALSE' },
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  return (
    <div className="w-[1200px] h-[630px] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12 flex flex-col justify-between relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TruthLens AI
            </h1>
            <p className="text-gray-600 text-lg">AI-Powered Fact Verification</p>
          </div>
        </div>

        {/* Truth Score */}
        <div className="flex items-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-40 h-40 rounded-full flex items-center justify-center shadow-2xl",
              config.color
            )}>
              <div className="text-center">
                <div className="text-6xl font-bold text-white">{result.truthScore}</div>
                <div className="text-xl text-white/90">%</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <StatusIcon className="h-6 w-6 text-gray-700" />
              <span className="text-xl font-bold text-gray-800">{config.text}</span>
            </div>
          </div>

          {/* Claim */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4 line-clamp-3">
              "{result.claim}"
            </h2>
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-lg">{result.sources.length} Sources Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-lg">Real-time AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t-2 border-gray-200 pt-6">
        <p className="text-gray-600 text-xl text-center">
          Verify any claim at <span className="font-bold text-blue-600">TruthLens.AI</span> • Powered by OnSpace AI
        </p>
      </div>
    </div>
  );
}
