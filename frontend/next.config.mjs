// Build-time env check — shows in Vercel build log
console.log("[next.config] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING");
console.log("[next.config] NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse pulls in pdfjs-dist (workers + binary assets). Bundling it breaks the
  // route at load time, which surfaces as an HTML 500 page instead of a JSON error.
  // On Next 14 this key lives under `experimental` — the top-level
  // `serverExternalPackages` only exists from Next 15 and is silently ignored here.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
    // pdf-parse → pdfjs-dist v5 eagerly loads the native @napi-rs/canvas binary
    // (it supplies the DOMMatrix/ImageData/Path2D polyfills pdfjs needs even for
    // plain text extraction). Vercel's file tracing does not follow the platform
    // dispatch into the .node binary, so without this the upload route dies with
    // "DOMMatrix is not defined". Include every Linux variant Vercel might run.
    outputFileTracingIncludes: {
      "/api/v1/standards/upload": [
        "./node_modules/@napi-rs/canvas*/**",
        "./node_modules/pdfjs-dist/**",
      ],
      "/api/v1/admin/norms/upload": [
        "./node_modules/@napi-rs/canvas*/**",
        "./node_modules/pdfjs-dist/**",
      ],
    },
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
