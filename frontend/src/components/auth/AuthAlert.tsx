import { XCircle, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { brandColors } from "../../constants/marketing";

type AlertType = "error" | "success" | "info";

interface AuthAlertProps {
  type: AlertType;
  message: string;
}

const STYLES: Record<
  AlertType,
  { bg: string; border: string; color: string | ((isDark: boolean) => string) }
> = {
  error: {
    bg: "rgba(192,57,43,0.1)",
    border: "rgba(192,57,43,0.3)",
    color: "#c0392b",
  },
  success: {
    bg: "rgba(39,174,96,0.1)",
    border: "rgba(39,174,96,0.3)",
    color: "#27ae60",
  },
  info: {
    bg: "rgba(213,160,33,0.1)",
    border: "rgba(213,160,33,0.3)",
    color: (isDark: boolean) =>
      isDark ? brandColors.accent : brandColors.accentText,
  },
};

export function AuthAlert({ type, message }: AuthAlertProps) {
  const { isDark } = useTheme();

  if (!message) return null;

  const style = STYLES[type];
  const color =
    typeof style.color === "function" ? style.color(isDark) : style.color;
  const Icon = type === "error" ? XCircle : CheckCircle2;

  return (
    <div
      className="rounded-lg px-4 py-2.5 text-sm border flex items-start gap-2"
      style={{
        background: style.bg,
        borderColor: style.border,
        color,
      }}
    >
      <Icon className="size-4 mt-0.5 shrink-0" />
      {message}
    </div>
  );
}
