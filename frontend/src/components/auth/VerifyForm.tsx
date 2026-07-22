import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowRight,
  KeyRound,
  Mail,
  RotateCcw,
} from "lucide-react";
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
import { AuthAlert } from "./AuthAlert";
import { AuthPageWrapper } from "./AuthPageWrapper";

const API_BASE = import.meta.env.VITE_API_URL;

function mapVerifyError(raw: string): string {
  const msg = raw.toLowerCase();
  if (
    msg.includes("codemismatch") ||
    msg.includes("invalid verification code") ||
    msg.includes("invalid code")
  )
    return "Incorrect code. Please check your email and try again.";
  if (
    msg.includes("expiredcode") ||
    msg.includes("code has expired") ||
    msg.includes("expired")
  )
    return 'This code has expired. Click "Resend Code" to get a new one.';
  if (
    msg.includes("toomanyrequests") ||
    msg.includes("too many") ||
    msg.includes("limit exceeded")
  )
    return "Too many attempts. Please wait a moment and try again.";
  if (
    msg.includes("notauthorized") ||
    msg.includes("already confirmed")
  )
    return "This account is already verified. Try signing in.";
  return raw;
}

function mapResendError(raw: string): string {
  const msg = raw.toLowerCase();
  if (
    msg.includes("toomanyrequests") ||
    msg.includes("too many") ||
    msg.includes("limit exceeded")
  )
    return "Too many resend attempts. Please wait a moment and try again.";
  if (
    msg.includes("usernotfound") ||
    msg.includes("user does not exist")
  )
    return "No account found with this email.";
  if (
    msg.includes("notauthorized") ||
    msg.includes("already confirmed")
  )
    return "This account is already verified. Try signing in.";
  return raw;
}

export function VerifyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const email = location.state?.email || "";
  const name = location.state?.name || "";
  const username = location.state?.username || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, name, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        const raw = data.message || data.error || "Verification failed.";
        const lower = raw.toLowerCase();

        if (
          lower.includes("already confirmed") ||
          lower.includes("notauthorized")
        ) {
          navigate("/login");
          return;
        }

        setError(mapVerifyError(raw));
        return;
      }

      setSuccess("Email verified successfully! Redirecting to sign in…");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError(
        "Could not connect to the server. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSent(false);
    setResendLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendSent(true);
      } else {
        const data = await res.json();
        setError(
          mapResendError(
            data.message || data.error || "Could not resend code."
          )
        );
      }
    } catch {
      setError(
        "Could not connect to the server. Check your connection and try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const formBg = isDark ? "#36312a" : "#EDE7D9";

  return (
    <AuthPageWrapper>
      <Card className="shadow-none border-0 bg-transparent rounded-none">
        <CardHeader className="text-center pb-6 pt-10">
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
            <AuthAlert type="error" message={error} />
            <AuthAlert type="success" message={success} />
            {resendSent && !error && (
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
              disabled={loading}
              className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              style={{
                background: brandColors.accent,
                color: "#1a1611",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Verifying…" : "Verify Email"}
              {!loading && (
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
                  style={{ background: formBg }}
                >
                  Didn&apos;t receive it?
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={resendLoading}
              onClick={handleResend}
              className="w-full h-11 border-2 transition-all duration-300 gap-2"
              style={{
                borderColor: brandColors.accent,
                color: isDark ? brandColors.accent : brandColors.accentText,
                opacity: resendLoading ? 0.7 : 1,
              }}
            >
              <RotateCcw className="size-4" />
              {resendLoading ? "Sending…" : "Resend Code"}
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
    </AuthPageWrapper>
  );
}