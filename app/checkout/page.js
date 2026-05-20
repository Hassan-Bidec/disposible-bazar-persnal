import { Suspense } from "react";
import Checkout from "../src/Pages/Checkout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata() {
  let canonical;
  try {
    canonical = SITE_URL ? `${new URL(SITE_URL).origin}/checkout/` : undefined;
  } catch {
    canonical = undefined;
  }
  return {
    title: "Checkout - Disposable Bazaar",
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
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
