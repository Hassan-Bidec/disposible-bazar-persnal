import { Suspense } from "react";
import Checkout from "../src/Pages/Checkout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata() {
  const canonical = SITE_URL ? `${new URL(SITE_URL).origin}/checkout/` : undefined;
  return {
    title: "Checkout - Disposable Bazaar",
    alternates: canonical ? { canonical } : undefined,
    robots: { index: false, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Checkout />
    </Suspense>
  );
}
