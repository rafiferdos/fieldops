import "react"

declare module "react" {
  // CSS custom properties accept only serializable CSS values, while standard properties remain typed.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined
  }
}
