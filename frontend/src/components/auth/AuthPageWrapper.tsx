import { type ReactNode } from "react";
import { motion } from "motion/react";
import { useTheme } from "../../hooks/use-theme";

interface AuthPageWrapperProps {
  children: ReactNode;
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  const { isDark } = useTheme();

  const pageBg = isDark ? "#231f19" : "#d8d0c0";
  const formBg = isDark ? "#36312a" : "#EDE7D9";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500"
      style={{ background: pageBg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: formBg }}
      >
        {children}
      </motion.div>
    </div>
  );
}