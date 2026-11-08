import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AgriSphere MarketLink AI | Two-Way Agricultural Trading & Intelligence",
  description: "Connecting Bangladeshi farmers directly with agro-mills, wholesale traders, supermarkets, and international exporters with real-time auctions and AI net-return recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col font-sans bg-[#fbfbf9] text-earth-900 antialiased selection:bg-agri-200 selection:text-agri-950">
        <AppProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
