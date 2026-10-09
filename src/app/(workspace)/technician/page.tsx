import { DashboardServer } from "@/features/workspace/components/dashboard-server"

export const metadata = { title: "Field dashboard" }
export default function DashboardPage() {
  return <DashboardServer role="TECHNICIAN" />
}
