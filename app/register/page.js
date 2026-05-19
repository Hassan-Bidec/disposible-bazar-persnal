import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Register - Disposable Bazaar",
    description:
      "Create your Disposable Bazaar account to shop disposable packaging products, track orders, and manage your profile.",
    alternates: { canonical: getCanonicalUrl("/register/") ?? undefined },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

import React, { Suspense } from "react";
import Register from "../src/Pages/Register"

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
<Register/>
     </Suspense>
  );
}