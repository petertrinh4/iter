import { useState } from "react";

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter (A–Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "One lowercase letter (a–z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

interface UsePasswordValidationReturn {
  isPasswordValid: boolean;
  isPasswordFocused: boolean;
  shouldShowRules: boolean;
  onPasswordFocus: () => void;
  onPasswordBlur: () => void;
}

export function usePasswordValidation(
  password: string
): UsePasswordValidationReturn {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const isPasswordValid = PASSWORD_RULES.every((rule) => rule.test(password));
  const shouldShowRules =
    isPasswordFocused || (password.length > 0 && !isPasswordValid);

  function onPasswordFocus() {
    setIsPasswordFocused(true);
  }

  function onPasswordBlur() {
    setIsPasswordFocused(false);
  }

  return {
    isPasswordValid,
    isPasswordFocused,
    shouldShowRules,
    onPasswordFocus,
    onPasswordBlur,
  };
}
