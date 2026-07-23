export function getUserInfoFromToken() {
  const token = localStorage.getItem("idToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return {
      username: payload["preferred_username"] ?? payload["email"] ?? "User",
      memberSince: payload["iat"]
        ? new Date(payload["iat"] * 1000).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "",
    };
  } catch {
    console.error("Could not decode idToken");
    return null;
  }
}