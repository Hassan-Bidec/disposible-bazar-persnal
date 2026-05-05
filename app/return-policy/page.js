import React, { Suspense } from "react";
import ReturnPolicy from "../src/Pages/ReturnPolicy";
import {
  fetchPageDetailById,
  metadataFromPageDetail,
  serializeLdJson,
} from "../lib/seo/pageDetail";

export const revalidate = 86400;

export async function generateMetadata() {
  const detail = await fetchPageDetailById(14, {
    next: { revalidate: 86400 },
  });
  return metadataFromPageDetail(detail, {
    title: "Return Policy",
    description: "Return policy - Disposable Bazaar",
  });
}

export default async function Page() {
  const detail = await fetchPageDetailById(14, {
    next: { revalidate: 86400 },
  });
  const schemaLd = serializeLdJson(detail?.schema);

  return (
    <>
      {schemaLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaLd }}
        />
      ) : null}
      <Suspense fallback={<div>Loading...</div>}>
        <ReturnPolicy />
      </Suspense>
    </>
  );
}
