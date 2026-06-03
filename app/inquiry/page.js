import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Inquiry - Disposable Bazaar",
    alternates: { canonical: getCanonicalUrl("/inquiry/") ?? undefined },
    robots: { index: false, follow: true },
  };
}

import React, { Suspense } from "react";
import Inquiry from "../src/Pages/Invoice"

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
   <Inquiry/>
     </Suspense>
  );
}