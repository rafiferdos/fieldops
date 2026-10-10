import { Card } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { formatDate } from "@/shared/lib/format"
import type { ManagedUser, ManagedUsersQuery } from "../schemas"
import { AccessEditor } from "./access-editor"
import { ButtonLink } from "@/shared/components/button-link"
import { SkillsEditor } from "../../skills/components/skills-editor"
import { ProfileAvatar } from "@/shared/components/profile-avatar"

export function UserList({
  users,
  query,
  viewerId,
}: {
  users: ManagedUser[]
  query: ManagedUsersQuery
  viewerId: string
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {users.map((user) => (
        <Card
          key={user.id}
          data-user-id={user.id}
          className="min-w-0 border p-6 shadow-none"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{user.role}</Badge>
            <Badge variant="outline">{user.status}</Badge>
            {user.id === viewerId && (
              <Badge variant="secondary">Your account</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ProfileAvatar name={user.name} avatarUrl={user.avatarUrl} />
            <h2 className="font-heading text-xl font-medium break-words">
              {user.name}
            </h2>
          </div>
          <p className="text-sm break-all text-muted-foreground">
            {user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated {formatDate(user.updatedAt)}
          </p>
          <div className="flex flex-wrap gap-3">
            <AccessEditor
              user={user}
              query={query}
              ownAccount={user.id === viewerId}
            />
            {user.role === "TECHNICIAN" && (
              <SkillsEditor id={user.id} name={user.name} />
            )}
            <ButtonLink
              href={`/admin/audit-logs?entityType=USER&entityId=${user.id}&action=USER_ACCESS_UPDATED`}
              variant="ghost"
            >
              View access history
            </ButtonLink>
          </div>
        </Card>
      ))}
    </div>
  )
}
