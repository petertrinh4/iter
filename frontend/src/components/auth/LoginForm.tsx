import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
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
import { mapLoginError } from "./authErrorMappers";
import { AuthAlert } from "./AuthAlert";
import { PasswordInput } from "./PasswordInput";

const API_BASE = import.meta.env.VITE_API_URL;

async function submitLogin(
  email: string,
  password: string
): Promise<{ ok: boolean; idToken?: string; accessToken?: string; errorMessage?: string }> {
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

      if (
        lower.includes("not confirmed") ||
        lower.includes("invalid credentials or user not confirmed")
      ) {
        return {
          ok: false,
          errorMessage:
            "Incorrect email or password. If you haven't verified your email yet, check your inbox for a verification code.",
        };
      }

      return { ok: false, errorMessage: mapLoginError("", raw) };
    }

    return { ok: true, idToken: data.idToken, accessToken: data.accessToken };
  } catch {
    return {
      ok: false,
      errorMessage:
        "Could not connect to the server. Check your connection and try again.",
    };
  }
}

function storeAuthTokens(idToken: string, accessToken: string) {
  localStorage.setItem("idToken", idToken);
  localStorage.setItem("accessToken", accessToken);
}

export function LoginForm() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = await submitLogin(email, password);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? "Login failed.");
      return;
    }

    storeAuthTokens(result.idToken!, result.accessToken!);
    navigate("/home");
  }

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
          <AuthAlert type="error" message={errorMessage} />

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
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
            />
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
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{
              background: brandColors.accent,
              color: "#1a1611",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Signing in…" : "Sign In"}
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