export function mapResetPasswordError(raw: string): string {
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

export function mapVerifyError(raw: string): string {
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
  if (msg.includes("notauthorized") || msg.includes("already confirmed"))
    return "This account is already verified. Try signing in.";
  return raw;
}

export function mapResendCodeError(raw: string): string {
  const msg = raw.toLowerCase();
  if (
    msg.includes("toomanyrequests") ||
    msg.includes("too many") ||
    msg.includes("limit exceeded")
  )
    return "Too many resend attempts. Please wait a moment and try again.";
  if (msg.includes("usernotfound") || msg.includes("user does not exist"))
    return "No account found with this email.";
  if (msg.includes("notauthorized") || msg.includes("already confirmed"))
    return "This account is already verified. Try signing in.";
  return raw;
}

export function mapForgotPasswordError(raw: string): string {
  const msg = raw.toLowerCase();
  if (
    msg.includes("usernotfound") ||
    msg.includes("user does not exist") ||
    msg.includes("username/client id combination")
  )
    return "No account found with this email address.";
  if (
    msg.includes("toomanyrequests") ||
    msg.includes("too many") ||
    msg.includes("limit exceeded")
  )
    return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("invalidparameter") || msg.includes("invalid email"))
    return "Please enter a valid email address.";
  return raw;
}

export function mapLoginError(code: string, message: string): string {
  if (
    code === "NotAuthorizedException" ||
    message.includes("incorrect username or password")
  )
    return "Incorrect email or password. Please try again.";
  if (
    code === "UserNotFoundException" ||
    message.includes("user does not exist")
  )
    return "No account found with this email. Did you mean to sign up?";
  if (
    message.includes("toomanyrequests") ||
    message.includes("too many")
  )
    return "Too many attempts. Please wait a moment and try again.";
  return "Login failed. Please try again.";
}

export type RegisterField =
  | "name"
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "general";

export function mapRegisterError(
  raw: string
): { field: RegisterField; message: string } {
  const msg = raw.toLowerCase();
  if (
    msg.includes("usernameexists") ||
    msg.includes("already exists") ||
    msg.includes("email already")
  )
    return { field: "email", message: "An account with this email already exists." };
  if (msg.includes("invalidpassword") || msg.includes("password did not conform"))
    return { field: "password", message: "Password doesn't meet the requirements." };
  if (msg.includes("invalidparameter") && msg.includes("email"))
    return { field: "email", message: "Please enter a valid email address." };
  if (msg.includes("toomanyrequests") || msg.includes("too many"))
    return { field: "general", message: "Too many attempts. Please wait a moment and try again." };
  return { field: "general", message: raw };
}