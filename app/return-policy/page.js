
import React, { Suspense } from "react";
import ReturnPolicy from "../src/Pages/ReturnPolicy"

export const revalidate = 86400;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
    <ReturnPolicy/>
     </Suspense>
  );
}