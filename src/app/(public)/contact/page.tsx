import { publicMetadata } from "@/infrastructure/seo/metadata"
import {
  ArrowUpRight,
  Mail,
  Phone,
  ClipboardList,
  ShieldCheck,
} from "lucide-react"
import { supportChannels } from "@/features/support/channels"
import { PageHeading } from "@/shared/components/page-heading"
import { ButtonLink } from "@/shared/components/button-link"
import { Reveal } from "@/shared/components/reveal"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"

export const metadata = publicMetadata(
  "Contact",
  "Contact FieldOps for help with service requests, scheduled visits, invoices and payment follow-up.",
  "/contact"
)

export default function ContactPage() {
  return (
    <>
      <PageHeading
        eyebrow="Stay connected"
        title="A clearer path to help."
        description="Questions about a request, your visit or an invoice? Reach out with the details that help us find your service journey."
      />
      <Reveal stagger className="grid gap-5 md:grid-cols-2">
        <Card className="min-w-0 border shadow-none">
          <CardHeader>
            <Mail aria-hidden="true" className="mb-5 size-7 text-brand-ink" />
            <CardTitle className="text-2xl">Write to us</CardTitle>
            <CardDescription>
              Share your question and the relevant request or work-order
              reference.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg break-all">{supportChannels.email}</p>
            <Button
              render={<a href={`mailto:${supportChannels.email}`} />}
              size="lg"
            >
              Email support
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
        <Card className="min-w-0 border shadow-none">
          <CardHeader>
            <Phone aria-hidden="true" className="mb-5 size-7 text-brand-ink" />
            <CardTitle className="text-2xl">Give us a call</CardTitle>
            <CardDescription>
              Have your request or work-order reference ready when discussing a
              visit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{supportChannels.displayPhone}</p>
            <Button
              render={<a href={`tel:${supportChannels.phone}`} />}
              size="lg"
              variant="outline"
            >
              Call support
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </Reveal>
      <Reveal className="mt-8">
        <Card className="border bg-muted/20 shadow-none">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Before you reach out
            </Badge>
            <CardTitle className="text-2xl">
              Keep the conversation connected.
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-7 md:grid-cols-2">
            <div className="space-y-3">
              <ClipboardList
                aria-hidden="true"
                className="size-5 text-brand-ink"
              />
              <h2 className="font-medium">Find your latest record</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sign in to see your request status, confirmed schedule,
                completion report and invoice. For a payment question, include
                the payment reference shown in FieldOps.
              </p>
              <ButtonLink href="/login" variant="outline">
                Open your account
                <ArrowUpRight aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="space-y-3">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-brand-ink"
              />
              <h2 className="font-medium">Share only what is needed</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Explain the issue and share the relevant reference. Keep
                passwords, verification codes and card details private. Only
                provider-verified payment records confirm settlement.
              </p>
              <ButtonLink href="/faq" variant="ghost">
                Read common answers
                <ArrowUpRight aria-hidden="true" />
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </>
  )
}
