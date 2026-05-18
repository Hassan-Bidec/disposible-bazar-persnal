import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Register - Disposable Bazaar",
    alternates: { canonical: getCanonicalUrl("/register/") ?? undefined },
    robots: { index: false, follow: true },
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