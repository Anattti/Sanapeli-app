import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Opi englantia emojeilla | Learn English with Emojis",
  description: "Hauska ja interaktiivinen englannin sanaston oppimispeli emojeilla. A fun and interactive English vocabulary learning game with emojis.",
  applicationName: "Oppimis App",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Oppimis App",
  },
  themeColor: "#1D4ED8",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1D4ED8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${poppins.variable} antialiased font-sans`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
