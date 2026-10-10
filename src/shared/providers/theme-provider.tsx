"use client"

import { useSyncExternalStore, type ComponentProps } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

function subscribeHydration() {
  return () => undefined
}

export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>
) {
  const clientRender = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  )
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
      // SSR executes the no-flash bootstrap; client remounts use provider effects instead.
      scriptProps={{
        ...props.scriptProps,
        ...(clientRender ? { type: "text/plain" } : {}),
      }}
    />
  )
}
