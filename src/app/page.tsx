"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useAuth } from "@/src/hooks/useAuth";
import { useUserSettings } from "@/src/hooks/useUserSettings";
import {
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Shield,
  Download,
  Smartphone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  DollarSign,
  CreditCard,
  Zap,
  Star,
  Users,
  Globe,
} from "lucide-react";

export default function Homepage() {
  const { user, loading } = useAuth();
  const { formatCurrency } = useUserSettings();
  const router = useRouter();
  const [showTestCredentials, setShowTestCredentials] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/overview");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      title: "Transaction Management",
      description:
        "Track income and expenses with detailed categorization and smart filtering.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Visual Analytics",
      description:
        "Beautiful charts and graphs to visualize your spending patterns and trends.",
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Budget Goals",
      description:
        "Set spending limits and get alerts when you're approaching your budget.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Private",
      description:
        "Your financial data is encrypted and stored securely with Firebase.",
    },
    {
      icon: <Download className="h-8 w-8 text-indigo-600" />,
      title: "Import & Export",
      description:
        "Easily import existing data or export your transactions as CSV files.",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-pink-600" />,
      title: "Mobile Responsive",
      description:
        "Access your finances anywhere with our fully responsive design.",
    },
  ];

  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: "10K+",
      label: "Active Users",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      value: "$2M+",
      label: "Tracked",
    },
    { icon: <Globe className="h-6 w-6" />, value: "50+", label: "Countries" },
    { icon: <Star className="h-6 w-6" />, value: "4.9", label: "Rating" },
  ];

  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                  MintFlux
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              New: CSV Import/Export Feature
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white">
              Take Control of Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              Track expenses, set budgets, and visualize your financial journey
              with our comprehensive personal finance management platform.
            </p>

            {/* Test Credentials Alert */}
            <div className="mx-auto mb-8 max-w-md">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Try Demo Account
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTestCredentials(!showTestCredentials)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showTestCredentials ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {showTestCredentials && (
                  <AlertDescription className="mt-2 text-blue-700 dark:text-blue-300">
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Email:</strong> demo@financetracker.com
                      </div>
                      <div>
                        <strong>Password:</strong> demo123456
                      </div>
                    </div>
                  </AlertDescription>
                )}
              </Alert>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 h-20 w-20 animate-pulse rounded-full bg-blue-200 opacity-20 dark:bg-blue-800"></div>
        <div className="absolute top-40 right-20 h-16 w-16 animate-pulse rounded-full bg-purple-200 opacity-20 delay-1000 dark:bg-purple-800"></div>
        <div className="absolute bottom-20 left-1/4 h-12 w-12 animate-pulse rounded-full bg-green-200 opacity-20 delay-2000 dark:bg-green-800"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/50 py-16 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 p-2 dark:from-blue-900 dark:to-purple-900">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Everything You Need to Manage Your Finances
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed to help you understand and control your
              financial life.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800/80"
              >
                <CardHeader>
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Beautiful Dashboard Experience
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-blue-100">
              Get insights at a glance with our intuitive dashboard design.
            </p>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Income</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(5240)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-200" />
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Total Expenses</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(3180)}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-red-200" />
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Net Worth</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(2060)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                  <h3 className="mb-4 flex items-center font-semibold">
                    <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                    Expense Categories
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dining</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(680)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transportation</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(420)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Shopping</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(350)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                  <h3 className="mb-4 flex items-center font-semibold">
                    <Target className="mr-2 h-5 w-5 text-green-600" />
                    Budget Progress
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Dining Budget</span>
                        <span>68%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: "68%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Transport Budget</span>
                        <span>84%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: "84%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Join thousands of users who have transformed their financial lives
            with our platform.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In to Your Account
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Free 30-day trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              MintFlux
            </h3>
            <p className="mb-6 text-gray-400">
              Empowering you to make better financial decisions.
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/login"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
