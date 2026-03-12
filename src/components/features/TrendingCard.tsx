import { TrendingUp } from 'lucide-react';
import { TrendingClaim } from '@/types';
import { getScoreColor, getStatusLabel } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface TrendingCardProps {
  claim: TrendingClaim;
}

export default function TrendingCard({ claim }: TrendingCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // In real app, would navigate to verification result
    navigate('/verify', { state: { claim: claim.claim } });
  };

  return (
    <div 
      onClick={handleClick}
      className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md bg-card"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {claim.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{claim.verificationCount.toLocaleString()} checks</span>
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">
            {claim.claim}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getScoreColor(claim.truthScore)}`}>
            {claim.truthScore}%
          </span>
          <span className="text-xs text-muted-foreground">
            {getStatusLabel(claim.status)}
          </span>
        </div>
        <button className="text-xs text-primary hover:underline">
          View Details →
        </button>
      </div>
    </div>
  );
}
