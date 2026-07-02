import { Link } from 'react-router';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail, User, AtSign } from 'lucide-react';
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

//const app_name = 'https://main.d16rmfrw6xdafc.amplifyapp.com/'; // Change to offical later
const API_BASE = import.meta.env.VITE_API_URL;

function buildPath(route: string): string {
  return `${API_BASE}/${route}`;
}

export function RegisterForm() {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    //console.log('Register', { name, email, password, confirmPassword });

    if (password !== confirmPassword) {
      setError('Passwords do no match');
      return;
    }

    try {
      const res = await fetch(buildPath('APIs/User/registerAPI'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        setSuccess('Account created successfully! You can now sign in.');
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
    }

  };

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none">
      <CardHeader className="space-y-1 text-center">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
          <CardTitle className="text-3xl font-bold" style={{ color: brandColors.accent }}>
            Create Account
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Sign up to get started with your journey
          </CardDescription>
        </motion.div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          {error && (
            <p className='text-sm text-red-500 text-center'>{error}</p>
          )}
          {success && (
            <p className='text-sm text-green-500 text-center'>{success}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>


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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{ background: brandColors.accent, color: brandColors.dark }}
          >
            Create Account
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
                Already have an account?
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
            <Link to="/login">Sign In</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
