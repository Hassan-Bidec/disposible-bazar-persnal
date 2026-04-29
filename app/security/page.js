

import React, { Suspense } from "react";
import Security from "../src/Pages/Security"

export const revalidate = 86400;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
    <Security/>
     </Suspense>
  );
}