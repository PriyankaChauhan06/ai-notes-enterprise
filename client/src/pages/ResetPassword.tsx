import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button, Input } from "../components/common";
import loginBg from "../assets/background.png";
import AInoteLogo from "../assets/AInote-logo.svg";
import { resetPassword } from "../services/auth.service";
import { getApiErrorMessage } from "../utils/api-error";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      toast.success("Password reset successfully.");

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Reset password error:", getApiErrorMessage(error));
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
          style={{
            position: "absolute",
            top: "16px",
            right: "24px",
          }}
        />

        <div className="w-full max-w-lg rounded-3xl bg-white/95 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="mb-8 flex justify-center">
            <img src={AInoteLogo} alt="NoteMind" className="h-24 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter your new password below.
            </p>
          </div>

          {!token ? (
            <div>
              <p className="text-sm text-red-600">
                This password reset link is invalid or missing.
              </p>

              <Link
                to="/forgot-password"
                className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
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

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-9 rounded-md px-2 py-1 text-sm text-gray-500 hover:text-gray-900"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
