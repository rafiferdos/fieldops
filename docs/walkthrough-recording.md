# Actual FieldOps walkthrough

Recorded October 9, 2026. The completed MP4 is **6 minutes 19 seconds**, with 23
English-captioned scenes. It is a silent recording of actual browser operations,
not generated narration, mock data presented as API results or a hosted-release claim.
Captions occupy an added footer so they do not cover application controls.

The local artifact is outside Git at
`../delivery/fieldops-walkthrough.mp4` relative to the frontend repository. Its
source recording, safe scene timeline and captions live under
`../delivery/walkthrough/`. Keep authentication traces and provider session URLs
out of public artifacts. Upload the finished file only to an approved submission
or video destination; no external video upload has occurred.

## What the recording demonstrates

| Time        | Actual flow                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------ |
| 00:00–01:23 | Public design, process, accessible FAQ, verified Contact and actual service detail               |
| 01:23–02:28 | Disposable customer, styled service selection, validated visit details, review and owned request |
| 02:28–03:35 | Real admin reporting, versioned approval, qualified availability and assignment                  |
| 03:35–04:34 | Assigned technician, legal progress, completion report and immutable invoice                     |
| 04:34–05:31 | Encrypted checkout intent, actual SSLCommerz sandbox card/OTP and server-verified paid invoice   |
| 05:31–06:19 | Paid-service feedback, narrow-screen presentation and explicit verification limits               |

Assertions confirm actual route identities, completed work, PAID invoice and saved
five-star feedback. The helper selects an available qualified demo technician
without overwriting existing skills. It creates a new customer and owns only its
new request. Eligible unfinished requests are cancelled on cleanup; completed work,
invoices, paid reviews and audits remain in the isolated test database.

The provider card and OTP are official synthetic sandbox inputs. Merchant keys,
backend tokens, Redis credentials and account passwords never enter captions. The
recording uses a local production frontend and a separate `fieldops_payment_test`
database. The loopback browser return is real; hosted HTTPS/IPN are separate gates.

## Reproduce deliberately

Install from the lockfile, start matching production frontend/backend and configure
private ignored disposable-demo settings. APP_ORIGIN must match at build/runtime.
The existing Playwright Chromium runtime and Node 24 are required. No additional
runtime package or recording SDK is added.

```bash
E2E_BASE_URL=http://localhost:3002 \
E2E_ENV_FILE=.env.payment-test.local \
E2E_LIVE_WRITES=1 E2E_REAL_SANDBOX=1 WALKTHROUGH_RECORD=1 \
WALKTHROUGH_OUTPUT_DIR=../delivery/walkthrough \
npx playwright test --config=playwright.walkthrough.config.ts

node scripts/walkthrough/render-video.ts \
  ../delivery/walkthrough/record-record-an-actual-request-to-paid-feedback-walkthrough \
  ../delivery/fieldops-walkthrough.mp4
```

Rendering requires the installed `ffmpeg`/`ffprobe` tools. The script validates its
scene timeline and 5–10 minute duration, trims setup lead-in and renders fixed-size
captions in a separate footer. Its child-process arguments do not invoke a shell.
The configuration is separate from regression tests, disabled without deliberate
opt-in and records no authentication trace. Respect the backend login window;
do not record concurrently with authenticated regression groups.

Inspect the finished duration and representative public, request, payment and
mobile frames before sharing. Optional human narration may be added during final
review; the current artifact contains English captions and no audio track.
