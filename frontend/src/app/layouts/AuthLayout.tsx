import { Outlet, useLocation } from 'react-router';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthFormPanel } from '../components/auth/AuthFormPanel';
import { MarketingPanel } from '../components/marketing/MarketingPanel';
import { useTheme } from '../hooks/use-theme';

export function AuthLayout() {
  const { isDark } = useTheme();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500"
      style={{ background: isDark ? '#231f19' : '#d8d0c0' }}
    >
      <DarkModeToggle />

      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl">
        <AuthFormPanel isLogin={isLogin} isDark={isDark} footer={<AuthFooter />}>
          <Outlet />
        </AuthFormPanel>

        <MarketingPanel isLogin={isLogin} />
      </div>
    </div>
  );
}
