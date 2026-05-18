import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Checkout - Disposable Bazaar",
    alternates: { canonical: getCanonicalUrl("/checkout/") ?? undefined },
    robots: { index: false, follow: true },
  };
}

import React, { Suspense } from "react";
import Checkout from "../src/Pages/Checkout"

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
    <Checkout/>
     </Suspense>
  );
}