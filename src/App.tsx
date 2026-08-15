import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HomePage from '@/pages/HomePage';
import VerifyPage from '@/pages/VerifyPage';
import ResultPage from '@/pages/ResultPage';
import TrendingPage from '@/pages/TrendingPage';
import HistoryPage from '@/pages/HistoryPage';
import DashboardPage from '@/pages/DashboardPage';

import ExtensionPage from '@/pages/ExtensionPage';
import ApiAccessPage from '@/pages/ApiAccessPage';
import AboutPage from '@/pages/AboutPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import NotFoundPage from '@/pages/NotFoundPage';
// Scroll restoration on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/stores/authStore';
import { mapSupabaseUser } from '@/lib/auth';

function App() {
  const { login, logout, setLoading } = useAuth();

  useEffect(() => {
    let mounted = true;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) login(mapSupabaseUser(session.user));
      if (mounted) setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          login(mapSupabaseUser(session.user));
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          logout();
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          login(mapSupabaseUser(session.user));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [login, logout, setLoading]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-[80px] md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/result/:id" element={<ResultPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/extension" element={<ExtensionPage />} />
            <Route path="/api" element={<ApiAccessPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
