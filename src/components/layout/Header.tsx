import { Link } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User, TrendingUp, History, BarChart3, Users, FileText, Puzzle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/stores/authStore';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';
import AuthModal from '@/components/features/AuthModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      logout();
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TruthLens AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/verify" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Verify
            </Link>
            <Link to="/trending" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Trending
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/teams" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Teams
                </Link>
                <Link to="/templates" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Templates
                </Link>
              </>
            )}
            <Link to="/extension" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
              <Puzzle className="h-3.5 w-3.5" />
              Extension
            </Link>
            <Link to="/history" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              History
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-shadow"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/verify" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Verify
              </Link>
              <Link 
                to="/trending" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trending
              </Link>
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/teams" 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Teams
                  </Link>
                  <Link 
                    to="/templates" 
                    className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Templates
                  </Link>
                </>
              )}
              <Link 
                to="/extension" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Puzzle className="h-4 w-4" />
                Extension
              </Link>
              <Link 
                to="/history" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                History
              </Link>
              
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700 py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold text-center mt-2"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
