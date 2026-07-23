import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Mail, User, AtSign, CheckCircle2, XCircle } from "lucide-react";
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
import { usePasswordValidation } from "../../hooks/usePasswordValidation";
import { mapRegisterError } from "./authErrorMappers";
import type { RegisterField } from "./authErrorMappers";
import { AuthAlert } from "./AuthAlert";
import { PasswordInput } from "./PasswordInput";
import { PasswordRulesChecklist } from "./PasswordRulesChecklist";

const API_BASE = import.meta.env.VITE_API_URL;

type FieldErrors = Partial<Record<RegisterField, string>>;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegisterForm(
  name: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  isPasswordValid: boolean
): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) errors.name = "Please enter your full name.";
  if (!username.trim()) errors.username = "Please enter a username.";
  if (!email.trim()) errors.email = "Please enter your email address.";
  else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
  if (!password) errors.password = "Please enter a password.";
  else if (!isPasswordValid) errors.password = "Password doesn't meet all the requirements.";
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

function clearFieldError(
  field: RegisterField,
  setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>
) {
  setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
}

function getErrorClassName(hasError?: string): string {
  return hasError ? "border-red-400 focus-visible:ring-red-400" : "";
}

function getConfirmPasswordClassName(
  confirmPassword: string,
  password: string,
  hasError?: string
): string {
  if (hasError) return "border-red-400 focus-visible:ring-red-400";
  if (confirmPassword && confirmPassword === password)
    return "border-green-400 focus-visible:ring-green-400";
  return "";
}

async function submitRegister(
  email: string,
  password: string,
  name: string,
  username: string
): Promise<{
  ok: boolean;
  alreadyExists?: boolean;
  field?: RegisterField;
  errorMessage?: string;
}> {
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
      const isAlreadyExists =
        lower.includes("usernameexists") ||
        lower.includes("already exists") ||
        lower.includes("email already");

      if (isAlreadyExists) return { ok: false, alreadyExists: true };

      const { field, message } = mapRegisterError(raw);
      return { ok: false, field, errorMessage: message };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      field: "general",
      errorMessage: "Could not connect to the server. Is the backend running?",
    };
  }
}

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
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isPasswordValid, shouldShowRules } = usePasswordValidation(password);

  const passwordsMatch = confirmPassword && confirmPassword === password;

  function onFieldChange(
    field: RegisterField,
    setValue: (v: string) => void,
    value: string
  ) {
    setValue(value);
    clearFieldError(field, setFieldErrors);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSuccessMessage("");

    const errors = validateRegisterForm(
      name,
      username,
      email,
      password,
      confirmPassword,
      isPasswordValid
    );

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const result = await submitRegister(email, password, name, username);
    setIsLoading(false);

    if (!result.ok) {
      if (result.alreadyExists) {
        navigate("/verify", { state: { email, name, username } });
        return;
      }
      setFieldErrors({ [result.field!]: result.errorMessage });
      return;
    }

    setSuccessMessage("Check your email for a verification code.");
    navigate("/verify", { state: { email, name, username } });
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
            Create Account
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Sign up to get started with your journey
          </CardDescription>
        </motion.div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-5 px-6">
          <AuthAlert type="error" message={fieldErrors.general ?? ""} />
          <AuthAlert type="success" message={successMessage} />

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => onFieldChange("name", setName, e.target.value)}
                className={`pl-10 h-11 ${getErrorClassName(fieldErrors.name)}`}
              />
            </div>
            <FieldError message={fieldErrors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => onFieldChange("username", setUsername, e.target.value)}
                className={`pl-10 h-11 ${getErrorClassName(fieldErrors.username)}`}
              />
            </div>
            <FieldError message={fieldErrors.username} />
          </div>

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
                onChange={(e) => onFieldChange("email", setEmail, e.target.value)}
                className={`pl-10 h-11 ${getErrorClassName(fieldErrors.email)}`}
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(v) => onFieldChange("password", setPassword, v)}
              className={getErrorClassName(fieldErrors.password)}
            />
            <FieldError message={fieldErrors.password} />
            {shouldShowRules && <PasswordRulesChecklist password={password} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(v) => onFieldChange("confirmPassword", setConfirmPassword, v)}
              className={getConfirmPasswordClassName(
                confirmPassword,
                password,
                fieldErrors.confirmPassword
              )}
            />
            {fieldErrors.confirmPassword ? (
              <FieldError message={fieldErrors.confirmPassword} />
            ) : (
              passwordsMatch && (
                <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "#27ae60" }}>
                  <CheckCircle2 className="size-3.5" /> Passwords match
                </p>
              )
            )}
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
            {isLoading ? "Creating account…" : "Create Account"}
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