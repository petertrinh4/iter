import { motion } from "motion/react";
import { MapPin, Bookmark, CalendarDays } from "lucide-react";
import { brandColors } from "../../constants/marketing";

interface MarketingPanelProps {
  isLogin: boolean;
}

const features = [
  {
    icon: MapPin,
    title: "Plan Routes Anywhere",
    description: "Draw custom paths on any street, trail, or campus worldwide.",
  },
  {
    icon: Bookmark,
    title: "Save & Reuse Routes",
    description:
      "Name and store your favorite routes so you never have to re-draw them.",
  },
  {
    icon: CalendarDays,
    title: "Track Your Consistency",
    description:
      "A built-in calendar logs your activity history so you can see your habits grow over time.",
  },
];

export function MarketingPanel({ isLogin }: MarketingPanelProps) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col p-14 ${isLogin ? "order-2" : "order-1"}`}
      style={{
        background:
          "linear-gradient(135deg, #4B4237 0%, #736B60 60%, #4B4237 100%)",
        minWidth: 0,
      }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(213,160,33,0.15)" }}
        />
        <div
          className="absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(164,150,148,0.2)" }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgba(213,160,33,0.1)" }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#EDE7D9 1px, transparent 1px), linear-gradient(90deg, #EDE7D9 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top: logo */}
      <div className="flex items-center gap-2">
          <div className="w-9 h-9 overflow-hidden rounded-xl">
            <img 
              src="/iter-logo.png" 
              alt="iter logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span
            className="font-bold text-xl tracking-tight"
            style={{ color: brandColors.light }}
          >
            iter
          </span>
        </div>

        {/* Middle: headline + features */}
        <div className="flex flex-col gap-12">
          <div>
            <h1
              className="text-4xl xl:text-5xl font-bold leading-tight"
              style={{ color: brandColors.light }}
            >
              The platform that
              <br />
              <span style={{ color: brandColors.accent }}>moves with you.</span>
            </h1>
            <p
              className="mt-5 text-lg leading-relaxed max-w-md"
              style={{ color: "rgba(237,231,217,0.7)" }}
            >
              iter lets you plan, save, and revisit your routes — anywhere in
              the world. Build your path your way, and track your consistency
              over time.
            </p>
          </div>

          <div className="space-y-7">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(213,160,33,0.2)" }}
                >
                  <Icon
                    className="size-4"
                    style={{ color: brandColors.accent }}
                  />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: brandColors.light }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "rgba(164,150,148,0.9)" }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacer — keeps content from hugging the bottom */}
        <div />
      </div>
    </motion.div>
  );
}