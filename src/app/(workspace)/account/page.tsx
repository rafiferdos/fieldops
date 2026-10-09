import { DetailPanel } from "@/shared/components/detail-panel"
import { requireViewer } from "@/features/auth/session"
import { ProfileForm } from "@/features/account/components/profile-form"
import { PageHeading } from "@/shared/components/page-heading"
export const metadata = { title: "Account" }
export default async function AccountPage() {
  const { profile } = await requireViewer()
  return (
    <>
      <PageHeading
        title="Your account"
        description="Keep your contact details current for your service visits."
      />
      <DetailPanel className="mb-8 max-w-2xl">
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="mt-1 break-all">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="mt-1">{profile.role}</dd>
        </div>
      </DetailPanel>
      <section id="account-settings" aria-label="Account settings">
        <ProfileForm name={profile.name} phone={profile.phone} />
      </section>
    </>
  )
}
