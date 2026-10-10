# Assignment 7 submission pack

Reviewed October 10, 2026. Both applications are live. Current component release
proof is in [React Bits integration](react-bits.md); the earlier acceptance record
is [hosted release evidence](hosted-release.md). The renewed
[full-stack requirements review](full-stack-review.md) identifies remaining
conformance and video work. This prepared pack is not a completion or submission claim.

## Project links

| Artifact          | Actual reference                                                                           | State                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Frontend source   | https://github.com/rafiferdos/fieldops                                                     | Current source release; inspect the selected SHA in Frontend CI                     |
| Frontend CI       | https://github.com/rafiferdos/fieldops/actions/workflows/ci.yml                            | Exact selected revision must pass before deployment                                 |
| Backend source    | https://github.com/rafiferdos/fieldops-api                                                 | Skills/payment release 7bf1e41 deployed                                             |
| Backend CI        | https://github.com/rafiferdos/fieldops-api/actions/runs/37940326850                        | Passed for current 1faf01a; runtime remains the deployed skills/payment release     |
| Backend API       | https://fieldops-api-xu3s.onrender.com/api/v1                                              | Live; health/readiness and actual current-skills routing verified                   |
| Frontend domain   | https://fieldops-rafiferdos.vercel.app                                                     | Live cd2068c; default build and all 185 checks pass CI 38024046107                  |
| API documentation | https://github.com/rafiferdos/fieldops-api/blob/main/docs/fieldops.postman_collection.json | Complete importable collection, with a linked endpoint/workflow guide               |
| Requirements      | https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/project-requirements.md            | Authoritative                                                                       |
| Backend contract  | https://app.notion.com/p/3f34ab5df14481afa4acc3e9a092b940                                  | Historical contract; authorized skills/browser extension documented in repositories |

## Requirement evidence

- 31 functional route templates covering public content, catalog, authentication,
  account, owned requests/work/invoices/payments and role-scoped administration.
  Utilities and record multiplicity do not inflate the page count.
- Three fixed roles and demo-entry buttons. New dedicated production evaluation
  accounts and protected values are configured; actual role, cookie/logout and
  wrong-role verification pass. Public clients cannot choose their own role.
- Actual API reads/writes, URL list state, strict boundary schemas, a validated
  three-step request wizard, skeletons, empty/error/recovery states and metadata.
- Preset shadcn controls, accessible themes/navigation, editorial cards, scoped GSAP
  motion and reduced-motion behavior. No native Select replacement or fake payment
  success is used.
- Real sandbox cancellation, explicit replacement, verified payment and eligible
  feedback pass locally and on hosted HTTPS. Actual provider IPN and a single
  immutable settlement are verified independently through safe logs/database reads.
- Frontend 170 CI checks and passing results for every current Chromium scenario
  across the hosted baseline and affected focused reruns. Exact run composition
  is recorded; no all-passing single full 34-scenario run is claimed. The owner
  additionally verified hosted Google login after the supported consent update.
- Meaningful source checkpoints are in Git history. Count actual frontend commits
  after final publishing; do not manufacture commits to meet a number.
- An existing 6:19 actual UI walkthrough has 23 English-captioned scenes and uses
  disposable local data. See [recording and reproduction](walkthrough-recording.md).
  It predates the current design and still needs the required architecture,
  Network/caching and error-explanation coverage. A separate backend API walkthrough,
  external upload and portal submission remain pending.

## Private evaluation information

Provide the three dedicated evaluation account emails/passwords only in the private
submission channel. Confirm actual roles through backend login before sharing. Do
not commit credentials, backend tokens, merchant settings or Redis keys to public
source, documentation, screenshots or video. Demo buttons execute server-side login
using protected settings; they do not reveal their passwords to the browser bundle.

The admin is an evaluation account with broad duties under the assignment's three-role
model. Use disposable work and treat its access accordingly. Do not distribute real
operator credentials as evaluation shortcuts.

## Final handoff

Release/CI URLs and hosted acceptance outcomes are recorded above. Add an accessible
video link or approved file upload, the private demo credentials and verification limits.
Review the actual 5–10 minute clip before submitting. Portal submission has not been
requested or performed; a prepared pack is not a submitted assignment.
