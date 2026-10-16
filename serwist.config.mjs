import { readFileSync } from "node:fs";
import { serwist } from "@serwist/next/config";

const revision = readFileSync(".next/BUILD_ID", "utf8").trim();
export default serwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  precachePrerendered: false,
  // Only immutable build assets and explicitly public essentials. Never API/RSC.
  globPatterns: [
    ".next/static/**/*.{js,css,woff,woff2}",
    "public/{logo-horizontal-white.png,logoOriginalEslogan.svg,icon-*.png,fondowan.png,rehabilitacion.webp,img_Contactanos.png,img_QuienesSomos.png}",
  ],
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
});
