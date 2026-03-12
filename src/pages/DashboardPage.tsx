import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerificationHistory } from '@/lib/api';
import { calculateUserStats, getBadges, UserStats } from '@/lib/analytics';
import { VerificationResult } from '@/types';
import { useAuth } from '@/stores/authStore';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Target, Award, Flame, BarChart3, 
  CheckCircle, XCircle, AlertTriangle, Lock, Trophy,
  ArrowUpRight, Calendar, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to view your dashboard');
      navigate('/');
      return;
    }

    if (user) {
      loadDashboard();
    }
  }, [user, authLoading, navigate]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getVerificationHistory();
      console.log('Loading dashboard with', data.length, 'verifications');
      setVerifications(data);
      
      const calculatedStats = calculateUserStats(data);
      console.log('User stats:', calculatedStats);
      setStats(calculatedStats);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const badges = getBadges(stats);
  const earnedBadges = badges.filter(b => b.earned);

  // Chart colors
  const COLORS = {
    true: '#22c55e',
    false: '#ef4444',
    disputed: '#f59e0b',
    primary: '#3b82f6',
    purple: '#a855f7',
  };

  // Pie chart data
  const pieData = [
    { name: 'True', value: stats.trueCount, color: COLORS.true },
    { name: 'False', value: stats.falseCount, color: COLORS.false },
    { name: 'Disputed', value: stats.disputedCount, color: COLORS.disputed },
  ].filter(d => d.value > 0);

  return (
    <div className="container py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Your Dashboard</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Track your fact-checking journey and contribution impact
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Verifications */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 opacity-80" />
              <ArrowUpRight className="h-5 w-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalVerifications}</div>
            <div className="text-sm opacity-90">Total Verifications</div>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-8 w-8 opacity-80" />
              <Calendar className="h-5 w-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.currentStreak}</div>
            <div className="text-sm opacity-90">
              Day Streak {stats.currentStreak > 0 && '🔥'}
            </div>
          </div>

          {/* Contribution Score */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-8 w-8 opacity-80" />
              <Zap className="h-5 w-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.contributionScore.toLocaleString()}</div>
            <div className="text-sm opacity-90">Contribution Points</div>
          </div>

          {/* Average Accuracy */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <BarChart3 className="h-5 w-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.averageAccuracy}%</div>
            <div className="text-sm opacity-90">Avg Truth Score</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Verification Distribution */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Verification Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-lg font-bold">{stats.trueCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">True</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="h-4 w-4 text-danger" />
                  <span className="text-lg font-bold">{stats.falseCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">False</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-lg font-bold">{stats.disputedCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">Disputed</div>
              </div>
            </div>
          </div>

          {/* Accuracy Trend */}
          {stats.accuracyTrend.length > 0 && (
            <div className="bg-card border rounded-xl p-6 lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">Truth Score Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke={COLORS.purple} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.purple, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Topics */}
        {stats.topTopics.length > 0 && (
          <div className="bg-card border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Most Verified Topics</h2>
            <div className="space-y-3">
              {stats.topTopics.map((topic, index) => (
                <div key={topic.topic} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{topic.topic}</span>
                      <span className="text-sm text-muted-foreground">
                        {topic.count} verification{topic.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${(topic.count / stats.totalVerifications) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges & Achievements */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Achievements</h2>
            <div className="text-sm text-muted-foreground">
              {earnedBadges.length} of {badges.length} earned
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={cn(
                  "border rounded-lg p-4 text-center transition-all",
                  badge.earned 
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                    : "bg-muted/30 border-muted opacity-50"
                )}
              >
                <div className="text-4xl mb-2">
                  {badge.earned ? badge.icon : '🔒'}
                </div>
                <div className="font-semibold mb-1 text-sm">{badge.name}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
                {badge.earned && (
                  <div className="mt-2">
                    <Award className="h-4 w-4 text-blue-600 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global Impact */}
        <div className="mt-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Your Global Impact</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            You're part of a global movement fighting misinformation. Your {stats.totalVerifications} verifications 
            contribute to a more informed world.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold mb-1">{stats.contributionScore}</div>
              <div className="text-sm opacity-90">Impact Points</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{stats.longestStreak}</div>
              <div className="text-sm opacity-90">Best Streak</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{stats.totalVerifications}</div>
              <div className="text-sm opacity-90">Facts Checked</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/verify')}
            className="mt-8 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Verify More Claims
          </button>
        </div>
      </div>
    </div>
  );
}
