import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { KeyRound, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { brandColors } from "../../constants/marketing";
import { useTheme } from "../../hooks/use-theme";
import { usePasswordValidation } from "../../hooks/usePasswordValidation";
import { mapResetPasswordError } from "./authErrorMappers";
import { AuthAlert } from "./AuthAlert";
import { PasswordInput } from "./PasswordInput";
import { PasswordRulesChecklist } from "./PasswordRulesChecklist";

const API_BASE = import.meta.env.VITE_API_URL;

async function submitPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        errorMessage: mapResetPasswordError(
          data.message || data.error || "Password reset failed."
        ),
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      errorMessage:
        "Could not connect to the server. Check your connection and try again.",
    };
  }
}

function getConfirmPasswordClassName(
  confirmPassword: string,
  newPassword: string
): string {
  if (!confirmPassword) return "";
  const passwordsMatch = confirmPassword === newPassword;
  return passwordsMatch
    ? "border-green-400 focus-visible:ring-green-400"
    : "border-red-400 focus-visible:ring-red-400";
}

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isPasswordValid,
    shouldShowRules,
    onPasswordFocus,
    onPasswordBlur,
  } = usePasswordValidation(newPassword);

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  function validateForm(): string | null {
    if (!isPasswordValid)
      return "New password doesn't meet all the requirements below.";
    if (newPassword !== confirmPassword)
      return "Passwords do not match. Please re-enter your new password.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);
    const result = await submitPasswordReset(email, code, newPassword);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? "Password reset failed.");
      return;
    }

    setSuccessMessage("Password reset successfully! Redirecting to sign in…");
    setTimeout(() => navigate("/login"), 1500);
  }

  const passwordsMatch = confirmPassword && confirmPassword === newPassword;
  const passwordsMismatch = confirmPassword && confirmPassword !== newPassword;

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none w-full">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(213,160,33,0.15)" }}
            >
              <KeyRound
                className="size-7"
                style={{ color: brandColors.accent }}
              />
            </div>
          </div>
          <CardTitle
            className="text-3xl font-bold"
            style={{
              color: isDark ? brandColors.accent : brandColors.accentText,
            }}
          >
            Reset Password
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Enter the code we sent to{" "}
            <span
              className="font-semibold"
              style={{ color: isDark ? "#EDE7D9" : "#4B4237" }}
            >
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-5 px-8">
            <AuthAlert type="error" message={errorMessage} />
            <AuthAlert type="success" message={successMessage} />

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10 h-11 text-center tracking-[0.4em] text-lg font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={setNewPassword}
                onFocus={onPasswordFocus}
                onBlur={onPasswordBlur}
              />
              {shouldShowRules && (
                <PasswordRulesChecklist password={newPassword} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                className={getConfirmPasswordClassName(
                  confirmPassword,
                  newPassword
                )}
              />
              {passwordsMismatch && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="size-3.5" /> Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: "#27ae60" }}
                >
                  <CheckCircle2 className="size-3.5" /> Passwords match
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              style={{
                background: brandColors.accent,
                color: "#1a1611",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Resetting…" : "Set New Password"}
              {!isLoading && (
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-muted-foreground hover:underline transition-colors"
            >
              Back
            </button>
          </CardFooter>
        </form>
    </Card>
  );
}