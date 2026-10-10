import type { NextConfig } from "next"

const imageCloud = process.env.IMAGE_CLOUD_NAME?.trim()
if (imageCloud && !/^[a-zA-Z0-9_-]{1,100}$/.test(imageCloud))
  throw new Error("IMAGE_CLOUD_NAME must be the Cloudinary cloud name.")

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  // Authentication actions contain credentials; development logs must not print arguments.
  logging: { serverFunctions: false },
  images: {
    // Only our media namespace can enter the optimizer; redirects cannot escape this origin.
    remotePatterns: imageCloud
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            port: "",
            pathname: `/${imageCloud}/image/upload/v*/fieldops/**`,
            search: "",
          },
        ]
      : [],
    maximumRedirects: 0,
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
