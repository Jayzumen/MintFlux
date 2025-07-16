"use client";

import { useTheme } from "@/src/hooks/useTheme";
import { Button } from "@/src/components/ui/button";
import { Moon, Sun } from "lucide-react";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme}>
      {children}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="fixed right-4 bottom-4 z-50"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
