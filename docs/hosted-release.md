# Hosted FieldOps release

Verified October 9, 2026. The website is live at
[fieldops-rafiferdos.vercel.app](https://fieldops-rafiferdos.vercel.app), backed by
the existing [versioned API](https://fieldops-api-xu3s.onrender.com/api/v1).

## Released source

| Application | Deployed revision                          | Successful CI                                                                      | Release identity                                                           |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Frontend    | `b03d4c4e1b847a03a08c826cefe5a7b368990a85` | [37908860373](https://github.com/rafiferdos/fieldops/actions/runs/37908860373)     | Vercel `dpl_E1wSGVGePkzKeKZMgLLvc6yxpVms`, READY, canonical alias verified |
| Backend     | `7bf1e41fdb257ead94365ba532dc86497cc563ef` | [37908940023](https://github.com/rafiferdos/fieldops-api/actions/runs/37908940023) | Render `dep-db4atv7lot8c738dsr4g`, Live                                    |

Both releases use Node 24. Vercel functions run in Singapore (`sin1`); its build
machine location is a separate concern. Manual releases use exact CI-passed source
revisions. Subsequent documentation commits do not change deployed application code.
No database model, migration or production reset was introduced.

## Configuration and account isolation

The owner explicitly approved Free Marketplace Terms and the protected upload of
fresh session configuration and three new dedicated evaluation accounts. The Free
Singapore Upstash database is separate from backend catalog caching, uses native
authenticated TLS and has eviction disabled. Only its required native connection
URL is retained in protected production settings; the unused integration connection
was removed without deleting the database. Four actual Redis coordination tests
pass. No extra provider SDK, paid plan or recurring charge was added.

All eleven required production values are configured; encryption, session connection
and evaluation credentials are sensitive server-only variables. Backend database,
JWT and gateway credentials were not uploaded to Vercel. Actual login verifies all
three dedicated roles, and the new evaluation technician is qualified for a current
service. Existing operator credentials were not copied to the host.

The existing Google client retains its localhost origins and the approved canonical
HTTPS origin. Google Identity Services uses the supported FedCM button flow with
automatic account selection disabled. The owner confirmed successful hosted Google
login after this correction; it is a user-verified result, not an automated OAuth test.

## Acceptance results

- Hosted Chromium baseline: 33/34 scenarios passed, retries disabled. The only
  failure detected a generic expiration header missing the Secure flag required
  by a __Host- cookie. Redis revocation already denied access; the correction also
  removes the browser cookie. The final source passes self-revocation and all three
  demo-role cookie/logout scenarios (4/4, 2.5 minutes). All current scenarios have
  passing results across these runs; no single full passing run is claimed.
- Real hosted sandbox flow passes again on the final revisions (1/1, 1.7 minutes):
  cancellation, explicit replacement, verified HTTPS success return, paid feedback,
  uncertain-response inspection, old-attempt safety and reauthentication.
- Actual Render logs show provider IPN for both attempts. Successful IPN is verified
  before browser success return. A read-only check of the owned disposable payment
  confirms BDT 1,500.00, one SETTLED receipt, one PAYMENT_SETTLED event, one
  INVOICE_PAID event and identical settlement/paid timestamps. No callback was forged
  and no live funds were used. A verified notification alone is not a paid invoice.
- Public metadata, ownership boundaries, shadcn interactions, responsive themes,
  motion/contrast and automated WCAG A/AA checks pass in the hosted baseline.
- Frontend CI passes all 170 checks including six real Redis tests; backend CI
  passes 129 unit and 474 database integration checks, documentation contracts,
  native build and compiled flow.

Hosted Lighthouse 13.5 samples: mobile 87/100/100/100 and desktop
100/100/100/100 (performance/accessibility/best practices/SEO). Mobile LCP is 3.7s,
TBT 90ms and CLS 0; desktop LCP is 0.5s, TBT 0ms and CLS 0. These are warm-host
lab samples, not field Core Web Vitals. Render Free may delay a cold request by
50 seconds or more. Actual Safari/mobile hardware, live-mode funds, distributed
failover and a long-running token-expiry journey are not claimed.

## Handoff

Sanitized payment proof, callback logs, screenshots and lab reports are saved in
the workspace's `delivery/` folder outside public Git. The completed 6:19 walkthrough
uses actual local disposable work with 23 English-captioned scenes. External video
upload and portal submission have not occurred. Evaluation credentials are in an
ignored private file and belong only in the private submission channel.

References: [Google FedCM migration](https://developers.google.com/identity/gsi/web/guides/fedcm-migration),
[Upstash native compatibility](https://upstash.com/docs/redis/overall/compatibility),
[secure cookie rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).
