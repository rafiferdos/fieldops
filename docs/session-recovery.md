# Local session dependency and recovery

## Diagnosed incident

On 10 October 2026, localhost had an existing session cookie while its Docker daemon
was unavailable. Redis at the configured loopback port 6397 could not be reached.
An anonymous page still loaded, but reading the retained session caused a server-render
failure. A development-only ThemeProvider warning appeared during client recovery.

Docker logs showed NAT initialization failure, and both `iptable_nat` and `overlay`
were missing for the running `7.2.9-1-cachyos` kernel. Installed modules belonged to
`7.2.9-2-cachyos` and the separate LTS kernel. This is a host kernel/update mismatch,
not an application route, password or backend API issue. The owner must restart into
an installed matching kernel before Docker can be verified again. No firewall settings,
backend files, credentials, cookies or persistent volumes were changed.

## Application behavior

Session-storage connection/read failures have a sanitized typed error. Public, auth
and workspace layouts handle that expected dependency condition with the same shadcn
recovery screen. The Reload button performs a safe new read without clearing cookies
or replaying mutations. Unknown authentication errors still reach the error boundary.

`getViewer` and `requireViewer` continue to fail closed. A store outage is not treated
as an expired session or as permission to read private records. The dashboard transport
retains its 503 JSON response and `private, no-store` headers. Anonymous browsing does
not acquire an unnecessary dependency on Redis.

The [upstream next-themes issue](https://github.com/pacocoursey/next-themes/issues/397)
matches the observed client-created script warning. The supported `scriptProps` API
keeps its bootstrap executable during SSR/initial hydration and inert as `text/plain`
on client renders. A server snapshot from `useSyncExternalStore` keeps hydration
consistent. Existing provider effects still own preference/system updates; the library
and no-flash bootstrap are preserved, with no dependency fork or console suppression.

## Verification

- Four unit scenarios cover anonymous browsing, outage versus expired state, denied
  protected reads and propagation of unexpected authentication errors.
- Actual local outage browsing covers public/login/account/admin recovery, retained
  cookies, safe Reload, inaccessible dashboard controls and a 503 private transport.
- Browser theme checks cover a saved dark preference, a light toggle, client navigation
  and reload persistence without console errors.
- Formatting, strict TypeScript, linting and all 190 ordinary unit checks pass. The
  normal Turbopack production build and a separate Webpack build both pass. Six
  real-Redis checks remain skipped locally while the Docker daemon is unavailable.
- The outage browser scenario requires `E2E_SESSION_OUTAGE=1` and an isolated unavailable
  Redis endpoint. It must not be pointed at the live application or achieved by stopping
  a shared production/local store.

The current host is already unavailable, so the reproduced incident checks did not stop
the owner's database. Normal authenticated local acceptance remains pending until the
owner restarts and the documented session container is healthy.
