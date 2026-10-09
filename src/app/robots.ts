import type { MetadataRoute } from "next"
import { getAppOrigin } from "@/infrastructure/env/auth"

// Crawlers discover public content; authorization still protects every private route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/register",
        "/account",
        "/customer",
        "/technician",
        "/admin",
        "/payment",
        "/payments",
      ],
    },
    sitemap: `${getAppOrigin()}/sitemap.xml`,
  }
}
