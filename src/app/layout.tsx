import type { Metadata } from "next";
import { Barlow, Geist_Mono, Butcherman } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { THEME_STORAGE_KEY } from "@/lib/themePresets";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const butcherman = Butcherman({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chamber Seven",
  description:
    "A tense two-player shotgun duel of hidden shells and dirty tricks — an original online game for the browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${geistMono.variable} ${butcherman.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t)document.documentElement.dataset.theme=t;}catch(e){}`}
        </Script>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
