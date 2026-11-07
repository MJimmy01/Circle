import React, { useState } from "react";
import { Alert, Button, Input } from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuth } from "../context/useAuth";
import axios from "axios";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.successMessage as string | undefined;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.signIn({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;

      if (token) {
        login(token, user);
        navigate("/", { replace: true });
      } else {
        setErrorMessage(response.message || "Sign in failed. Please try again.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        const msg =
          typeof data.errors === "string"
            ? data.errors
            : Array.isArray(data.errors)
            ? data.errors.join(", ")
            : data.message || "Invalid email or password";
        setErrorMessage(msg);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2 text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-600">Sign in to continue your journey on Circle</p>
        </div>

        {successMessage && (
          <Alert
            color="success"
            title={successMessage}
            variant="faded"
            classNames={{ base: "py-2 text-center" }}
          />
        )}

        {errorMessage && (
          <Alert
            color="danger"
            title={errorMessage}
            variant="faded"
            classNames={{ base: "py-2 text-center text-sm" }}
          />
        )}

        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          variant="bordered"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          isInvalid={!!errors.email}
          errorMessage={errors.email}
          autoComplete="email"
          isRequired
        />

        <Input
          name="password"
          value={formData.password}
          onChange={handleChange}
          variant="bordered"
          type={isVisible ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          autoComplete="current-password"
          isRequired
          endContent={
            <button
              className="focus:outline-none text-gray-500 hover:text-gray-700"
              type="button"
              onClick={toggleVisibility}
              aria-label="toggle password visibility"
            >
              {isVisible ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          }
        />

        <Button
          isLoading={isLoading}
          color="primary"
          variant="solid"
          type="submit"
          className="w-full font-semibold mt-2 shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-gray-700 mt-2">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
