# Assignment 7 submission pack

Reviewed October 9, 2026. Both applications are live. Exact release and acceptance
proof is in [hosted release evidence](hosted-release.md). External video upload and
portal submission remain separate delivery actions.

## Project links

| Artifact         | Actual reference                                                                | State                                                                               |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Frontend source  | https://github.com/rafiferdos/fieldops                                          | Current source release; inspect the selected SHA in Frontend CI                     |
| Frontend CI      | https://github.com/rafiferdos/fieldops/actions/workflows/ci.yml                 | Exact selected revision must pass before deployment                                 |
| Backend source   | https://github.com/rafiferdos/fieldops-api                                      | Skills/payment release 7bf1e41 deployed                                             |
| Backend CI       | https://github.com/rafiferdos/fieldops-api/actions/runs/37908940023             | Passed for deployed 7bf1e41                                                         |
| Backend API      | https://fieldops-api-xu3s.onrender.com/api/v1                                   | Live; health/readiness and actual current-skills routing verified                   |
| Frontend domain  | https://fieldops-rafiferdos.vercel.app                                          | Live; deployed b03d4c4 passed CI run 37908860373                                    |
| Requirements     | https://github.com/Apollo-Level2-Web-Dev/B7A7/blob/main/project-requirements.md | Authoritative                                                                       |
| Backend contract | https://app.notion.com/p/3f34ab5df14481afa4acc3e9a092b940                       | Historical contract; authorized skills/browser extension documented in repositories |

## Requirement evidence

- 29 functional route templates covering public content, catalog, authentication,
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
- A completed 6:19 actual UI walkthrough has 23 English-captioned scenes and uses
  disposable local data. See [recording and reproduction](walkthrough-recording.md).
  The artifact identifies loopback verification; external upload is pending.

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
