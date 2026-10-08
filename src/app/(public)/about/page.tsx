import { PageHeading } from "@/shared/components/page-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

export const metadata = { title: "How it works" }
export default function AboutPage() {
  return (
    <>
      <PageHeading
        eyebrow="How FieldOps works"
        title="One service journey. Three clear roles."
        description="Customers request a service, administrators coordinate the visit, and technicians record the work."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [
            "01 · Request",
            "Choose an active service, describe the issue and suggest a visit time. You can edit a pending request or cancel eligible work before the technician starts travelling.",
          ],
          [
            "02 · Coordinate",
            "An administrator reviews the request and finds a qualified, available technician. Your preferred time is a request; the assigned schedule confirms the visit.",
          ],
          [
            "03 · Resolve",
            "The assigned technician records progress and completion. An immutable invoice follows. Verified payment makes a completed job eligible for your feedback.",
          ],
        ].map(([title, text]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {text}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
