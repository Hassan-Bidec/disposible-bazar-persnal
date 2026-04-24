"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "../Utils/axios";

const CustomSeo = ({ slug, id, data }) => {
  const [seoData, setSeoData] = useState({
    meta_title: "Disposable Bazaar",
    meta_description: "Disposable Bazaar Description",
    canonical_url: "",
    focus_keyword: "",
    robots_txt: "",
    sitemap_xml: "",
    schema: "",
  });

  // If direct data is passed, use it immediately — no fetch needed
  useEffect(() => {
    if (data) {
      setSeoData((prev) => ({ ...prev, ...data }));
    }
  }, [data]);

  useEffect(() => {
    if (data || (!slug && !id)) return;

    const fetchSeoData = async () => {
      try {
        const endpoint = id ? `/page/detail/${id}` : `/page/detail?slug=${slug}`;
        const response = await axios.public.get(endpoint);

        const responseData = response?.data?.data;

        if (!responseData) {
          console.warn("No SEO data found for slug:", slug);
          return;
        }

        setSeoData(responseData);
      } catch (error) {
        console.log("RAW ERROR =>", error);

        const info = {
          message: error.message,
          status: error?.response?.status ?? null,
          responseData: error?.response?.data ?? null,
          requestUrl: error?.config?.url ?? null,
        };

        console.error("Error fetching SEO data:", JSON.stringify(info));

        setSeoData((prev) => ({
          ...prev,
          meta_title: prev.meta_title || "Disposable Bazaar",
          meta_description:
            prev.meta_description || "Disposable Bazaar Description",
        }));
      }
    };

    fetchSeoData();
  }, [slug, id, data]);

  // Safe JSON Parse
  let schemaData = null;
  try { schemaData = seoData.schema ? JSON.parse(seoData.schema) : null; } 
catch(err) { console.warn("Invalid schema JSON:", err.message); }


  return (
    <Head>
      <title>{seoData.meta_title}</title>
      <meta name="description" content={seoData.meta_description} />

      {seoData.focus_keyword && (
        <meta name="keywords" content={seoData.focus_keyword} />
      )}

      {seoData.canonical_url && (
        <link rel="canonical" aria-label={seoData.canonical_url} href={seoData.canonical_url} />
      )}

      {seoData.robots_txt && (
        <meta name="robots" content={seoData.robots_txt} />
      )}

      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Head>
  );
};

export default CustomSeo;
