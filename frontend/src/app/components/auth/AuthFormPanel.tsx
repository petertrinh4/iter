import { motion, AnimatePresence } from 'motion/react';
import type { ReactNode } from 'react';

interface AuthFormPanelProps {
  isLogin: boolean;
  isDark: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFormPanel({ isLogin, isDark, children, footer }: AuthFormPanelProps) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors duration-500 ${isLogin ? 'order-1' : 'order-2'}`}
      style={{ background: isDark ? '#36312a' : '#EDE7D9', minWidth: 0 }}
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
        {footer}
      </div>
    </motion.div>
  );
}
