import type { Metadata } from "next";
import { Oswald, Geist_Mono, Butcherman } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  THEME_STORAGE_KEY,
  CUSTOM_BG_STORAGE_KEY,
  BG_STYLE_STORAGE_KEY,
  DEFAULT_BG_STYLE_ID,
  DEFAULT_THEME_ID,
} from "@/lib/themePresets";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const butcherman = Butcherman({
  variable: "--font-butcherman",
  weight: "400",
  subsets: ["latin"],
});

const SITE_URL = "https://chamber-seven-omega.vercel.app";
const SITE_TITLE = "Chamber Seven — Multiplayer Shotgun Duel";
const SITE_DESCRIPTION =
  "A browser multiplayer shotgun-duel game — up to four players share one gun loaded with hidden live and blank shells, plus dirty-trick items.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Chamber Seven",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${geistMono.variable} ${butcherman.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{
            var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
            if(t)document.documentElement.dataset.theme=t;
            var b=localStorage.getItem(${JSON.stringify(CUSTOM_BG_STORAGE_KEY)});
            var s=localStorage.getItem(${JSON.stringify(BG_STYLE_STORAGE_KEY)});
            if(b){
              document.documentElement.style.setProperty("--bg-image","url(\\""+b+"\\")");
            }else if(s&&s!==${JSON.stringify(DEFAULT_BG_STYLE_ID)}){
              var themeId=t||${JSON.stringify(DEFAULT_THEME_ID)};
              document.documentElement.style.setProperty("--bg-image","url(\\"/backgrounds/bg-"+themeId+"-"+s+".png\\")");
            }
          }catch(e){}`}
        </Script>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
