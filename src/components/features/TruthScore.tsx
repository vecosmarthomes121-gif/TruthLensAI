import { cn, getScoreColor, getStatusLabel } from '@/lib/utils';
import { VerificationStatus } from '@/types';

interface TruthScoreProps {
  score: number;
  status: VerificationStatus;
  size?: 'sm' | 'lg';
}

export default function TruthScore({ score, status, size = 'lg' }: TruthScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-3", size === 'sm' ? 'gap-2' : 'gap-4')}>
      <div className="relative">
        <svg 
          className={cn(size === 'sm' ? 'w-24 h-24' : 'w-32 h-32')} 
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(getScoreColor(score), 'transition-all duration-1000')}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-bold",
            size === 'sm' ? 'text-2xl' : 'text-3xl',
            getScoreColor(score)
          )}>
            {score}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className={cn(
          "font-semibold px-3 py-1 rounded-full inline-block",
          size === 'sm' ? 'text-xs' : 'text-sm',
          score >= 80 ? 'bg-success/10 text-success' :
          score >= 60 ? 'bg-success/10 text-success/80' :
          score >= 40 ? 'bg-warning/10 text-warning' :
          score >= 20 ? 'bg-danger/10 text-danger/80' :
          'bg-danger/10 text-danger'
        )}>
          {getStatusLabel(status)}
        </div>
      </div>
    </div>
  );
}
