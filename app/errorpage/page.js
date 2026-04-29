

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