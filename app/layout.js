import "./globals.css";
import React, { Suspense } from "react";
import { CartProvider } from "../app/src/Context/CartContext";
import { WishlistProvider } from "../app/src/Context/WishlistContext";
import { UserProvider } from "../app/src/Context/UserContext";
import { BundleProvider } from "../app/src/Context/BundleContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "../app/src/components/Header/Header";
import Footer from "../app/src/components/Footer/Footer";
import { getSiteBaseUrl } from "./lib/getCanonicalUrl";

const siteOrigin = getSiteBaseUrl();

export const metadata = {
  ...(siteOrigin ? { metadataBase: new URL(siteOrigin) } : {}),
  title: "Disposable Bazaar",
  description: "Quality disposable products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>
        <GoogleOAuthProvider clientId="341574951595-7kmbo799rdp05d4dcjgn0vfkpfsrrs44.apps.googleusercontent.com">
          <UserProvider>
            <CartProvider>
              <BundleProvider>
                <WishlistProvider>
                  <Suspense fallback={null}>
                    <Header />
                  </Suspense>

                  {children}

                  <Footer />
                </WishlistProvider>
              </BundleProvider>
            </CartProvider>
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
