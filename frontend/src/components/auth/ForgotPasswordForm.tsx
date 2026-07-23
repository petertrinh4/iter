import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowRight, Lock } from "lucide-react";
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
import { mapForgotPasswordError } from "./authErrorMappers";
import { AuthAlert } from "./AuthAlert";

const API_BASE = import.meta.env.VITE_API_URL;

async function submitForgotPassword(
  email: string
): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        errorMessage: mapForgotPasswordError(
          data.message || data.error || "Unable to send reset code."
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

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = await submitForgotPassword(email);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMessage(result.errorMessage ?? "Unable to send reset code.");
      return;
    }

    navigate("/reset-password", { state: { email } });
  }

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none w-full">
        <CardHeader className="text-center pb-4 pt-6">
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
            style={{
              color: isDark ? brandColors.accent : brandColors.accentText,
            }}
          >
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your email and we'll send you a reset code
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-5 px-8">
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
              {isLoading ? "Sending…" : "Send Reset Code"}
              {!isLoading && (
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
  );
}