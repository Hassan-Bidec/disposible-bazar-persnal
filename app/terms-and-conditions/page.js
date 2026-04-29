

// import React, { Suspense } from "react";
import TermsAndConditions from "../src/Pages/TermsAndConditions"

export const revalidate = 86400;
export default function Page() {
  return (
    // <Suspense fallback={<div>Loading...</div>}>
      
    <TermsAndConditions/>
    //  </Suspense>
  );
}