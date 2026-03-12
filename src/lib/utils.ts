import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-success/80';
  if (score >= 40) return 'text-warning';
  if (score >= 20) return 'text-danger/80';
  return 'text-danger';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-success/80';
  if (score >= 40) return 'bg-warning';
  if (score >= 20) return 'bg-danger/80';
  return 'bg-danger';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'true': 'True',
    'mostly-true': 'Mostly True',
    'disputed': 'Disputed',
    'mostly-false': 'Mostly False',
    'false': 'False'
  };
  return labels[status] || status;
}
