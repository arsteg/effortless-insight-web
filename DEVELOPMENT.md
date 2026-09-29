# Local development memory

Run `npm run dev` for web and `npm run dev -- --port 3001` in the admin project.
Both development scripts use Webpack and pass a 2048 MB old-generation heap
budget through `NODE_OPTIONS` to Next's server child. Next otherwise allocates
half of physical RAM as the default budget. Total process memory can exceed
2048 MB because the young generation, native allocations and compiler buffers
are separate. Restart existing dev servers after changing these scripts.

The Next configuration enables `experimental.webpackMemoryOptimizations`.
This trades some compilation speed for lower compiler memory. Production build
and start commands are unchanged. No dependencies need reinstalling.

## Investigation (2026-09-29)

The existing web `.next/dev/trace` recorded six
`server-restart-close-to-memory-threshold` events, with approximately 6.4–6.6 GiB
of used JavaScript heap against an 8.05 GiB limit. Recorded RSS reached 7.26 GiB.
The web server used Next 16.2.9's default Turbopack compiler, while admin already
used Webpack. The web process also accumulated CPU time while idle. These
observations identify development-server pressure, but do not establish a
specific CA application-code leak or prove that the branch introduced it.

The Webpack workaround and smaller heap budget avoid the observed Turbopack
path and prevent a single dev server from growing its JS heap to about 8 GiB.
The limit is a guardrail, not a cure for every possible leak: prolonged growth
could still cause a server restart or out-of-memory error.

Validation: both servers start; login on both apps and web dashboard,
clients/invite, notices and select-plan compile and return HTTP 200. Protected
pages were compilation smoke tests with a placeholder session cookie, not
authenticated business-flow tests. Both startup traces report a 2348810240-byte
total V8 heap limit (old-generation budget plus V8 overhead). Long-duration
authenticated navigation and editing have not been profiled.
