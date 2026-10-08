import { getRequest } from "@/features/requests/server"
import { RequestDetails } from "@/features/requests/components/request-details"
export const metadata = { title: "Request details" }
export default async function RequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  return (
    <RequestDetails
      role="CUSTOMER"
      request={await getRequest((await params).requestId)}
    />
  )
}
