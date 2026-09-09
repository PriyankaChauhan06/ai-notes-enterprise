import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Input } from "../components/common";
import loginBg from "../assets/background.png";
import AInoteLogo from "../assets/AInote-logo.svg";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <div className="flex min-h-screen items-center justify-center bg-black/10 p-4 sm:p-6 lg:px-16">
        <img
          src={AInoteLogo}
          alt="NoteMind"
          className="h-14 w-auto"
          style={{ position: "absolute", top: "16px", right: "24px" }}
        />

        <div className="w-full max-w-lg rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src={AInoteLogo} alt="NoteMind" className="h-24 w-auto" />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to your notes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-9 rounded-md px-2 py-1 text-sm text-gray-500 hover:text-gray-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-sm text-gray-400">OR</span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social buttons - UI only */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Google
            </button>

            <button
              type="button"
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              GitHub
            </button>
          </div>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
