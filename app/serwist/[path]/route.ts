import { createSerwistRoute } from "@serwist/turbopack";
import { spawnSync } from "node:child_process";
// If you are using Next.js versions older than 15.0.0, add the
// `nextConfig` option so that Serwist can configure the service
// worker according to your options. Serwist 10 and newer will
// only support Next.js 15.0.0 and above.
// import nextConfig from "$cwd/next.config.mjs";

// This is optional!
// A revision helps Serwist version a precached page. This
// avoids outdated precached responses being used. Using
// `git rev-parse HEAD` might not the most efficient way
// of determining a revision, however. You may prefer to use
// the hashes of every extra file you precache.
// Trim the trailing newline from `git rev-parse` output, otherwise the
// revision carries a "%0A" and corrupts the precache URL.
const revision =
    spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
    crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
    // `/images/logo.png` is already in the build's __SW_MANIFEST, so don't add
    // it again here — duplicate URLs with different revisions make Serwist throw
    // `add-to-cache-list-conflicting-entries` and the SW fails to register.
    additionalPrecacheEntries: [{ url: "/offline", revision }],
    swSrc: "app/sw.ts",
    // nextConfig,
    // If set to `false`, Serwist will attempt to use `esbuild-wasm`.
    useNativeEsbuild: true,
});