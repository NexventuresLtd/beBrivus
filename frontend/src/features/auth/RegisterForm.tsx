import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardBody } from "../../components/ui";

const schema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  password_confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  user_type: yup.string().required("Please select your role"),
});

type RegisterFormData = yup.InferType<typeof schema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await registerUser(data);

      // Check if onboarding is needed
      if (response.needs_onboarding && response.onboarding_type === "mentor") {
        navigate("/mentor/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Registration failed. Please try again."
      );
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
              <div className="mx-auto my-4 rounded-lg flex items-center justify-center mb-4">
                <img
                  className="max-w-20"
                  src="/beBivus.png"
                  alt="beBrivus Logo"
                />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">
                Join beBrivus
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Sign in
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  {...register("first_name")}
                  error={errors.first_name?.message}
                  placeholder="First name"
                />
                <Input
                  label="Last name"
                  {...register("last_name")}
                  error={errors.last_name?.message}
                  placeholder="Last name"
                />
              </div>

              <Input
                label="Username"
                {...register("username")}
                error={errors.username?.message}
                placeholder="Choose a username"
              />

              <Input
                label="Email address"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="Enter your email"
              />

              <div className="space-y-1">
                <label className="label">I am a</label>
                <select {...register("user_type")} className="input">
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="graduate">Graduate</option>
                  <option value="mentor">Mentor</option>
                  <option value="institution">Institution</option>
                </select>
                {errors.user_type && (
                  <p className="text-sm text-error-600">
                    {errors.user_type.message}
                  </p>
                )}
              </div>

              <Input
                label="Password"
                type="password"
                {...register("password")}
                error={errors.password?.message}
                placeholder="Create a password"
              />

              <Input
                label="Confirm password"
                type="password"
                {...register("password_confirm")}
                error={errors.password_confirm?.message}
                placeholder="Confirm your password"
              />

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label
                  htmlFor="agree-terms"
                  className="ml-2 block text-sm text-secondary-900"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create account
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
