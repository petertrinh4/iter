import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { brandColors } from '../../constants/marketing';
import { useTheme } from '../../hooks/use-theme';

export function LoginForm() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login', { email, password });
  };

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none">
      <CardHeader className="space-y-1 text-center">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
          <CardTitle className="text-3xl font-bold" style={{ color: brandColors.accent }}>
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your credentials to access your account
          </CardDescription>
        </motion.div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm hover:underline transition-colors"
              style={{ color: brandColors.accent }}
            >
              Forgot password?
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{ background: brandColors.accent, color: brandColors.dark }}
          >
            Sign In
            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="px-2 text-muted-foreground transition-colors duration-500"
                style={{ background: isDark ? '#36312a' : '#EDE7D9' }}
              >
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-2 transition-all duration-300"
            style={{ borderColor: brandColors.accent, color: brandColors.accent }}
            asChild
          >
            <Link to="/register">Sign Up</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
