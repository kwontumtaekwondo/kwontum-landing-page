import "./globals.css";
import type { Metadata } from "next";
import type React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  title: "Kwontum Taekwondo",
  description:
    "Welcome to our Kwontum Taekwondo - Discover the Art of Korean Martial Arts",
  icons: {
    icon: [{ url: "/img/favicon.ico", sizes: "any" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <GoogleAnalytics /> {/* ✅ Add this line here */}
        {/* <ThemeProvider attribute="class" defaultTheme="light"> */}
        <div className="relative max-w-screen-xl mx-auto sm:px-6 lg:px-8">
          <Header />
        </div>
        <main className="relative flex-grow font-nanum">
          {children}
        </main>
        <div className="relative mx-auto">
          <Footer />
        </div>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
