import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowRight, KeyRound, Mail, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { brandColors } from "../../constants/marketing";
import { useTheme } from "../../hooks/use-theme";
import { mapVerifyError, mapResendCodeError } from "../../utils/authErrorMappers";
import { AuthAlert } from "./AuthAlert";

const API_BASE = import.meta.env.VITE_API_URL;

async function submitVerifyCode(
  email: string,
  code: string,
  name: string,
  username: string
): Promise<{ ok: boolean; alreadyConfirmed?: boolean; errorMessage?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, name, username }),
    });

    const data = await res.json();

    if (!res.ok) {
      const raw = data.message || data.error || "Verification failed.";
      const isAlreadyConfirmed =
        raw.toLowerCase().includes("already confirmed") ||
        raw.toLowerCase().includes("notauthorized");

      return {
        ok: false,
        alreadyConfirmed: isAlreadyConfirmed,
        errorMessage: mapVerifyError(raw),
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

async function submitResendCode(
  email: string
): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) return { ok: true };

    const data = await res.json();
    return {
      ok: false,
      errorMessage: mapResendCodeError(
        data.message || data.error || "Could not resend code."
      ),
    };
  } catch {
    return {
      ok: false,
      errorMessage:
        "Could not connect to the server. Check your connection and try again.",
    };
  }
}

export function VerifyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const email = location.state?.email || "";
  const name = location.state?.name || "";
  const username = location.state?.username || "";

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [hasResendSucceeded, setHasResendSucceeded] = useState(false);

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const result = await submitVerifyCode(email, code, name, username);
    setIsLoading(false);

    if (!result.ok) {
      if (result.alreadyConfirmed) {
        navigate("/login");
        return;
      }
      setErrorMessage(result.errorMessage ?? "Verification failed.");
      return;
    }

    setSuccessMessage("Email verified successfully! Redirecting to sign in…");
    setTimeout(() => navigate("/login"), 1500);
  }

  async function handleResend() {
    setErrorMessage("");
    setHasResendSucceeded(false);
    setIsResendLoading(true);

    const result = await submitResendCode(email);
    setIsResendLoading(false);

    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? "Could not resend code.");
      return;
    }

    setHasResendSucceeded(true);
  }

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none w-full">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(213,160,33,0.15)" }}
            >
              <Mail className="size-7" style={{ color: brandColors.accent }} />
            </div>
          </div>
          <CardTitle
            className="text-3xl font-bold"
            style={{
              color: isDark ? brandColors.accent : brandColors.accentText,
            }}
          >
            Check Your Email
          </CardTitle>
          <CardDescription className="text-base mt-2">
            We sent a 6-digit code to{" "}
            <span
              className="font-semibold"
              style={{
                color: isDark ? brandColors.light : brandColors.dark,
              }}
            >
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="flex flex-col gap-5 px-8">
            <AuthAlert type="error" message={errorMessage} />
            <AuthAlert type="success" message={successMessage} />
            {hasResendSucceeded && !errorMessage && (
              <AuthAlert
                type="info"
                message="A new code has been sent to your email."
              />
            )}

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
              {isLoading ? "Verifying…" : "Verify Email"}
              {!isLoading && (
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="px-2 text-muted-foreground transition-colors duration-500"
                  style={{ background: isDark ? "#36312a" : "#EDE7D9" }}
                >
                  Didn&apos;t receive it?
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isResendLoading}
              onClick={handleResend}
              className="w-full h-11 border-2 transition-all duration-300 gap-2"
              style={{
                borderColor: brandColors.accent,
                color: isDark ? brandColors.accent : brandColors.accentText,
                opacity: isResendLoading ? 0.7 : 1,
              }}
            >
              <RotateCcw className="size-4" />
              {isResendLoading ? "Sending…" : "Resend Code"}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm text-muted-foreground hover:underline transition-colors"
            >
              Back to Sign Up
            </button>
          </CardFooter>
        </form>
    </Card>
  );
}