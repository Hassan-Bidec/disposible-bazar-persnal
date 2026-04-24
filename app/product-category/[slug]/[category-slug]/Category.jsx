"use client";

import { Suspense } from "react";
import CategoryPageClient from "../CategoryPageClient";

export default function CategoryWrapper(props) {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <CategoryPageClient {...props} />
    </Suspense>
  );
}
