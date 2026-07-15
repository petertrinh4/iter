import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, ArrowRight, Lock } from "lucide-react";
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

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to send reset code");
        return;
      }

      navigate("/reset-password", { state: { email } });
    } catch {
      setError("Could not connect to server");
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
                <Lock className="size-7" style={{ color: brandColors.accent }} />
              </div>
            </div>
            <CardTitle
              className="text-3xl font-bold"
              style={{ color: isDark ? brandColors.accent : brandColors.accentText }}
            >
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your email and we'll send you a reset code
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

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
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
                  color: brandColors.dark,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Sending..." : "Send Reset Code"}
                {!loading && (
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:underline transition-colors"
              >
                Back to Sign In
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
