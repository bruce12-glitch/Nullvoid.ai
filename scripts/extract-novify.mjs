#!/usr/bin/env node
/**
 * Extract exact design tokens from UX Pilot HTML source for 0% diff clone
 * Usage: node scripts/extract-novify.mjs source/Novify.source.html
 * Outputs: source/inventory.json + public/novify/svg-* + source/css-extracted.css
 */
import fs from "fs";
import path from "path";
import cheerio from "cheerio";

const input = process.argv[2] || "source/Novify.source.html";
const htmlPath = path.resolve(input);

if (!fs.existsSync(htmlPath)) {
  console.error(`❌ Source not found at ${htmlPath}`);
  console.log(`ℹ️  Please place your UX Pilot HTML at: source/Novify.source.html`);
  console.log(`   Then run: node scripts/extract-novify.mjs`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf-8");
const $ = cheerio.load(html);

console.log("🔍 Parsing", htmlPath, `(${(html.length / 1024).toFixed(1)} KB)`);

// Extract sections
const sections = [];
$("section, [id]").each((i, el) => {
  const $el = $(el);
  sections.push({
    tag: el.tagName,
    id: $el.attr("id") || null,
    class: $el.attr("class") || null,
    text: $el.text().trim().slice(0, 80).replace(/\s+/g, " "),
  });
});

// Extract colors (hex)
const styleText = $("style").text() + $("[style]").map((_, el) => $(el).attr("style")).get().join(" ") + html;
const hexes = [...new Set((styleText.match(/#[0-9a-fA-F]{3,8}/g) || []).map((h) => h.toLowerCase()))].sort();

// Extract fonts
const fontFamilies = [...new Set((styleText.match(/font-family:\s*[^;]+/gi) || []).map((s) => s.trim()))];
const googleFonts = [...new Set((html.match(/fonts\.googleapis\.com[^"]+/g) || []))];
const fontshare = [...new Set((html.match(/fontshare\.com[^"]+/g) || []))];

// Extract SVGs
const svgs = $("svg");
const svgDir = "public/novify";
fs.mkdirSync(svgDir, { recursive: true });
svgs.each((i, el) => {
  const svgHtml = $.html(el);
  fs.writeFileSync(path.join(svgDir, `svg-${i}.svg`), svgHtml);
});

// Extract images
const imgs = $("img")
  .map((_, el) => ({
    src: $(el).attr("src"),
    alt: $(el).attr("alt") || "",
    class: $(el).attr("class") || "",
  }))
  .get();

// Extract Tailwind CDN config
const tailwindConfig = html.match(/tailwind\.config\s*=\s*\{[^}]+\}/s)?.[0] || null;

// Extract keyframes
const keyframes = [...new Set((styleText.match(/@keyframes\s+[\w-]+/g) || []))];

// Build inventory
const inventory = {
  meta: {
    sectionsCount: sections.length,
    hexCount: hexes.length,
    svgCount: svgs.length,
    imgCount: imgs.length,
    htmlSizeKb: (html.length / 1024).toFixed(1),
  },
  sections,
  colors: hexes,
  fonts: { fontFamilies, googleFonts, fontshare },
  tailwindConfig,
  keyframes,
  images: imgs,
};

fs.mkdirSync("source", { recursive: true });
fs.writeFileSync("source/inventory.json", JSON.stringify(inventory, null, 2));
console.log("✅ Wrote source/inventory.json");
console.log(`   Sections: ${sections.length}, Hexes: ${hexes.length}, SVGs: ${svgs.length} → ${svgDir}/svg-*.svg, Images: ${imgs.length}`);
console.log("   Keyframes:", keyframes.join(", ") || "none");
console.log("\nNext: Compare hexes vs screenshot tokens and patch globals.css / NovifyLanding.tsx for 0% diff.");
console.log("   Run: npm run dev and open https://3000-...e2b.app for visual diff.");
