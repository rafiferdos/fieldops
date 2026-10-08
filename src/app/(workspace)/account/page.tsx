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
      <dl className="surface mb-8 flex max-w-2xl flex-wrap gap-8 p-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="mt-1 break-all">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="mt-1">{profile.role}</dd>
        </div>
      </dl>
      <ProfileForm name={profile.name} phone={profile.phone} />
    </>
  )
}
