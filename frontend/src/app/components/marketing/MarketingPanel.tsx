import { motion } from 'motion/react';
import { Star, Zap } from 'lucide-react';
import { brandColors, features, testimonial } from '../../constants/marketing';

interface MarketingPanelProps {
  isLogin: boolean;
}

export function MarketingPanel({ isLogin }: MarketingPanelProps) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12 ${isLogin ? 'order-2' : 'order-1'}`}
      style={{
        background: 'linear-gradient(135deg, #4B4237 0%, #736B60 60%, #4B4237 100%)',
        minWidth: 0,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(213,160,33,0.15)' }}
        />
        <div
          className="absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgba(164,150,148,0.2)' }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(213,160,33,0.1)' }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(#EDE7D9 1px, transparent 1px), linear-gradient(90deg, #EDE7D9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(213,160,33,0.25)' }}
          >
            <Zap className="size-5" style={{ color: brandColors.accent }} />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ color: brandColors.light }}>
            iter
          </span>
        </div>

        <div className="mt-16">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight" style={{ color: brandColors.light }}>
            The platform that
            <br />
            <span style={{ color: brandColors.accent }}>moves with you.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed max-w-md" style={{ color: 'rgba(237,231,217,0.7)' }}>
            iter gives your team a single workspace to plan, build, and ship — without the noise.
            From idea to production, faster than ever.
          </p>
        </div>

        <div className="mt-12 space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div
                className="mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(213,160,33,0.2)' }}
              >
                <Icon className="size-4" style={{ color: brandColors.accent }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: brandColors.light }}>
                  {title}
                </p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(164,150,148,0.9)' }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'rgba(237,231,217,0.07)', borderColor: 'rgba(237,231,217,0.12)' }}
          >
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(237,231,217,0.85)' }}>
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #D5A021, #A49694)', color: brandColors.dark }}
              >
                {testimonial.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: brandColors.light }}>
                  {testimonial.author}
                </p>
                <p className="text-xs" style={{ color: brandColors.muted }}>
                  {testimonial.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
