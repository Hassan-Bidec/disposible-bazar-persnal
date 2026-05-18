import { getCanonicalUrl } from "../lib/getCanonicalUrl";

export async function generateMetadata() {
  return {
    title: "Customization Category - Disposable Bazaar",
    alternates: {
      canonical: getCanonicalUrl("/customizatiocategory/") ?? undefined,
    },
  };
}

import React, { Suspense } from "react";
import CustomizationCategory from "../../app/product-category/[slug]/page"

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
<CustomizationCategory/>
     </Suspense>
  );
}