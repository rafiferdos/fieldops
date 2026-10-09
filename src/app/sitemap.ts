import type { MetadataRoute } from "next"
import { getAppOrigin } from "@/infrastructure/env/auth"

// Catalog detail links remain discoverable through the real, paginated service listing.
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppOrigin()
  return ["/", "/about", "/services", "/faq", "/contact"].map((pathname) => ({
    url: new URL(pathname, origin).href,
  }))
}
