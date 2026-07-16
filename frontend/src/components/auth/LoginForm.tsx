import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Lock, Mail, Eye, EyeOff, XCircle } from "lucide-react";
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
import { useNavigate } from "react-router";

function mapLoginError(code: string, message: string): string {
  if (code === "NotAuthorizedException" || message.includes("incorrect username or password"))
    return "Incorrect email or password. Please try again.";
  if (code === "UserNotFoundException" || message.includes("user does not exist"))
    return "No account found with this email. Did you mean to sign up?";
  if (message.includes("toomanyrequests") || message.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  return "Login failed. Please try again.";
}

export function LoginForm() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const raw = data.message || data.error || "Login failed.";
        const lower = raw.toLowerCase();

        // Backend returns same message for wrong password and unconfirmed account
        // Until backend distinguishes them, show a neutral message covering both
        if (lower.includes("not confirmed") || lower.includes("invalid credentials or user not confirmed")) {
          setError("Incorrect email or password. If you haven't verified your email yet, check your inbox for a verification code.");
          return;
        }

        setError(mapLoginError(raw));
        return;
      }

      // 🔥 STORE TOKEN (important)
      localStorage.setItem("idToken", data.idToken);
      localStorage.setItem("accessToken", data.accessToken);

      console.log("Login success:", data);

      navigate("/home");
    } catch (_err) {
      setError("Could not connect to the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const formBg = isDark ? "#36312a" : "#EDE7D9";

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none w-full">
      <CardHeader className="text-center pb-8 pt-2">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle
            className="text-3xl font-bold"
            style={{ color: isDark ? brandColors.accent : brandColors.accentText }}
          >
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your credentials to access your account
          </CardDescription>
        </motion.div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6 px-6">
          {error && (
            <div
              className="rounded-lg px-4 py-2.5 text-sm border flex items-start gap-2"
              style={{
                background: "rgba(192,57,43,0.1)",
                borderColor: "rgba(192,57,43,0.3)",
                color: "#c0392b",
              }}
            >
              <XCircle className="size-4 mt-0.5 shrink-0" />
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm hover:underline transition-colors"
              style={{ color: isDark ? brandColors.accent : brandColors.accentText }}
            >
              Forgot password?
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-6 pt-6 pb-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{ background: brandColors.accent, color: "#1a1611", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In"}
            {!loading && <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />}
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
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-2 transition-all duration-300"
            style={{
              borderColor: brandColors.accent,
              color: isDark ? brandColors.accent : brandColors.accentText,
            }}
            asChild
          >
            <Link to="/register">Sign Up</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}