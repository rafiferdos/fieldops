# Dispatch and execution implementation plan

Reviewed October 8, 2026 against the official B7A7 requirements, the implemented
Notion API contract and backend controllers, schemas, selects and domain services.
This checkpoint covers roadmap steps 5 and 6. The backend remains read-only.

## Design and composition

- Requests owns the shared customer/admin queue and request summary. Dispatch owns
  review decisions, qualified availability, assignment and unstarted rescheduling.
- Work orders owns role-scoped queues, details, timeline, invoice/feedback summaries
  and technician progress/completion. Routes compose these features.
- Reuse installed shadcn cards, form controls, badges, Sheet, AlertDialog and Toast.
  No additional runtime dependency is needed. Server Components own reads; bounded
  client forms handle writes. All external data and action inputs use Zod.
- Give each mini-feature a concise intent comment and document constraints at the
  relevant decision. Avoid comments that merely restate the code.

## Business rules and recovery

1. Review only PENDING requests using their request version. Rejection requires a
   3–500 character reason. Review and cancellation remain separate operations.
2. Assign only APPROVED requests without work. Search future offset-bearing windows
   of at most eight hours. Availability is paginated URL state, never a reservation;
   changing the window clears technician selection. Assignment has no version field.
3. Reschedule only ASSIGNED work on an APPROVED request, using the work version and
   fresh qualified availability. Preserve the immutable agreed price. The availability
   endpoint includes the existing booking; it cannot exclude the current work ID.
4. Technician transitions are ASSIGNED → EN_ROUTE → IN_PROGRESS. Only IN_PROGRESS
   can complete with a 10–2000 character report. The backend atomically creates the
   unique invoice. Do not expose arbitrary transitions or admin execution controls.
5. Preserve inputs on conflicts/unknown results. Dispatch requires a fresh record and
   availability read plus explicit reselection. Technician recovery explicitly reads
   current work before enabling another action; it never automatically repeats a write.
6. Customer tracking displays separately the request review state, work status,
   confirmed schedule, assigned technician, completion report, latest 100 timeline
   events, immutable invoice summary and existing feedback. Payment initiation and
   feedback submission remain step 7; do not add nonfunctional links or controls.

## Verification gates

- Unit tests cover exact scheduling bounds, input allowlists, legal transitions,
  role destinations and recovery classification. Existing Redis tests remain intact.
- Real browser checks use dedicated demo roles and newly created disposable requests.
  Cover approval/rejection, qualified dispatch, stale review, scheduling collision,
  reschedule, technician progression/completion, customer visibility and foreign privacy.
  Never progress or complete an unrelated pre-existing work order.
- Run formatting, typed lint, TypeScript, tests and production build at each meaningful
  checkpoint. Record real execution separately from mocked boundary tests. Keep all
  credentials local, stop test resources and commit verified slices without pushing.
