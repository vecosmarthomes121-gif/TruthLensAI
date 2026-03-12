import { VerificationResult } from '@/types';

export interface UserStats {
  totalVerifications: number;
  trueCount: number;
  falseCount: number;
  disputedCount: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  contributionScore: number;
  topTopics: Array<{ topic: string; count: number }>;
  weeklyTrend: Array<{ date: string; count: number }>;
  accuracyTrend: Array<{ date: string; accuracy: number }>;
}

export const calculateUserStats = (verifications: VerificationResult[]): UserStats => {
  const totalVerifications = verifications.length;
  
  // Count by status
  const trueCount = verifications.filter(v => v.truthScore >= 60).length;
  const falseCount = verifications.filter(v => v.truthScore < 40).length;
  const disputedCount = verifications.filter(v => v.truthScore >= 40 && v.truthScore < 60).length;
  
  // Average accuracy
  const averageAccuracy = totalVerifications > 0
    ? Math.round(verifications.reduce((sum, v) => sum + v.truthScore, 0) / totalVerifications)
    : 0;
  
  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(verifications);
  
  // Calculate contribution score (gamification)
  const contributionScore = calculateContributionScore(verifications, currentStreak);
  
  // Extract topics from claims
  const topTopics = extractTopTopics(verifications);
  
  // Weekly trend (last 7 days)
  const weeklyTrend = calculateWeeklyTrend(verifications);
  
  // Accuracy trend over time
  const accuracyTrend = calculateAccuracyTrend(verifications);
  
  return {
    totalVerifications,
    trueCount,
    falseCount,
    disputedCount,
    averageAccuracy,
    currentStreak,
    longestStreak,
    contributionScore,
    topTopics,
    weeklyTrend,
    accuracyTrend,
  };
};

const calculateStreaks = (verifications: VerificationResult[]) => {
  if (verifications.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Sort by date descending
  const sorted = [...verifications].sort((a, b) => 
    new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime()
  );
  
  // Get unique dates
  const dates = [...new Set(sorted.map(v => 
    new Date(v.verifiedAt).toDateString()
  ))];
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Calculate current streak
  if (dates[0] === today || dates[0] === yesterday) {
    currentStreak = 1;
    let checkDate = new Date(dates[0]);
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      if (dates[i] === prevDate.toDateString()) {
        currentStreak++;
        checkDate = new Date(dates[i]);
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  tempStreak = 1;
  let checkDate = new Date(dates[0]);
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(checkDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    if (dates[i] === prevDate.toDateString()) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
      checkDate = new Date(dates[i]);
    } else {
      tempStreak = 1;
      checkDate = new Date(dates[i]);
    }
  }
  
  longestStreak = Math.max(longestStreak, currentStreak, 1);
  
  return { currentStreak, longestStreak };
};

const calculateContributionScore = (verifications: VerificationResult[], streak: number): number => {
  let score = 0;
  
  // Base points: 10 per verification
  score += verifications.length * 10;
  
  // Streak bonus: 5 points per day
  score += streak * 5;
  
  // Quality bonus: 20 points for high-quality verifications (multiple sources)
  const highQualityCount = verifications.filter(v => v.sources.length >= 5).length;
  score += highQualityCount * 20;
  
  // Diversity bonus: 15 points per unique topic
  const topics = new Set(verifications.map(v => extractTopic(v.claim)));
  score += topics.size * 15;
  
  // Recent activity bonus: 50 points if verified today
  const today = new Date().toDateString();
  const verifiedToday = verifications.some(v => 
    new Date(v.verifiedAt).toDateString() === today
  );
  if (verifiedToday) score += 50;
  
  return score;
};

const extractTopic = (claim: string): string => {
  const lowerClaim = claim.toLowerCase();
  
  // Keywords for common topics
  const topics: { [key: string]: string[] } = {
    'Politics': ['president', 'government', 'election', 'vote', 'political', 'minister', 'congress', 'senate'],
    'Health': ['covid', 'vaccine', 'health', 'medical', 'doctor', 'disease', 'virus', 'pandemic'],
    'Technology': ['ai', 'tech', 'apple', 'google', 'microsoft', 'software', 'app', 'internet', 'cyber'],
    'Climate': ['climate', 'global warming', 'environment', 'carbon', 'emissions', 'weather'],
    'Economy': ['economy', 'stock', 'market', 'inflation', 'gdp', 'finance', 'bank', 'trade'],
    'Science': ['study', 'research', 'scientist', 'discovery', 'experiment', 'space', 'nasa'],
    'Sports': ['sports', 'football', 'basketball', 'soccer', 'olympics', 'athlete', 'game'],
    'Entertainment': ['movie', 'celebrity', 'actor', 'music', 'film', 'star', 'hollywood'],
    'Military': ['military', 'war', 'army', 'defense', 'soldier', 'conflict', 'strike'],
    'Business': ['company', 'ceo', 'business', 'startup', 'amazon', 'tesla', 'corporate'],
  };
  
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => lowerClaim.includes(keyword))) {
      return topic;
    }
  }
  
  return 'General News';
};

const extractTopTopics = (verifications: VerificationResult[]): Array<{ topic: string; count: number }> => {
  const topicCounts: { [key: string]: number } = {};
  
  verifications.forEach(v => {
    const topic = extractTopic(v.claim);
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });
  
  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const calculateWeeklyTrend = (verifications: VerificationResult[]): Array<{ date: string; count: number }> => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const dailyCounts: { [key: string]: number } = {};
  last7Days.forEach(date => dailyCounts[date] = 0);
  
  verifications.forEach(v => {
    const date = new Date(v.verifiedAt).toISOString().split('T')[0];
    if (dailyCounts.hasOwnProperty(date)) {
      dailyCounts[date]++;
    }
  });
  
  return last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: dailyCounts[date],
  }));
};

const calculateAccuracyTrend = (verifications: VerificationResult[]): Array<{ date: string; accuracy: number }> => {
  if (verifications.length === 0) return [];
  
  // Group by date
  const byDate: { [key: string]: number[] } = {};
  
  verifications.forEach(v => {
    const date = new Date(v.verifiedAt).toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(v.truthScore);
  });
  
  // Calculate average for each date
  const trend = Object.entries(byDate)
    .map(([date, scores]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Last 10 data points
  
  return trend;
};

export const getBadges = (stats: UserStats): Array<{ name: string; description: string; earned: boolean; icon: string }> => {
  return [
    {
      name: 'First Verification',
      description: 'Complete your first fact-check',
      earned: stats.totalVerifications >= 1,
      icon: '🎯',
    },
    {
      name: 'Fact Checker',
      description: 'Verify 10 claims',
      earned: stats.totalVerifications >= 10,
      icon: '✅',
    },
    {
      name: 'Truth Seeker',
      description: 'Verify 50 claims',
      earned: stats.totalVerifications >= 50,
      icon: '🔍',
    },
    {
      name: 'Verification Master',
      description: 'Verify 100 claims',
      earned: stats.totalVerifications >= 100,
      icon: '👑',
    },
    {
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      earned: stats.currentStreak >= 7,
      icon: '🔥',
    },
    {
      name: 'Dedicated Detective',
      description: 'Maintain a 30-day streak',
      earned: stats.longestStreak >= 30,
      icon: '💎',
    },
    {
      name: 'Quality Inspector',
      description: 'Complete 5 high-quality verifications',
      earned: stats.contributionScore >= 200,
      icon: '⭐',
    },
    {
      name: 'Top Contributor',
      description: 'Reach 1000 contribution points',
      earned: stats.contributionScore >= 1000,
      icon: '🏆',
    },
  ];
};
