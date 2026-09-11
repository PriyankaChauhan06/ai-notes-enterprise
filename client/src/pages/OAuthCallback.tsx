import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  const { completeOAuthLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    async function handleOAuthLogin() {
      try {
        token && (await completeOAuthLogin(token));

        navigate("/dashboard", {
          replace: true,
        });
      } catch (error) {
        console.error("Google login failed:", error);

        navigate("/", {
          replace: true,
          state: {
            message: "Google login failed. Please try again.",
          },
        });
      }
    }

    handleOAuthLogin();
  }, [location.search, completeOAuthLogin, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Signing you in...</p>
    </div>
  );
}
