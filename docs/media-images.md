# Account and catalog photos

Profile photos and service photos come from actual API image references. This slice adds optional photos without changing ownership, role, scheduling or billing rules. Older backend responses without image fields are parsed as `null` during coordinated rollout.

## Configuration

Deploy the backend's additive media migration and upload API first. Configure its `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` together, with upload permission. Set only the matching public cloud name as `IMAGE_CLOUD_NAME` in the frontend environment and rebuild. No provider API key/secret belongs in the frontend or `NEXT_PUBLIC_*` variables.

The optimizer permits HTTPS delivery from that cloud's versioned `fieldops` namespace only, with no query string or redirects. [Backend upload, ownership and lifecycle guide](https://github.com/rafiferdos/fieldops-api/blob/main/docs/media-images.md) describes the API contract and provider setup. Local verification does not deploy this slice or configure hosting secrets automatically.

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

The browser checks used the real Cloudinary account with dedicated local accounts and isolated PostgreSQL/Redis; backend unit/integration provider mocks were not substituted for this evidence. The verified image slice is not deployed yet. Hosting credentials, migration/release sequencing and hosted upload verification remain required. Existing records with no photo still require an authorized upload; no bulk production demo-data seeding was performed.
