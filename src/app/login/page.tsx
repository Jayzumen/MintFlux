"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { signIn } from "@/src/lib/auth";
import { TEST_USER } from "@/src/lib/auth";
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/overview");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    const { user, error } = await signIn(data.email, data.password);

    if (error) {
      setError(error);
    } else if (user) {
      router.push("/dashboard/overview");
    }

    setIsLoading(false);
  };

  const fillTestCredentials = () => {
    setValue("email", TEST_USER.email);
    setValue("password", TEST_USER.password);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-950 dark:to-purple-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to your MintFlux account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Try the demo account</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillTestCredentials}
                    className="border-blue-300 text-blue-600 hover:bg-blue-100"
                  >
                    Use Demo Login
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Back to Home
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
