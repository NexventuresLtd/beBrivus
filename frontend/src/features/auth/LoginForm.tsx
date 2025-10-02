import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardBody } from "../../components/ui";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await login(data.email, data.password);

      // Check if onboarding is needed
      if (response.needs_onboarding && response.onboarding_type === "mentor") {
        navigate("/mentor/onboarding");
      } else {
        // Redirect based on user type
        if (response.user?.user_type === "mentor") {
          navigate("/mentor-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">
                Sign in to beBrivus
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                  <p className="text-error-600 text-sm">{error}</p>
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="Enter your email"
              />

              <Input
                label="Password"
                type="password"
                {...register("password")}
                error={errors.password?.message}
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-secondary-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sign in
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
