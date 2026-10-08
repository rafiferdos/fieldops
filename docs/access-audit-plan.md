# User access and audit inspection

This checkpoint implements `/admin/users` and `/admin/audit-logs`.
Backend code remains unchanged. No user creation, deletion, impersonation, credential
reset or prefilled technician-skill replacement is invented.

## Access management

Use only the safe managed-user fields returned by the backend. Search, role, status,
sorting and pagination are URL state. Invalid known filters stop the read instead of
silently broadening it. Unknown browser-only query values are never forwarded.

Access edits use a validated Sheet and explicit AlertDialog confirmation. Send only
changed role/status fields. Since no single-user read or access-version field exists,
re-read the original directory page and match the exact user ID and snapshot before
writing. A changed/moved record requires inspection. This preflight is conservative;
it cannot provide atomic optimistic concurrency without a backend version.

The backend atomically protects the last active administrator and technician work,
revokes sessions and appends an audit event. Suspension retains assignments; leaving
TECHNICIAN removes obsolete skills. Reactivation never revives old sessions. A
confirmed self-change clears the current frontend session and requires a fresh login.
Conflicts and uncertain outcomes block another write, including after reopening the
editor, until the directory is explicitly inspected. No mutation retries automatically.

## Audit inspection

The audit screen is read-only. Supported filters are entityType, entityId, actorId,
action, paired from/to and pagination; the API always sorts newest first. Date
controls represent Dhaka midnight and retain the half-open, at-most-366-day range.
IDs, action syntax and external response envelopes must be validated. Metadata is
displayed only through a per-action field allowlist and bounded scalar/string-array
values. Unknown actions show their event identity with empty metadata. No arbitrary
JSON dump, nested payload, credential field or provider callback is exposed.

## Acceptance

Run strict checks/build and commit each working slice separately. Live writes may
change only a newly created, uniquely identified disposable account. Verify actual
session revocation, reactivation with fresh login, stale-form blocking and uncertainty
recovery without targeting shared demo users. Audit checks inspect the resulting
real events, URL state, pagination, invalid periods, responsive layout and wrong-role
boundaries. Last-admin/concurrent-active-work invariants remain backend-authoritative;
do not claim those were exercised by changing existing operational accounts.

## Verification and limits

Strict formatting, typed lint, generated routes and TypeScript pass. The 156 ordinary
tests plus six real-Redis checks all pass (162 total). Both feature checkpoints pass
the supported production Webpack build. No dependencies were added.

The browser scenarios use the actual hosted API and production frontend. They create
only fresh disposable users and restore them to ACTIVE CUSTOMER before cleanup.
One access response is lost after the real suspension commits: its original access,
refresh and password login are rejected, the form blocks replay, and a second stale
tab cannot overwrite the new state. Explicit inspection restores usable controls.
Reactivation permits a fresh login and leaves old tokens revoked; a role change
revokes that fresh session again. Audit inspection reads the three resulting access
events and their actual metadata, then paginates the same filtered history.

A separate isolated account is promoted to ADMIN while the shared administrator
remains active. Its own confirmed demotion clears the frontend cookie, blocks the
protected directory and requires a fresh customer login. Read-only checks cover
invalid criteria, incomplete periods with preserved inputs, future empty history,
URL pagination/filter reset, 320/768/1024/1280/1440px layouts, themes and customer/
technician route boundaries. Browser mutation retries remain disabled.

These tests do not demote the last real administrator or create active work solely
to probe backend technician-role constraints. They do not establish atomic access
concurrency absent a backend version. Safari, physical devices, live Google OAuth,
payment returns and provider settlement remain outside this checkpoint.

All three scenarios have passing Chromium results on the same production application
code. Self-change passed in the initial run; access/audit recovery and read-only
filters passed in the focused rerun after test locators were scoped to the account
Sheet and URL assertions were made independent of parameter order. No application
fix or automatic mutation retry was needed between those runs.
