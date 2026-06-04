import { Link, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/verify', label: 'Verify', icon: ShieldCheck },
  { to: '/trending', label: 'Trending', icon: TrendingUp },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop blur glass pill */}
      <div className="mx-3 mb-3 rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] bg-white/75 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-stretch">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[56px] transition-all duration-200 relative',
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                )}
                aria-label={label}
              >
                {/* Active indicator pill */}
                {active && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                )}
                <Icon
                  className={cn(
                    'transition-all duration-200',
                    active ? 'h-[22px] w-[22px] stroke-[2.5]' : 'h-[20px] w-[20px] stroke-2'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-wide transition-all',
                    active ? 'opacity-100' : 'opacity-70'
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
