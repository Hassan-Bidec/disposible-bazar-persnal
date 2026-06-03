import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Error - Disposable Bazaar",
    alternates: { canonical: getCanonicalUrl("/errorpage/") ?? undefined },
    robots: { index: false, follow: false },
  };
}

import React, { Suspense } from "react";
import ErrorPage from "../src/Pages/ErrorPage"

export const revalidate = 86400;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
   <ErrorPage/>
     </Suspense>
  );
}