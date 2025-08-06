import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import { UserSettingsProvider } from "@/src/components/UserSettingsProvider";
import { Toaster } from "@/src/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MintFlux",
  description: "Track your finances with ease on MintFlux",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <UserSettingsProvider>
            <div className="flex min-h-screen">{children}</div>
            <Toaster />
          </UserSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
