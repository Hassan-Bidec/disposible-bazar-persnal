

import React, { Suspense } from "react";
import PrivacyPolicy from "../src/Pages/PrivacyPolicy"

export const revalidate = 86400;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
   <PrivacyPolicy/>
     </Suspense>
  );
}