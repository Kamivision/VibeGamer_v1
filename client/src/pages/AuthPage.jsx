import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { keepSession } from "../utilities";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { setUser } = useOutletContext();
  const navigate = useNavigate();

  function handleAuthSuccess(authenticatedUser) {
    setUser(authenticatedUser);
    navigate("/");
  }

  function toggleForm() {
    setIsSignUp((current) => !current);
  }

  async function handleGitHubLogin() {
    try {
      const frontendRedirectUri = `${window.location.origin}/auth`;
      const response = await fetch(
        `/api/v1/users/github/login/?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`
      );

      if (!response.ok) {
        console.error("GitHub login could not start.");
        return;
      }

      const data = await response.json();
      window.location.href = data.redirect_url;
    } catch (error) {
      console.error("GitHub login failed:", error);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const username = params.get("username") || params.get("steam_username") || "OAuth User";
      const email = params.get("email") || "";

      keepSession(token);
      setUser({ username, email });
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/");
    }
  }, [navigate, setUser]); 
      

  return (
    <div className="mx-auto max-w-md py-8 min-h-screen flex flex-col justify-center">
      <AuthForm
      mode={isSignUp ? "signup" : "signin"} 
      onAuthSuccess={handleAuthSuccess} 
      />

      <button type="button" onClick={toggleForm} className="mt-4 text-sm underline">
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </button>
      <p className="my-4 text-center text-gray-600">or</p>
      <button
        type="button"
        onClick={handleGitHubLogin}
        className="w-full rounded bg-gray-900 px-4 py-2 text-white font-semibold transition-opacity hover:opacity-90"
      >
        Sign In with GitHub
      </button>
    </div>
  );
}
