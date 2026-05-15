// ...existing code...
"use client";

import React from "react";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";

/** Chrome warns when <img loading="lazy"> (or implicitly lazy images) omit width/height. */
function patchImgDimensions(html) {
  if (!html || typeof html !== "string") return html;
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    const a = String(attrs || "").trim();
    const hasW = /\bwidth\s*=/i.test(a);
    const hasH = /\bheight\s*=/i.test(a);
    if (!hasW || !hasH) {
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

  // Decode HTML entities first (API sometimes returns &lt;p&gt; instead of <p>)
  let decodedBody = body;
  if (typeof body === "string" && body.includes("&lt;")) {
    try {
      const txt = document.createElement("textarea");
      txt.innerHTML = body;
      decodedBody = txt.value;
    } catch {
      decodedBody = body
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }
  }

  // prefer sanitize if available, otherwise passthrough
  const sanitizeFn = typeof DOMPurify?.sanitize === "function" ? DOMPurify.sanitize : (s) => s;
  let cleanHtml;
  try {
    cleanHtml = sanitizeFn(decodedBody);
    cleanHtml = patchImgDimensions(cleanHtml);
  } catch (err) {
    console.error("Sanitize failed, using raw body:", err);
    cleanHtml = patchImgDimensions(decodedBody);
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
        return <h2 className="text-3xl font-semibold my-4">{domToReact(domNode.children, options)}</h2>;

      if (domNode.name === "h3")
        return <h3 className="text-2xl font-semibold my-3">{domToReact(domNode.children, options)}</h3>;

      if (domNode.name === "h4")
        return <h4 className="text-xl font-medium my-2">{domToReact(domNode.children, options)}</h4>;

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
    return <div className="mb-4 font-poppins [&_*]:text-inherit [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit [&_h4]:text-inherit [&_p]:text-inherit [&_li]:text-inherit [&_span]:text-inherit">{parse(cleanHtml, options)}</div>;
  } catch (err) {
    console.error("HTML parse error:", err);
    const fallbackHtml = patchImgDimensions(cleanHtml);
    return (
      <div className="mb-4 font-poppins [&_*]:text-inherit" dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
    );
  }
};

export default DecodeTextEditor;
// ...existing code...