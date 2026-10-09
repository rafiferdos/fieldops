"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { useStore } from "zustand"
import { createQueryClient } from "@/infrastructure/query/client"
import {
  createWorkspacePreferences,
  type WorkspacePreferences,
} from "../preferences"

const PreferencesContext = createContext<ReturnType<
  typeof createWorkspacePreferences
> | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  const [preferences] = useState(createWorkspacePreferences)
  useEffect(() => {
    // Hydrate after the matching server/client render, even if storage is unavailable.
    void preferences.persist.rehydrate()
    return () => queryClient.clear()
  }, [preferences, queryClient])
  return (
    <PreferencesContext value={preferences}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PreferencesContext>
  )
}

export function useWorkspacePreference<T>(
  selector: (state: WorkspacePreferences) => T
) {
  const store = useContext(PreferencesContext)
  if (!store)
    throw new Error("Workspace preferences require WorkspaceProvider.")
  return useStore(store, selector)
}
