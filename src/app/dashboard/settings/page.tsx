"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { AuthGuard } from "@/src/components/AuthGuard";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/hooks/useTheme";
import { useToast } from "@/src/hooks/use-toast";
import { User, Moon, Sun, Save } from "lucide-react";
import { saveUserSettings, getUserSettings } from "@/src/lib/settings";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsFetching] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    if (!user) return;
    setIsFetching(true);
    getUserSettings(user.uid).then((settings) => {
      if (settings) {
        setDisplayName(settings.displayName || "");
        setCurrency(settings.preferences.currency || "USD");
        setDateFormat(settings.preferences.dateFormat || "MM/DD/YYYY");
        if (
          settings.preferences.theme &&
          settings.preferences.theme !== theme
        ) {
          setLocalTheme(settings.preferences.theme);
          if (settings.preferences.theme !== theme) {
            toggleTheme();
          }
        }
      } else {
        setDisplayName(user.displayName || "");
      }
      setIsFetching(false);
    });
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsLoading(true);

    const settings = {
      displayName,
      preferences: {
        theme: localTheme,
        currency,
        dateFormat,
      },
    };
    const { error } = await saveUserSettings(user.uid, settings);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
    }
    setIsLoading(false);
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="ml-0 flex-1 p-6 md:ml-64">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage your account and preferences
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {theme === "light" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-gray-500">
                        Choose your preferred theme
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocalTheme(
                          localTheme === "light" ? "dark" : "light",
                        );
                        toggleTheme();
                      }}
                      className="flex items-center gap-2"
                    >
                      {localTheme === "light" ? (
                        <>
                          <Moon className="h-4 w-4" />
                          Dark
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4" />
                          Light
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="Currency code"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Input
                      id="dateFormat"
                      type="text"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      placeholder="Date format"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
