import TermsAndConditions from "../src/Pages/TermsAndConditions";
import {
  fetchPageDetailBySlug,
  metadataFromPageDetail,
  serializeLdJson,
} from "../lib/seo/pageDetail";

export const revalidate = 86400;

export async function generateMetadata() {
  let detail = await fetchPageDetailBySlug("terms-and-conditions", {
    next: { revalidate: 86400 },
  });
  if (!detail) {
    detail = await fetchPageDetailBySlug("terms", {
      next: { revalidate: 86400 },
    });
  }
  return metadataFromPageDetail(detail, {
    title: "Terms and Conditions",
    description: "Terms and conditions - Disposable Bazaar",
  });
}

export default async function Page() {
  let detail = await fetchPageDetailBySlug("terms-and-conditions", {
    next: { revalidate: 86400 },
  });
  if (!detail) {
    detail = await fetchPageDetailBySlug("terms", {
      next: { revalidate: 86400 },
    });
  }
  const schemaLd = serializeLdJson(detail?.schema);

  return (
    <>
      {schemaLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaLd }}
        />
      ) : null}
      <TermsAndConditions />
    </>
  );
}
