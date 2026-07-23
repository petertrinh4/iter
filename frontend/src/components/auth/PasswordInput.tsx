import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  className = "",
  placeholder = "••••••••",
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  function toggleVisibility() {
    setIsVisible((prev) => !prev);
  }

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        id={id}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`pl-10 pr-12 h-11 ${className}`}
        required
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}
