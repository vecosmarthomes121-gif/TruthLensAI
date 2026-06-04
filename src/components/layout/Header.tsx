import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User, Puzzle, Info, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useAuth } from '@/stores/authStore';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';
import AuthModal from '@/components/features/AuthModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
            <img
              src="/icon-512.png"
              alt="VeroLente AI"
              className="h-9 w-9 rounded-lg object-cover group-hover:shadow-lg transition-shadow"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VeroLente AI
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
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              About
            </Link>
            <Link to="/history" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              History
            </Link>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-foreground">{user.username}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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

          {/* Mobile: dark mode + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-500" />
              )}
            </button>
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation — Home/Verify/Trending/Dashboard are in bottom nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col gap-1">
              {user && (
                <>
                  <Link
                    to="/teams"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Teams
                  </Link>
                  <Link
                    to="/templates"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Templates
                  </Link>
                </>
              )}
              <Link
                to="/history"
                className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                History
              </Link>
              <Link
                to="/extension"
                className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Puzzle className="h-4 w-4" />
                Extension
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                About
              </Link>

              <div className="border-t my-2" />

              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 px-3 py-2.5 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
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
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold text-center mt-1"
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
