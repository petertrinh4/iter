import { Shield, Users, Zap, type LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export const features: Feature[] = [
  { icon: Zap, title: 'Lightning Fast', description: 'Built for speed and performance at every scale.' },
  { icon: Shield, title: 'Secure by Default', description: 'Enterprise-grade security protecting your data.' },
  { icon: Users, title: 'Built for Teams', description: 'Collaborate seamlessly with your entire organization.' },
];

export const testimonial: Testimonial = {
  quote: 'This platform transformed the way our team works. We ship faster and sleep better.',
  author: 'Sarah Chen',
  role: 'CTO at Horizon Labs',
  avatar: 'SC',
};

export const brandColors = {
  accent: '#D5A021',
  dark: '#4B4237',
  light: '#EDE7D9',
  muted: '#A49694',
} as const;
