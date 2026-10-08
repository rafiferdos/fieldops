# Feature modules

Add a feature folder when implementing its first real workflow. Keep its components,
API schemas, input schemas, types and hooks together. For example, `service-requests/`
may contain `components/`, `schemas/`, `api/` and `hooks/` as they become necessary.
Do not create empty domain modules or generic CRUD abstractions in advance.

Routes in `src/app` compose features. Features may depend on shared UI and
infrastructure; shared code must not import features or routes. Keep server-only API
code outside Client Component imports. Extract shared hooks only after real reuse.
