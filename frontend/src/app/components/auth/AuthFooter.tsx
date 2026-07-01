import { motion } from 'motion/react';
import { brandColors } from '../../constants/marketing';

export function AuthFooter() {
  return (
    <motion.p
      className="text-center mt-6 text-sm text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      By continuing, you agree to our{' '}
      <button type="button" className="hover:underline" style={{ color: brandColors.accent }}>
        Terms of Service
      </button>{' '}
      and{' '}
      <button type="button" className="hover:underline" style={{ color: brandColors.accent }}>
        Privacy Policy
      </button>
    </motion.p>
  );
}
