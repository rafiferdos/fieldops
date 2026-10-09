# Route, role and API plan

Reviewed October 9, 2026. This plan includes the authorized skills and Contact delivery slices.
The tables specify the target implementation; they do not imply every page is shipped.
See [implementation status](implementation-status.md) for completed slices and limits.

## Sources and scope

- [Official Assignment 7 requirements](https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/project-requirements.md)
  require at least 18 fully functional pages, three fixed roles, real API data,
  URL-driven lists, a validated multistep form, skeletons, error handling, demo
  logins and real test-mode payments. The explicit 18-page rule takes precedence
  over the conflicting 15-page heading. Example domain pages are suggestions.
- [Implemented backend contract](https://app.notion.com/p/3f34ab5df14481afa4acc3e9a092b940)
  defines the actual supported operations. Local backend controllers, schemas,
  services and the Postman collection were inspected read-only to resolve details.
- The inventory covers **29 core route templates and 2 payment-return
  templates**, and all **39 domain APIs plus 2 health endpoints**. A route template
  counts once regardless of its record count. Planned pages do not count toward
  submission until functional and verified. Informational pages require useful,
  accurate content; no empty pages will be added to inflate the count.

The later [payment-return checkpoint](payment-return-plan.md) adds a dedicated
provider browser transport while retaining JSON/IPN routes. The current-skills extension adds E39 below.
The released transport has verified hosted HTTPS returns and actual provider IPN evidence.
The latest dashboard revision and role queue separation are recorded in implementation-status.md.

See [screen flows](screen-flows.md) for interaction, layout and acceptance rules.

## Access and navigation

Use exactly `CUSTOMER`, `TECHNICIAN` and `ADMIN`. Public registration creates a
customer; selecting a demo login selects a configured account, never its role.
Dispatcher and finance duties belong to ADMIN in this scope.

Public navigation: Home, Services, How FieldOps Works (About), FAQ and Contact.
Authenticated public navigation uses an account avatar menu with dashboard/profile/settings
and confirmed sign-out. Each protected workspace has a responsive shadcn sidebar. Workspace navigation:

| Role       | Primary navigation                                                    | Record access                                           |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| CUSTOMER   | Dashboard, Requests, Work orders, New request, Account                | Own requests, work orders, invoices and payments        |
| TECHNICIAN | Dashboard, Assigned work, Account                                     | Assigned work orders and their nested invoice summaries |
| ADMIN      | Overview, Requests, Work orders, Services, Users, Audit logs, Account | Administrative records and invoice/payment reads        |

Server-side session and role checks must run before protected reads and again for
every action. A navigation filter is only presentation. Backend ownership remains
authoritative: missing authentication is 401, wrong role is 403, another user's
private record is 404. Never expose record existence through a detailed denial.
Use role landing routes `/customer`, `/technician` and `/admin`. A login return path
must be a validated same-origin path permitted for the current role; never accept
an arbitrary redirect URL. Do not create five roles or an admin impersonation flow.

## Route inventory

The API column references the endpoint IDs below. Paths are browser URLs, not
backend endpoints. All dynamic IDs must be parsed before a backend call.

| ID  | Browser route                           | Access                  | Purpose and primary actions                                                               | API IDs                                  |
| --- | --------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| P01 | `/`                                     | Public                  | Explain request → dispatch → completion → verified payment; show real service preview     | E08                                      |
| P02 | `/about`                                | Public                  | Explain the three roles and supported service process; link to catalog                    | None; accurate editorial content         |
| P03 | `/services`                             | Public                  | Search, sort and paginate active services                                                 | E08                                      |
| P04 | `/services/[serviceId]`                 | Public                  | Read service details and base price; customer request CTA                                 | E09                                      |
| P05 | `/faq`                                  | Public                  | Explain scheduling, cancellation, invoice and payment rules                               | None; contract-based content             |
| P06 | `/contact`                              | Public                  | Publish verified support channels and help navigation                                     | None; owner-approved email and phone     |
| A01 | `/login`                                | Public                  | Email/password, verified Google login and three demo account buttons                      | E02, E03                                 |
| A02 | `/register`                             | Public                  | Customer registration; then explicit login                                                | E01                                      |
| S01 | `/account`                              | All three roles         | Read own account; edit name/phone; sign out                                               | E05, E06, E07                            |
| C01 | `/customer`                             | CUSTOMER                | Real own-request/visit dashboard and actionable status drill-down                         | E14                                      |
| C02 | `/customer/requests/new`                | CUSTOMER                | Multistep service, visit details and review form                                          | E08, E09, E13                            |
| C03 | `/customer/requests/[requestId]`        | CUSTOMER owner          | Request summary; edit pending request; cancel eligible request; link assigned work        | E15, E16, E18                            |
| C04 | `/customer/work-orders`                 | CUSTOMER                | Own work list with progress and invoice links                                             | E22                                      |
| C05 | `/customer/work-orders/[workOrderId]`   | CUSTOMER owner          | Read timeline, completion report, invoice and existing feedback; submit eligible feedback | E23, E34                                 |
| C06 | `/customer/invoices/[invoiceId]`        | CUSTOMER owner          | Immutable invoice; billing validation; create or recover checkout                         | E27, E28                                 |
| C07 | `/customer/requests`                    | CUSTOMER                | Own request queue, URL search/status/pagination and new-request entry                     | E14                                      |
| T01 | `/technician`                           | TECHNICIAN              | Real assigned-visit dashboard, status counts and recent work                              | E22                                      |
| T02 | `/technician/work-orders/[workOrderId]` | Assigned TECHNICIAN     | Read task; advance progress; complete with report                                         | E23, E25, E26                            |
| T03 | `/technician/work-orders`               | TECHNICIAN              | Assigned queue, scheduled-start sorting and URL filters                                   | E22                                      |
| D01 | `/admin`                                | ADMIN                   | Period overview, status distribution and verified revenue                                 | E37                                      |
| D02 | `/admin/services`                       | ADMIN                   | Active catalog list; create/edit/delete dialogs                                           | E08, E09, E10, E11, E12                  |
| D03 | `/admin/requests`                       | ADMIN                   | Review queue with URL search/status/service filters                                       | E14                                      |
| D04 | `/admin/requests/[requestId]`           | ADMIN                   | Review, reject, cancel; find qualified available technician and assign                    | E15, E17, E18, E20, E21                  |
| D05 | `/admin/work-orders`                    | ADMIN                   | Global work list and dispatch follow-up                                                   | E22                                      |
| D06 | `/admin/work-orders/[workOrderId]`      | ADMIN                   | Work timeline; eligible reschedule; invoice read and payment link when ID is known        | E23, E24, E27                            |
| D07 | `/admin/users`                          | ADMIN                   | Filter users; change role/status; read and confirmed complete skill replacement           | E35, E38, E39, E19                       |
| D08 | `/admin/audit-logs`                     | ADMIN                   | Paginated audit inspection with supported filters                                         | E36                                      |
| M01 | `/payments/[paymentId]`                 | CUSTOMER owner or ADMIN | Read verified attempt state; return to invoice/work context                               | E29, E27                                 |
| M02 | `/payment/success`                      | CUSTOMER owner or ADMIN | Resolve known attempt and show verified/pending/review state                              | E29, E27; verified 303 browser transport |
| M03 | `/payment/cancel`                       | CUSTOMER owner or ADMIN | Show verified cancellation or unresolved attempt; safe recovery                           | E29, E27; verified 303 browser transport |

No contact submission endpoint, public review feed, technician earnings endpoint,
availability editor, password reset, user creation or deleted-service browser is
present in the current backend. Do not invent these screens, writes or totals.
Payment history cannot be fabricated from a missing list API. M01 needs a known
payment ID, captured from checkout or a supported response; it is not a history page.
Public process and catalog preview are implemented.

## Endpoint coverage

All paths below are relative to the server-only `/api/v1` base URL. Every browser
mutation will go through an explicit validated frontend server boundary. E04 is
session infrastructure. E30–E33 belong exclusively to the provider/backend; the
browser must never post callbacks to manufacture a payment outcome.

| ID  | Method | Backend path                    | Caller and rule                                                               |
| --- | ------ | ------------------------------- | ----------------------------------------------------------------------------- |
| H01 | GET    | `/health`                       | Operational liveness; no product page                                         |
| H02 | GET    | `/health/ready`                 | Operational readiness; no product page                                        |
| E01 | POST   | `/auth/register`                | Public; fixed CUSTOMER; does not log in automatically                         |
| E02 | POST   | `/auth/login`                   | Public; backend returns account and Bearer tokens                             |
| E03 | POST   | `/auth/google`                  | Public verified Google credential; configured origin and audience             |
| E04 | POST   | `/auth/refresh`                 | Session layer; rotate single-use token with coordinated refresh               |
| E05 | POST   | `/auth/logout`                  | Authenticated current session; no body                                        |
| E06 | GET    | `/users/me`                     | All roles; current safe profile                                               |
| E07 | PATCH  | `/users/me`                     | All roles; own name/nullable phone only                                       |
| E08 | GET    | `/services`                     | Public; active, non-deleted catalog                                           |
| E09 | GET    | `/services/:id`                 | Public; active service detail                                                 |
| E10 | POST   | `/services`                     | ADMIN; name, description, integer basePriceMinor                              |
| E11 | PATCH  | `/services/:id`                 | ADMIN; at least one supported field                                           |
| E12 | DELETE | `/services/:id`                 | ADMIN; soft delete; no body                                                   |
| E13 | POST   | `/requests`                     | CUSTOMER; serviceId, description, address, preferredStart                     |
| E14 | GET    | `/requests`                     | CUSTOMER own / ADMIN all; TECHNICIAN forbidden                                |
| E15 | GET    | `/requests/:id`                 | CUSTOMER owner / ADMIN; includes nullable work summary                        |
| E16 | PATCH  | `/requests/:id`                 | CUSTOMER owner; PENDING; latest request version                               |
| E17 | PATCH  | `/requests/:id/review`          | ADMIN; PENDING; version, APPROVE/REJECT and required rejection reason         |
| E18 | POST   | `/requests/:id/cancel`          | CUSTOMER owner / ADMIN; request version and reason; unstarted work only       |
| E19 | PUT    | `/technicians/:id/skills`       | ADMIN; complete replacement; inspected expectedServiceIds precondition        |
| E20 | GET    | `/technicians`                  | ADMIN; active, qualified, available technicians for a visit window            |
| E21 | POST   | `/requests/:id/assignment`      | ADMIN; approved, unassigned request; technicianId/start/end; no version input |
| E22 | GET    | `/work-orders`                  | All roles; backend scopes own / assigned / all                                |
| E23 | GET    | `/work-orders/:id`              | All roles with ownership; timeline and nested invoice/feedback                |
| E24 | PATCH  | `/work-orders/:id/schedule`     | ADMIN; ASSIGNED; work-order version and replacement visit/technician          |
| E25 | PATCH  | `/work-orders/:id/status`       | Assigned TECHNICIAN only; work-order version; next legal status               |
| E26 | POST   | `/work-orders/:id/complete`     | Assigned TECHNICIAN; IN_PROGRESS; version/report; atomic immutable invoice    |
| E27 | GET    | `/invoices/:id`                 | CUSTOMER owner / ADMIN; TECHNICIAN cannot call directly                       |
| E28 | POST   | `/invoices/:id/payment-session` | CUSTOMER owner only; stable Idempotency-Key and billing                       |
| E29 | GET    | `/payments/:id`                 | CUSTOMER owner / ADMIN; verified state, review flags and eligible checkoutUrl |
| E30 | POST   | `/payments/sslcommerz/ipn`      | Provider → backend; server-side validation                                    |
| E31 | POST   | `/payments/sslcommerz/success`  | Provider → backend; JSON acknowledgement, not browser redirect                |
| E32 | POST   | `/payments/sslcommerz/fail`     | Provider → backend; JSON acknowledgement, not browser redirect                |
| E33 | POST   | `/payments/sslcommerz/cancel`   | Provider → backend; JSON acknowledgement, not browser redirect                |
| E34 | POST   | `/work-orders/:id/feedback`     | CUSTOMER owner; COMPLETED, paid invoice, no review hold; once only            |
| E35 | GET    | `/admin/users`                  | ADMIN; safe user directory, no current skill set                              |
| E36 | GET    | `/admin/audit-logs`             | ADMIN; paginated filtered audit trail                                         |
| E37 | GET    | `/admin/overview`               | ADMIN; period aggregates, current technician counts                           |
| E38 | PATCH  | `/admin/users/:id`              | ADMIN; role/status; backend protects last active admin and active assignments |

| E39 | GET | `/technicians/:id/skills` | ADMIN; consistent current set and retained retired-service identities |

## URL and data boundaries

Feature query schemas must allowlist backend parameters. Unknown fields are rejected
by the backend. Frontend-only values such as `returnTo`, wizard step or open dialog
must never be forwarded as API filters. Changing a filter/search/sort resets page
to 1. Preserve other applicable URL state and browser back/forward behavior.

| Dataset                 | Supported query fields                                       | Sort values / constraints                       |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| Services                | q, page, limit, sort                                         | newest, oldest, name_asc, price_asc, price_desc |
| Requests                | q, status, serviceId, page, limit, sort                      | newest, oldest, preferred_start_asc             |
| Work orders             | q, status, serviceId, page, limit, sort                      | newest, oldest, scheduled_start_asc             |
| Technician availability | serviceId, start, end, page, limit                           | Required service and future window; no q/sort   |
| Admin users             | q, role, status, page, limit, sort                           | newest, oldest                                  |
| Audit logs              | entityType, entityId, actorId, action, from, to, page, limit | Backend newest-first; no sort field             |
| Admin overview          | from, to                                                     | Both or neither; no pagination                  |

Pagination defaults to page 1, limit 20; page max 100000, limit max 100. Use the
backend's `pagination.total` and `totalPages`, never the current page length as a
global total. Search is trimmed and limited to 100 characters. Request status is
PENDING/APPROVED/REJECTED/CANCELLED; work-order status is
ASSIGNED/EN_ROUTE/IN_PROGRESS/COMPLETED/CANCELLED. Keep those enums distinct.

Dispatch windows require offset-bearing timestamps, start in the future, increasing
end, at most eight hours and at most millisecond precision. Show times with an
explicit timezone; convert local form values deliberately. Availability is a
snapshot, not a reservation. Paired report dates use a half-open `[from, to)` range
of at most 366 days. Overview defaults to the last 30 days; technician counts are
current, while request/work aggregates use creation time and revenue uses paid time.
Display those meanings next to the figures. Status distribution is supported;
daily revenue trends and personal earnings are not.

Money is BDT minor units. Validate individual numeric amounts as safe integers;
keep aggregate revenue decimal strings exact rather than coercing them through
floating-point Number. Display formatted amounts without recomputing invoice totals.
All returned objects, IDs, query values and mutation inputs need colocated Zod
schemas; infer TypeScript types from schemas rather than duplicating DTO definitions.

## Feature ownership and implementation order

Create modules only when their first real use is implemented. Proposed ownership:
`auth`, `account`, `services`, `requests`, `dispatch`, `work-orders`, `billing`,
`feedback` and `admin`. For example, request schemas, query parsing, server reads,
forms and tests belong together under `features/requests`; dispatch owns availability
and assignment, billing owns invoice/payment rules. Admin pages compose those
features rather than copying their APIs. Route files remain small compositions.

Use `app/(public)`, `app/(auth)` and `app/(workspace)` route groups when layouts are
implemented; groups must not change public URLs. Put role layouts beneath the
workspace group and shared Account/Payment routes beside them. Shared UI contains
shadcn primitives and genuinely reused presentation, never domain policy.
Infrastructure owns environment, transport and the eventual session mechanism.
Do not create empty module trees or a generic endpoint/CRUD framework now.

1. This checkpoint: route/access/API mapping and screen handoff; transport PUT support.
2. Build public/workspace shells and real service browsing with exact preset tokens.
3. Implement secure sessions, registration/login/demo accounts and protected boundaries.
4. Implement customer request wizard, lists and pending edit/cancellation.
5. Implement admin review, qualified dispatch and conflict recovery.
6. Implement technician progress/completion and customer work tracking.
7. Resolve payment-return transport; implement invoice, checkout/recovery and feedback.
8. Implement admin reporting, catalog/user management and audit inspection; inspect actual skills before a confirmed replacement.
9. Complete meaningful browser/integration tests, responsive/accessibility checks and deployment readiness; use the authorized, CI-gated release process.
10. Prepare actual demo credentials, documentation and 5–10 minute walkthrough; maintain at least 20 meaningful frontend commits without padding history.

Each implemented slice must pass checks/build and include its real API and failure
paths before its checkpoint commit. Dependencies, tests and resume claims follow
working features; this document introduces no new package or completed skill claim.
