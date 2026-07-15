import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, KeyRound, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { brandColors } from "../constants/marketing";
import { useTheme } from "../hooks/use-theme";

const API_BASE = import.meta.env.VITE_API_URL;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
        setError(data.message || "Password reset failed.");
        return;
      }

      setSuccess("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isDark ? "#231f19" : "#d8d0c0";
  const formBg = isDark ? "#36312a" : "#EDE7D9";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500"
      style={{ background: pageBg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: formBg }}
      >
        <Card className="shadow-none border-0 bg-transparent rounded-none">
          <CardHeader className="text-center pb-6 pt-10">
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
              style={{ color: isDark ? brandColors.accent : brandColors.accentText }}
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
              {error && (
                <div
                  className="rounded-lg px-4 py-2.5 text-sm border"
                  style={{
                    background: "rgba(192,57,43,0.1)",
                    borderColor: "rgba(192,57,43,0.3)",
                    color: "#c0392b",
                  }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="rounded-lg px-4 py-2.5 text-sm border"
                  style={{
                    background: "rgba(39,174,96,0.1)",
                    borderColor: "rgba(39,174,96,0.3)",
                    color: "#27ae60",
                  }}
                >
                  {success}
                </div>
              )}

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
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
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
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
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
                  color: brandColors.dark,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Resetting..." : "Set New Password"}
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
      </motion.div>
    </div>
  );
}
