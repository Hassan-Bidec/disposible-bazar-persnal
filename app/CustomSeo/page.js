

import { Suspense } from "react";
import CustomSeo from "../src/components/CustomSeo";
export const revalidate = 86400;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomSeo />
    </Suspense>
  );
}
