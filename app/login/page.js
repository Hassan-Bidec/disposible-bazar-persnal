
import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Login - Disposable Bazaar",
    alternates: { canonical: getCanonicalUrl("/login/") ?? undefined },
    robots: {
       index: true,
        follow: true,
        googleBot: { index: true, follow: true }, 
      },
  };
}

import React, { Suspense } from "react";
import Login from '../src/Pages/Login'

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
   <Login/>
     </Suspense>
  );
}