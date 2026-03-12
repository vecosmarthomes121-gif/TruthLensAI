import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Globe, TrendingUp, Lock, BarChart3 } from 'lucide-react';
import heroImage from '@/assets/hero-verification.jpg';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Get AI-powered fact checks in seconds across 50,000+ global news sources'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Multi-language support with real-time analysis from trusted international outlets'
    },
    {
      icon: TrendingUp,
      title: 'Trend Detection',
      description: 'Track viral misinformation trends before they spread across social platforms'
    },
    {
      icon: Shield,
      title: 'Multimedia Analysis',
      description: 'Verify text, images, videos, and URLs with advanced AI detection'
    },
    {
      icon: BarChart3,
      title: 'Credibility Scoring',
      description: 'Transparent truth scores based on source reliability and evidence strength'
    },
    {
      icon: Lock,
      title: 'Trusted Sources',
      description: 'Cross-reference with Reuters, BBC, AP, and thousands of verified outlets'
    }
  ];

  const stats = [
    { value: '50M+', label: 'Verifications' },
    { value: '50,000+', label: 'News Sources' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Real-time' }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                AI-Powered Truth Engine
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Verify News, Videos & Claims{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Instantly with AI
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The world's most trusted fact-checking platform. Submit any headline, link, image, or video and get instant verification backed by global news sources and AI analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/verify')}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
                >
                  Start Verifying Now
                </button>
                <button
                  onClick={() => navigate('/trending')}
                  className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
                >
                  Explore Trending Claims
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
              <img 
                src={heroImage} 
                alt="AI Verification Platform"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm lg:text-base text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multi-agent AI system that extracts claims, searches global sources, and delivers comprehensive verification reports
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How TruthLens AI Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five-stage AI verification pipeline analyzing content in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {[
              { step: '1', title: 'Submit Content', desc: 'Text, URL, image, or video' },
              { step: '2', title: 'Extract Claims', desc: 'AI identifies key assertions' },
              { step: '3', title: 'Search Sources', desc: 'Scan 50,000+ news outlets' },
              { step: '4', title: 'Analyze Evidence', desc: 'Cross-reference reports' },
              { step: '5', title: 'Get Results', desc: 'Truth score + explanation' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">2-5 sec</div>
              <p className="text-muted-foreground">Average verification time</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <p className="text-muted-foreground">Trusted news sources</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">4 Formats</div>
              <p className="text-muted-foreground">Text, URL, image, video</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-center p-6 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="text-4xl font-bold text-primary mb-2">📊</div>
              <p className="text-muted-foreground font-semibold">View Your Dashboard</p>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Stop Misinformation Before It Spreads
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Join millions using TruthLens AI to verify news and combat fake information
            </p>
            <button
              onClick={() => navigate('/verify')}
              className="px-8 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:shadow-lg transition-shadow"
            >
              Start Free Verification
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
