import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Lock,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle2,
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

function mapResetError(raw: string): string {
  const msg = raw.toLowerCase();
  if (
    msg.includes("codemismatch") ||
    msg.includes("invalid verification code") ||
    msg.includes("invalid code")
  )
    return "Incorrect verification code. Please check your email and try again.";
  if (
    msg.includes("expiredcode") ||
    msg.includes("code has expired") ||
    msg.includes("expired")
  )
    return "This code has expired. Please go back and request a new one.";
  if (
    msg.includes("toomanyrequests") ||
    msg.includes("too many") ||
    msg.includes("limit exceeded")
  )
    return "Too many attempts. Please wait a moment and try again.";
  if (
    msg.includes("invalidpassword") ||
    msg.includes("password did not conform")
  )
    return "New password doesn't meet the requirements. Use at least 8 characters with uppercase, lowercase, a number, and a special character.";
  if (msg.includes("invalidparameter"))
    return "Please check your code and new password and try again.";
  return raw;
}

const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter (A–Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "One lowercase letter (a–z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(newPassword));
  const showRules = passwordFocused || (newPassword.length > 0 && !passwordValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordValid) {
      setError("New password doesn't meet all the requirements below.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your new password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          mapResetError(data.message || data.error || "Password reset failed.")
        );
        return;
      }

      setSuccess("Password reset successfully! Redirecting to sign in…");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError(
        "Could not connect to the server. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageWrapper>
      <Card className="shadow-none border-0 bg-transparent rounded-none">
        <CardHeader className="text-center pb-6 pt-10">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(213,160,33,0.15)" }}
            >
              <KeyRound className="size-7" style={{ color: brandColors.accent }} />
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
            <AuthAlert type="error" message={error} />
            <AuthAlert type="success" message={success} />

            {/* Verification code */}
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

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="pl-10 pr-12 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {/* Password rules checklist */}
              {showRules && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 space-y-1 text-xs pl-1"
                >
                  {PASSWORD_RULES.map((rule) => {
                    const passing = rule.test(newPassword);
                    return (
                      <li key={rule.id} className="flex items-center gap-1.5">
                        {passing ? (
                          <CheckCircle2
                            className="size-3.5 shrink-0"
                            style={{ color: "#27ae60" }}
                          />
                        ) : (
                          <XCircle className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          style={{ color: passing ? "#27ae60" : undefined }}
                          className={passing ? "" : "text-muted-foreground"}
                        >
                          {rule.label}
                        </span>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </div>

            {/* Confirm new password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-12 h-11 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-400 focus-visible:ring-red-400"
                      : confirmPassword && confirmPassword === newPassword
                      ? "border-green-400 focus-visible:ring-green-400"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="size-3.5" /> Passwords do not match
                </p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
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
              disabled={loading}
              className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              style={{
                background: brandColors.accent,
                color: "#1a1611",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Resetting…" : "Set New Password"}
              {!loading && (
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
    </AuthPageWrapper>
  );
}
