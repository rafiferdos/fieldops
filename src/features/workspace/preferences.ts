import { createStore } from "zustand/vanilla"
import { createJSONStorage, persist } from "zustand/middleware"
import { z } from "zod"

const preferenceSchema = z.object({ sidebarOpen: z.boolean() })
export interface WorkspacePreferences {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// Persist only a layout preference. Identity, credentials and API data stay out.
export function createWorkspacePreferences() {
  return createStore<WorkspacePreferences>()(
    persist(
      (set) => ({
        sidebarOpen: true,
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      }),
      {
        name: "fieldops-workspace-layout",
        storage: createJSONStorage(() => localStorage),
        partialize: ({ sidebarOpen }) => ({ sidebarOpen }),
        skipHydration: true,
        merge: (stored, current) => {
          const parsed = preferenceSchema.safeParse(stored)
          return parsed.success ? { ...current, ...parsed.data } : current
        },
      }
    )
  )
}
