import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("idToken");

    // No token at all — send to login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      // Decode the JWT payload (second segment)
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

      const exp = payload["exp"] as number | undefined;

      if (!exp) {
        // Can't verify expiry — treat as expired to be safe
        localStorage.removeItem("idToken");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
        return;
      }

      const nowSeconds = Math.floor(Date.now() / 1000);

      if (nowSeconds >= exp) {
        // Token is expired — clear storage and redirect
        localStorage.removeItem("idToken");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
      }
    } catch {
      // Malformed token — clear and redirect
      localStorage.removeItem("idToken");
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    }
  }, [navigate]);
}
