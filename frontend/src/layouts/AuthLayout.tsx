import { Outlet, useLocation } from "react-router";
import { DarkModeToggle } from "../components/common/DarkModeToggle";
import { AuthFormPanel } from "../components/auth/AuthFormPanel";
import { MarketingPanel } from "../components/marketing/MarketingPanel";
import { useTheme } from "../hooks/use-theme";

export function AuthLayout() {
  const { isDark } = useTheme();
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500"
      style={{ background: isDark ? "#231f19" : "#d8d0c0" }}
    >
      <DarkModeToggle />
      <main className="w-full max-w-6xl flex rounded-3xl overflow-hidden shadow-2xl">
        <AuthFormPanel
          isLogin={isLogin}
          isDark={isDark}
        >
          <Outlet />
        </AuthFormPanel>

        <MarketingPanel isLogin={isLogin} />
      </main>
    </div>
  );
}
