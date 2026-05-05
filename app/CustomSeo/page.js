import {
  fetchPageDetailById,
  metadataFromPageDetail,
} from "../lib/seo/pageDetail";

export const revalidate = 86400;

export async function generateMetadata() {
  const detail = await fetchPageDetailById(7, {
    next: { revalidate: 86400 },
  });
  return metadataFromPageDetail(detail, {
    title: "Disposable Bazaar",
    description: "Quality disposable products",
  });
}

/** Legacy route; placeholder page (no client next/head). */
export default function Page() {
  return null;
}
