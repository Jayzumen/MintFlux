"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  BarChart3,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { signOut } from "@/src/lib/auth";
import { useAuth } from "@/src/hooks/useAuth";
import { cn } from "@/src/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: Home },
  { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { name: "Charts", href: "/dashboard/charts", icon: BarChart3 },
  { name: "Budget Goals", href: "/dashboard/budget", icon: Target },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-border fixed inset-y-0 left-0 z-40 w-64 transform border-r transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-border border-b p-6">
            <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              MintFlux
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome, {user?.email}
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="border-border border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-30 bg-gray-100 md:hidden dark:bg-gray-900"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
