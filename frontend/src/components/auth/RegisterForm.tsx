import { Link } from "react-router";
import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Lock, Mail, User, AtSign, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
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

const API_BASE = import.meta.env.VITE_API_URL;

const PASSWORD_RULES = [
  { id: "length",  label: "At least 8 characters",        test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A–Z)",    test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter (a–z)",    test: (p: string) => /[a-z]/.test(p) },
  { id: "number",  label: "One number (0–9)",              test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type FieldErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

function mapBackendError(raw: string): { field: keyof FieldErrors; message: string } {
  const msg = raw.toLowerCase();
  if (msg.includes("usernameexists") || msg.includes("already exists") || msg.includes("email already"))
    return { field: "email", message: "An account with this email already exists." };
  if (msg.includes("invalidpassword") || msg.includes("password did not conform"))
    return { field: "password", message: "Password doesn't meet the requirements." };
  if (msg.includes("invalidparameter") && msg.includes("email"))
    return { field: "email", message: "Please enter a valid email address." };
  if (msg.includes("toomanyrequests") || msg.includes("too many"))
    return { field: "general", message: "Too many attempts. Please wait a moment and try again." };
  return { field: "general", message: raw };
}

// Small inline error shown below a field
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
      <XCircle className="size-3.5 shrink-0" /> {message}
    </p>
  );
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
  const showRules = password.length > 0 && !passwordValid;

  // Clear a specific field error when the user starts editing that field
  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccess("");

    // Client-side validation — set errors on specific fields
    const errors: FieldErrors = {};
    if (!name.trim())              errors.name = "Please enter your full name.";
    if (!username.trim())          errors.username = "Please enter a username.";
    if (!email.trim())             errors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
    if (!password)                 errors.password = "Please enter a password.";
    else if (!passwordValid)       errors.password = "Password doesn't meet all the requirements.";
    if (!confirmPassword)          errors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        const raw = data.error || data.message || "Registration failed.";
        const lower = raw.toLowerCase();

        // Unconfirmed account — send to verify
        if (
          lower.includes("usernameexists") ||
          lower.includes("already exists") ||
          lower.includes("email already")
        ) {
          navigate("/verify", { state: { email, name, username } });
          return;
        }

        const { field, message } = mapBackendError(raw);
        setFieldErrors({ [field]: message });
      } else {
        setSuccess("Check your email for a verification code.");
        navigate("/verify", { state: { email, name, username } });
      }
    } catch {
      setFieldErrors({ general: "Could not connect to the server. Is the backend running?" });
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
            Create Account
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Sign up to get started with your journey
          </CardDescription>
        </motion.div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-5 px-6">

          {/* General error banner (network, too many attempts, etc.) */}
          {fieldErrors.general && (
            <div
              className="rounded-lg px-4 py-2.5 text-sm border flex items-start gap-2"
              style={{
                background: "rgba(192,57,43,0.1)",
                borderColor: "rgba(192,57,43,0.3)",
                color: "#c0392b",
              }}
            >
              <XCircle className="size-4 mt-0.5 shrink-0" />
              {fieldErrors.general}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div
              className="rounded-lg px-4 py-2.5 text-sm border flex items-start gap-2"
              style={{
                background: "rgba(39,174,96,0.1)",
                borderColor: "rgba(39,174,96,0.3)",
                color: "#27ae60",
              }}
            >
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              {success}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                className={`pl-10 h-11 ${fieldErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
            </div>
            <FieldError message={fieldErrors.name} />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearFieldError("username"); }}
                className={`pl-10 h-11 ${fieldErrors.username ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
            </div>
            <FieldError message={fieldErrors.username} />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="text"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                className={`pl-10 h-11 ${fieldErrors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                className={`pl-10 pr-12 h-11 ${fieldErrors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
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
            <FieldError message={fieldErrors.password} />

            {/* Password rules checklist */}
            {showRules && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 space-y-1 text-xs pl-1"
              >
                {PASSWORD_RULES.map((rule) => {
                  const passing = rule.test(password);
                  return (
                    <li key={rule.id} className="flex items-center gap-1.5">
                      {passing
                        ? <CheckCircle2 className="size-3.5 shrink-0" style={{ color: "#27ae60" }} />
                        : <XCircle className="size-3.5 shrink-0 text-muted-foreground" />
                      }
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                className={`pl-10 pr-12 h-11 ${
                  fieldErrors.confirmPassword
                    ? "border-red-400 focus-visible:ring-red-400"
                    : confirmPassword && confirmPassword === password
                    ? "border-green-400 focus-visible:ring-green-400"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword
              ? <FieldError message={fieldErrors.confirmPassword} />
              : confirmPassword && confirmPassword === password && (
                  <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#27ae60" }}>
                    <CheckCircle2 className="size-3.5" /> Passwords match
                  </p>
                )
            }
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-6 pt-6 pb-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{ background: brandColors.accent, color: "#1a1611", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account…" : "Create Account"}
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
                Already have an account?
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
            <Link to="/login">Sign In</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}