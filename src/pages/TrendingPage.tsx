import { useEffect, useState } from 'react';
import { getTrendingClaims } from '@/lib/api';
import { TrendingClaim } from '@/types';
import TrendingCard from '@/components/features/TrendingCard';
import { TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function TrendingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [trending, setTrending] = useState<TrendingClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const data = await getTrendingClaims();
      setTrending(data);
    } catch (error: any) {
      console.error('Failed to load trending:', error);
      toast.error('Failed to load trending claims');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(trending.map(c => c.category)))];

  const filteredClaims = selectedCategory === 'all' 
    ? trending 
    : trending.filter(claim => claim.category === selectedCategory);

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading trending claims...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Trending Verifications</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Most verified claims in real-time. Track viral misinformation before it spreads.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {trending.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {filteredClaims.length}
              </div>
              <div className="text-xs text-muted-foreground">Trending Claims</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {filteredClaims.filter(c => c.truthScore >= 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Verified True</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-danger mb-1">
                {filteredClaims.filter(c => c.truthScore < 40).length}
              </div>
              <div className="text-xs text-muted-foreground">Verified False</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {filteredClaims.filter(c => c.truthScore >= 40 && c.truthScore < 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Disputed</div>
            </div>
          </div>
        )}

        {/* Trending Claims Grid */}
        {filteredClaims.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClaims.map(claim => (
              <TrendingCard key={claim.id} claim={claim} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Trending Claims Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start verifying claims to see trending misinformation
            </p>
            <a 
              href="/verify"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              Verify First Claim
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
