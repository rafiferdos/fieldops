# Account and catalog photos

Profile photos and service photos come from actual API image references. This slice adds optional photos without changing ownership, role, scheduling or billing rules. Older backend responses without image fields are parsed as `null` during coordinated rollout.

## Configuration

Deploy the backend's additive media migration and upload API first. Configure its `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` together, with upload permission. Set only the matching public cloud name as `IMAGE_CLOUD_NAME` in the frontend environment and rebuild. No provider API key/secret belongs in the frontend or `NEXT_PUBLIC_*` variables.

The optimizer permits HTTPS delivery from that cloud's versioned `fieldops` namespace only, with no query string or redirects. [Backend upload, ownership and lifecycle guide](https://github.com/rafiferdos/fieldops-api/blob/main/docs/media-images.md) describes the API contract and provider setup. Hosting configuration and deployment require their own verified release; the executed result is recorded below.

## Supported workflows

- Every role can upload a profile photo in Account, preview it locally and save the confirmed image reference with their contact details. The account menu and administrator user directory display that saved photo.
- Administrators can upload a service photo in the create/edit sheet. Public catalog cards, public service details and administrator catalog cards use the saved image.
- JPEG, PNG and WebP are supported up to 3 MiB. The backend additionally verifies actual bytes and provider decoding. Uploading alone does not attach an image; Save applies the change. Remove also requires Save.
- Existing missing photos and failed delivery receive reserved-layout fallbacks. Profile images use initials; catalog images explicitly indicate unavailability. No synthetic customer portrait is substituted.

## Transport and interaction policy

The same-origin multipart route checks browser origin, authenticates the server session, rejects additional/duplicate fields and bounds the actual stream rather than trusting Content-Length. Bearer credentials stay in the server-to-backend request. The route forwards only the file and its `AVATAR`/`SERVICE` purpose, never a client-selected owner.

The shared shadcn upload control provides local preview, labelled progress and readable validation errors. Byte transfer progress stops at 95% until the server confirms the upload. Parent forms disable Save and service-sheet dismissal during upload. Preview object URLs are revoked after use. Uncertain uploads are never automatically retried and leave the saved image unchanged. Provider operations can leave an unreferenced image if a form is abandoned; removal does not delete the provider asset automatically.

Automatic card entry effects use compositor animations without changing streamed HTML attributes before hydration. Explicit Reveal compositions and smooth scrolling retain GSAP. Development Server Function argument logging is disabled to keep authentication credentials out of terminal logs; normal diagnostics remain enabled.

## Verification

Unit checks cover accepted files, URL restrictions, multipart byte bounds, trusted origins, role rejection and server-only Bearer forwarding. Real Redis checks cover existing session coordination independently of the provider. Production builds validate route/type boundaries.

Real Cloudinary/browser checks must separately establish upload permissions, provider processing, optimizer delivery, save/reload and removal. These use dedicated disposable accounts and isolated PostgreSQL/Redis, not existing customer records. Desktop and mobile delivery should be checked before release. Record executed results and remaining hosted rollout limits here; unit mocks alone are not upload evidence.

### Executed local checkpoint — October 10, 2026

| Verification                                 | Result                                                           |
| -------------------------------------------- | ---------------------------------------------------------------- |
| Format, strict types and lint                | Passed                                                           |
| Vitest with dedicated real Redis             | 212 checks passed, including six refresh-coordination checks     |
| Default Turbopack production build           | Passed                                                           |
| CUSTOMER / TECHNICIAN / ADMIN profile photos | Real upload, optimizer delivery, save, reload and removal passed |
| Unsupported SVG selection                    | Client validation passed; saved image unchanged                  |
| Administrator catalog photo                  | Real upload, service creation and public detail delivery passed  |
| Mobile catalog at 390px                      | Real optimized photo loaded; screenshot inspected                |
| Runtime/hydration diagnostics                | No errors in completed image flows                               |
| Development action arguments                 | No Server Function argument logs after disabling that logging    |

The browser checks used the real Cloudinary account with dedicated local accounts and isolated PostgreSQL/Redis; backend unit/integration provider mocks were not substituted for this evidence.

### Executed hosted release — October 10, 2026

| Application | Deployed revision                          | CI and release                                                                                                                   |
| ----------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Frontend    | `ee0f4dd541faa8ea09a3f8b993a77b0ae3155c29` | [38050365588](https://github.com/rafiferdos/fieldops/actions/runs/38050365588); Vercel `dpl_5gyHKBxWvsJpwbLnMzfJEy2xLkNc`, Ready |
| Backend     | `35ed3df4abed29001ff4ae15f17a4c7b323e566a` | [38050362076](https://github.com/rafiferdos/fieldops-api/actions/runs/38050362076); Render `dep-db52jvqd0e5s73dvtuvg`, Live      |

The backend applied its additive migration and passed readiness before the frontend release. Cloudinary upload credentials remain in Render; Vercel has only the public `IMAGE_CLOUD_NAME` configuration. The canonical alias is [fieldops-rafiferdos.vercel.app](https://fieldops-rafiferdos.vercel.app). Existing session encryption, Redis and Google settings were preserved.

| Hosted check                                                | Result                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Fresh disposable CUSTOMER login                             | Passed against the actual API                                                                |
| Profile upload through frontend proxy                       | Real Cloudinary upload passed                                                                |
| Profile save, reload, optimized display, remove/save/reload | Passed                                                                                       |
| Administrator catalog upload/create and public reads        | Passed through the actual backend API                                                        |
| Frontend catalog and public detail photo                    | Real Next.js optimized image loaded                                                          |
| Mobile detail at 390px                                      | Photo loaded; no horizontal overflow; screenshot inspected                                   |
| Role/ownership boundary                                     | CUSTOMER service upload rejected `403`; foreign/purpose-mismatched attachment rejected `400` |
| Completed browser diagnostics                               | No runtime/hydration errors or console warning/error entries                                 |

The administrator's existing profile was not changed. Cleanup cleared the test service's photo and soft-deleted it (`404` on public detail), suspended the new customer, revoked test sessions and deleted both exact disposable provider assets. Audit/media history remains. Existing customer work and payments were untouched. Safe screenshots are in the parent workspace's `delivery/media-images/` folder, outside public Git.

This focused hosted check did not repeat payment settlement, interactive Google consent, every role's photo UI, a full regression suite or real Safari/mobile hardware tests. All-role image UI checks have the separate local evidence above. No bulk hosted demo seed was run. Existing records with no photo still require an authorized upload; generated editorial scenes do not impersonate actual customers. Documentation-only commits after the released revisions do not change deployed application code.
