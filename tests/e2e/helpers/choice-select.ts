import { reachWorkspaceControl } from "./workspace-motion"
import type { Page } from "@playwright/test"

// Interact through the actual shadcn popup, including its keyboard/focus implementation.
export async function chooseOption(page: Page, label: string, option: string) {
  const trigger = page.getByRole("combobox", { name: label, exact: true })
  await reachWorkspaceControl(page, trigger)
  await trigger.click()
  await page.getByRole("option", { name: option, exact: true }).click()
}
