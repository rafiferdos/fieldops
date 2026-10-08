# Feature modules

Add a feature folder when implementing its first real workflow. Keep its components,
API schemas, input schemas, types and hooks together. Current modules are auth, account, services, marketing, requests, dispatch and work-orders.
Marketing composes public presentation and server catalog reads; it has no operational writes.
Use meaningful component nesting and add schemas/hooks folders only as needed.
Do not create empty domain modules or generic CRUD abstractions in advance.

Routes in `src/app` compose features. Features may depend on shared UI and
infrastructure; shared code must not import features or routes. Keep server-only API
code outside Client Component imports. Extract shared hooks only after real reuse.
