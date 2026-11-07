import React, { useState } from "react";
import { Alert, Button, Input, Select, SelectItem } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuth } from "../context/useAuth";
import type { SignUpPayload } from "../types/auth";
import axios from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<SignUpPayload>({
    name: "",
    email: "",
    password: "",
    rePassword: "",
    dateOfBirth: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignUpPayload, string>>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*_\-+=[\]{}();:'",.<>/\\|]).{8,}$/;

  const validate = () => {
    const newErrors: Partial<Record<keyof SignUpPayload, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol";
    }

    if (!formData.rePassword) {
      newErrors.rePassword = "Confirm password is required";
    } else if (formData.password !== formData.rePassword) {
      newErrors.rePassword = "Passwords do not match";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignUpPayload]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleGenderChange = (keys: unknown) => {
    const selectedKey = Array.from(keys as Set<string>)[0] as "male" | "female" | undefined;
    setFormData((prev) => ({ ...prev, gender: selectedKey || "" }));
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.signUp({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;

      if (token) {
        // Automatically log in the user and navigate to feed
        login(token, user);
        navigate("/", { replace: true });
      } else {
        // Fallback to signin page with success message
        navigate("/signin", {
          replace: true,
          state: { successMessage: "Account created successfully! Please sign in." },
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        const msg =
          typeof data.errors === "string"
            ? data.errors
            : Array.isArray(data.errors)
            ? data.errors.join(", ")
            : data.message || "Failed to create account. Please check your inputs.";
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
        <div className="grid gap-2 text-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-600">Join Circle to connect and share with your community</p>
        </div>

        {errorMessage && (
          <Alert
            color="danger"
            title={errorMessage}
            variant="faded"
            classNames={{ base: "py-2 text-center text-sm" }}
          />
        )}

        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="bordered"
          type="text"
          label="Full Name"
          placeholder="John Doe"
          isInvalid={!!errors.name}
          errorMessage={errors.name}
          autoComplete="name"
          isRequired
        />

        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          variant="bordered"
          type="email"
          label="Email Address"
          placeholder="john@example.com"
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
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          autoComplete="new-password"
          isRequired
          endContent={
            <button
              className="focus:outline-none text-gray-500 hover:text-gray-700"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="toggle password visibility"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <Input
          name="rePassword"
          value={formData.rePassword}
          onChange={handleChange}
          variant="bordered"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          placeholder="Re-enter your password"
          isInvalid={!!errors.rePassword}
          errorMessage={errors.rePassword}
          autoComplete="new-password"
          isRequired
          endContent={
            <button
              className="focus:outline-none text-gray-500 hover:text-gray-700"
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="toggle confirm password visibility"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            variant="bordered"
            type="date"
            label="Birth Date"
            isInvalid={!!errors.dateOfBirth}
            errorMessage={errors.dateOfBirth}
            isRequired
          />

          <Select
            label="Gender"
            variant="bordered"
            placeholder="Select gender"
            selectedKeys={formData.gender ? [formData.gender] : []}
            onSelectionChange={handleGenderChange}
            isInvalid={!!errors.gender}
            errorMessage={errors.gender}
            isRequired
          >
            <SelectItem key="male">
              Male
            </SelectItem>
            <SelectItem key="female">
              Female
            </SelectItem>
          </Select>
        </div>

        <Button
          isLoading={isLoading}
          color="primary"
          variant="solid"
          type="submit"
          className="w-full font-semibold mt-2 shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-gray-700 mt-2">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Login now
          </Link>
        </p>
      </div>
    </form>
  );
}
