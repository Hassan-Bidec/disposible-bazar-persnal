// ...existing code...
"use client";

import React from "react";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";

/** Avoid Chrome lazy-load warnings: lazy <img> should have dimensions. */
function patchLazyImgDimensions(html) {
  if (!html || typeof html !== "string") return html;
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    const a = String(attrs || "").trim();
    const hasW = /\bwidth\s*=/i.test(a);
    const hasH = /\bheight\s*=/i.test(a);
    const isLazy = /loading\s*=\s*["']lazy["']/i.test(a);
    if (isLazy && (!hasW || !hasH)) {
      const extra = [!hasW ? 'width="640"' : "", !hasH ? 'height="480"' : ""]
        .filter(Boolean)
        .join(" ");
      return `<img ${extra}${a.length ? ` ${a}` : ""}>`;
    }
    return full;
  });
}

const DecodeTextEditor = ({ body }) => {
  // if no body, render nothing
  if (!body) return null;

  // prefer sanitize if available, otherwise passthrough
  const sanitizeFn = typeof DOMPurify?.sanitize === "function" ? DOMPurify.sanitize : (s) => s;
  let cleanHtml;
  try {
    cleanHtml = sanitizeFn(body);
    cleanHtml = patchLazyImgDimensions(cleanHtml);
  } catch (err) {
    console.error("Sanitize failed, using raw body:", err);
    cleanHtml = patchLazyImgDimensions(body);
  }

  // const options = {
  //   replace: (domNode) => {
  //     if (domNode?.name === "img") {
  //       return (
  //         <img
  //           src={domNode?.attribs?.src || ""}
  //           alt={domNode?.attribs?.alt || ""}
  //           className="max-w-full h-auto rounded-lg my-2"
  //         />
  //       );
  //     }
  //     return undefined;
  //   },
  // };
  const options = {
    replace: (domNode) => {
      if (!domNode?.name) return;

      if (domNode.name === "h2")
        return <h2 className="text-3xl font-semibold my-4">{domNode.children[0].data}</h2>;

      if (domNode.name === "h3")
        return <h3 className="text-2xl font-semibold my-3">{domNode.children[0].data}</h3>;

      if (domNode.name === "h4")
        return <h4 className="text-xl font-medium my-2">{domNode.children[0].data}</h4>;

      if (domNode?.name === "img") {
        const rawW = domNode?.attribs?.width;
        const rawH = domNode?.attribs?.height;
        const w = rawW && !Number.isNaN(Number(rawW)) ? Number(rawW) : 640;
        const h = rawH && !Number.isNaN(Number(rawH)) ? Number(rawH) : 480;
        return (
          <Image
            src={domNode?.attribs?.src || ""}
            alt={domNode?.attribs?.alt || ""}
            width={w}
            height={h}
            className="max-w-full h-auto rounded-lg my-2"
          />
        );
      }

      return undefined;
    },
  };


  try {
    return <div className="mb-4 font-poppins">{parse(cleanHtml, options)}</div>;
  } catch (err) {
    console.error("HTML parse error:", err);
    const fallbackHtml = patchLazyImgDimensions(cleanHtml);
    return (
      <div className="mb-4 font-poppins" dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
    );
  }
};

export default DecodeTextEditor;
// ...existing code...