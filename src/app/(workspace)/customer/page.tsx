import { DashboardServer } from "@/features/workspace/components/dashboard-server"

export const metadata = { title: "Service dashboard" }
export default function DashboardPage() {
  return <DashboardServer role="CUSTOMER" />
}
