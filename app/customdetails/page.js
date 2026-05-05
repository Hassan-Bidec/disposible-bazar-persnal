import { Suspense } from "react";
import CustomDetails from "../src/Pages/CustomDetails";
import {
  fetchPageDetailById,
  metadataFromPageDetail,
  serializeLdJson,
} from "../lib/seo/pageDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const detail = await fetchPageDetailById(2, { cache: "no-store" });
  return metadataFromPageDetail(detail, {
    title: "Custom details",
    description: "Custom details - Disposable Bazaar",
  });
}

export default async function Page() {
  const detail = await fetchPageDetailById(2, { cache: "no-store" });
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
        <CustomDetails />
      </Suspense>
    </>
  );
}
