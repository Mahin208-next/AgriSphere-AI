import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MessengerAIPopup from "@/components/assistant/MessengerAIPopup";

export const metadata: Metadata = {
  title: "KrishiSetu AI — Connecting Farmers to Every Market",
  description: "KrishiSetu AI connects Bangladeshi farmers directly with agro-mills, wholesale traders, supermarkets, and international exporters with real-time auctions and AI net-return recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Pre-empt Netlify HUD badge so it never overlays UI elements
                try {
                  localStorage.setItem('nl-hud:public:v1', 'hidden');
                  localStorage.setItem('nl-hud:owner-private:v1', 'hidden');
                } catch (e) {}

                // Ignore errors coming from browser extensions (e.g. VPN, translator extensions)
                window.addEventListener('error', function(e) {
                  if (
                    e.filename &&
                    (e.filename.includes('chrome-extension://') ||
                     e.filename.includes('moz-extension://') ||
                     e.filename.includes('safari-extension://'))
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var stack = e.reason && (e.reason.stack || e.reason.fileName || '');
                  if (typeof stack === 'string' && (stack.includes('chrome-extension://') || stack.includes('moz-extension://'))) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);

                // Instantly remove Netlify HUD if injected dynamically
                var removeNetlifyHud = function() {
                  var badge = document.getElementById('nl-badge-frame');
                  if (badge && badge.tagName === 'IFRAME') badge.remove();
                  var hud = document.getElementById('nl-hud-frame');
                  if (hud && hud.tagName === 'IFRAME') hud.remove();
                };
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeNetlifyHud);
                } else {
                  removeNetlifyHud();
                }
                try {
                  var observer = new MutationObserver(function() {
                    removeNetlifyHud();
                  });
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                } catch (err) {}
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-[#fbfbf9] text-earth-900 antialiased selection:bg-agri-200 selection:text-agri-950">
        {/* Placeholder tags with netlify HUD IDs to prevent script injection */}
        <div id="nl-badge-frame" style={{ display: "none" }} aria-hidden="true" />
        <div id="nl-hud-frame" style={{ display: "none" }} aria-hidden="true" />
        <AppProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <MessengerAIPopup />
        </AppProvider>
      </body>
    </html>
  );
}
