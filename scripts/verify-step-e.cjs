/**
 * Step E verification: scan Next.js client chunks for ?. and ?? after `next build`.
 * Run: npm run verify:step-e
 * Quick re-scan without rebuild: npm run verify:bundles
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const chunksDir = path.join(root, ".next", "static", "chunks");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, acc);
    else if (name.isFile() && name.name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

function main() {
  if (!fs.existsSync(chunksDir)) {
    console.error(
      "Step E: .next/static/chunks not found — run `npm run build` first (or `npm run verify:step-e`)."
    );
    process.exit(1);
  }

  /** Match optional chaining (?.) occurrences in minified output */
  const reOptionalChain = /\?\./g;
  /** Nullish coalescing (avoid matching URL ?query by requiring second ?) */
  const reNullish = /\?\?/g;

  const files = walk(chunksDir);
  let totalOC = 0;
  let totalNC = 0;
  /** @type {{ rel: string; oc: number; nc: number }[]} */
  const rows = [];

  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    const oc = (code.match(reOptionalChain) || []).length;
    const nc = (code.match(reNullish) || []).length;
    if (oc === 0 && nc === 0) continue;
    totalOC += oc;
    totalNC += nc;
    rows.push({
      rel: path.relative(root, file).replace(/\\/g, "/"),
      oc,
      nc,
    });
  }

  rows.sort((a, b) => b.oc + b.nc - (a.oc + a.nc));

  console.log("");
  console.log("Step E — production bundle syntax scan");
  console.log("─".repeat(56));
  console.log(`Chunks scanned:     ${files.length} (.next/static/chunks/**/*.js)`);
  console.log(`Chunks w/ matches: ${rows.length}`);
  console.log(`Total ?. tokens:    ${totalOC}`);
  console.log(`Total ?? tokens:    ${totalNC}`);
  console.log("");
  console.log(
    "Interpretation: some ?./?? remains from Next/React runtime + app code"
  );
  console.log(
    "targeting browsers in your Browserslist. SEO tools should use a JS engine comparable to Chromium 111+ (Next 16 baseline)."
  );
  console.log("");
  console.log("Top chunks by (?.) + (??) hits:");
  for (const r of rows.slice(0, 35)) {
    console.log(`  ${String(r.oc + r.nc).padStart(6)}  ${r.rel}`);
  }
  if (rows.length > 35) {
    console.log(`  ... and ${rows.length - 35} more files`);
  }
  console.log("");
  console.log("Manual crawl checks (Technical SEO Fetch & Render, etc.):");
  console.log("  • Home — /");
  console.log("  • Shop — /shop/");
  console.log("  • Any product detail — /product/<slug>/");
  console.log("Expect: visible primary HTML + no script syntax errors.");
  console.log("");
}

main();
