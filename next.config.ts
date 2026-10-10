import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  // Authentication actions contain credentials; development logs must not print arguments.
  logging: { serverFunctions: false },
  images: {
    // Fill the default gaps for 392px editorial cards and the 1216px hero scene.
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
