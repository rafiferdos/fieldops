import type { Metadata } from "next"

// Public pages share a canonical policy; filter queries do not create duplicate entries.
export function publicMetadata(
  title: string,
  description: string,
  pathname: string
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      title: `${title} | FieldOps`,
      description,
      url: pathname,
      siteName: "FieldOps",
      type: "website",
      images: [
        {
          url: "/images/editorial/service-still-life.png",
          alt: "FieldOps tools and service planning",
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  }
}
