import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button, Input } from "../components/common";
import loginBg from "../assets/background.png";
import AInoteLogo from "../assets/AInote-logo.svg";
import { forgotPassword } from "../services/auth.service";
import { getApiErrorMessage } from "../utils/api-error";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      await forgotPassword(email);

      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", getApiErrorMessage(error));
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <div className="flex min-h-screen items-center justify-center bg-black/10 p-4 sm:p-5 lg:px-16">
        <img
          src={AInoteLogo}
          alt="NoteMind"
          className="h-14 w-auto"
          style={{ position: "absolute", top: "16px", right: "24px" }}
        />

        <div className="w-full max-w-lg rounded-3xl bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="mb-8 flex justify-center">
            <img src={AInoteLogo} alt="NoteMind" className="h-24 w-auto" />
          </div>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Forgot Password?
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Enter your email address and we'll send you a password reset
                  link.
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                If an account exists with this email, we've sent you a password
                reset link.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Please check your inbox and follow the link to reset your
                password.
              </p>

              <Link
                to="/"
                className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
