# AGENTS.md

## What This Is

`@lumieducation/h5p-shared-state-server` is a standalone TypeScript/Node.js
package that adds real-time, multi-user shared-state capabilities to
[h5p-nodejs-library](https://github.com/Lumieducation/H5P-Nodejs-library),
the community Node.js/TypeScript re-implementation of the H5P server. It was
extracted from that monorepo (where it was maintained as an experimental
component) into this repo so it can be released independently.

It is a single npm package, not a monorepo: `src/` is the package itself,
`example/` is a separate, self-contained runnable demo app (its own
`package.json`, not an npm workspace of this repo).

## How It Works

The package wraps [ShareDB](https://share.github.io/sharedb/) (operational
transformation over WebSockets) with H5P-specific authentication,
authorization, and validation:

- **`SharedStateServer`** (`src/SharedStateServer.ts`) — the main entry
  point. Takes an HTTP server, callbacks to read library/content data from
  the host H5P system, and sets up a ShareDB server + WebSocket upgrade
  handler.
- **Middleware pipeline** (`src/middleware/`) — runs on every ShareDB op/
  commit: inject the authenticated user (`injectUser`), inject content
  permission context (`checkPermissionsAndInjectContentContext`), validate
  ops/snapshots against JSON Schema (`validateOpSchema`,
  `validateCommitSchema`), and run declarative logic checks
  (`performOpLogicChecks`, `performCommitLogicChecks`).
- **`LogicChecker`** (`src/LogicChecker.ts`) — evaluates the custom,
  Mongo-query-inspired + JSONPath-based logic check language described in
  `README.md` (content-type authors use this to restrict which ops/snapshots
  are allowed).
- **`ValidatorRepository`** (`src/ValidatorRepository.ts`) — loads and caches
  `opSchema.json` / `snapshotSchema.json` / `opLogicCheck.json` /
  `snapshotLogicCheck.json` files from library directories via the host
  system's library storage.

See `README.md` for the full design write-up (user stories, architecture,
logic check syntax with examples) and `Architecture.svg` for the diagram.

This package only provides the server-side piece. It is consumed by a host
H5P integration (an app using `@lumieducation/h5p-server` /
`@lumieducation/h5p-express`) that supplies an HTTP server, a user-auth
callback, and content/library accessors — see `example/` for a working
reference wiring.

## Build, Test, Lint

```bash
npm install
npm run build          # tsc -> build/
npm run build:watch    # tsc -w
npm test               # vitest run
npm run lint           # eslint .
npm run format:check   # prettier --check
npm run format         # prettier --write
```

Run a single test file with vitest's filename filter, e.g.:

```bash
npx vitest run LogicChecker
```

### Example app

`example/` is a separate package (own `node_modules`, own `package.json`)
that depends on this package via `"file:.."`. It ports the
`h5p-rest-example-server` demo from h5p-nodejs-library, trimmed to a plain
filesystem-backed `H5PEditor`/`H5PPlayer` plus `SharedStateServer` wiring —
no MongoDB/S3/ClamAV/SVG-sanitizer extras.

```bash
cd example
npm install   # also downloads H5P core/editor JS+CSS via download-core.sh
npm start     # listens on :8080 by default
```

It exposes the same REST surface as `h5p-rest-example-server`
(`/h5p/*`, `/login`, `/logout`, `/auth-data/:contentId`), so for a browser
UI, run `h5p-rest-example-client` from the h5p-nodejs-library monorepo
against it instead of duplicating a client here — see `example/README.md`
for exact steps. Do not add a bundled browser client to this repo; reuse the
one in h5p-nodejs-library.

**Gotcha:** `example/`'s own `node_modules` nests its own copy of `express`
independent of `@lumieducation/h5p-express`'s internal `express` dependency.
Do not add an `overrides.express` entry to `example/package.json` — h5p-express
still relies on Express 4's `path-to-regexp` route syntax (e.g.
`/:file(*)`), which breaks under Express 5. Only
`@types/express-serve-static-core` needed pinning, and that's a dev-only
type fix that doesn't affect runtime resolution.

## Code Style

- **4-space indentation**, single quotes, no trailing commas, LF line endings
  (see `.prettierrc`)
- `no-param-reassign`: **error** — never reassign function parameters
- `no-console`: **warn**
- `any` is allowed but discouraged
- Unused params: prefix with `_` (e.g., `_actingUser`)
- Member ordering: constructors first, then static, then instance; public
  before private (enforced by `@typescript-eslint/member-ordering` in
  `eslint.config.mjs`)
- Files under `example/h5p/` (downloaded H5P core/editor vendor JS) are
  excluded from lint — do not attempt to fix lint errors there.

## Naming Conventions

- **Classes:** PascalCase (`SharedStateServer`, `LogicChecker`)
- **Files:** PascalCase matching class name, camelCase for middleware
  functions (`src/middleware/injectUser.ts`)
- **Tests:** `ClassName.test.ts` in `test/`

## Git Hooks & Commits

Husky runs on every commit/push:

- **pre-commit:** `npm run lint` + `npm run format:check`
- **commit-msg:** commitlint (conventional commits, see
  `commitlint.config.js`)
- **pre-push:** `npm run test`

Commit format: `type(scope): description`
Types: `feat`, `fix`, `chore`, `test`, `refactor`, `docs`, `style`, `perf`
Example: `fix(sharedstateserver): reject ops without a valid content context`

## Release

Versioning and publishing are fully automated by
[semantic-release](https://semantic-release.gitbook.io/), configured in
`.releaserc.json` — the single-package equivalent of how the
h5p-nodejs-library monorepo uses `lerna version --conventional-commits` +
`lerna publish`. There is no manual version bump and no `NPM_TOKEN`.

**To cut a release:** merge/fast-forward `main` into the `release` branch and
push it. `.github/workflows/release.yml` triggers on push to `release` and
runs `npx semantic-release`, which:

1. Reads conventional-commit messages since the last release tag (`feat:` →
   minor, `fix:` → patch, `BREAKING CHANGE:` → major; `chore:`/`docs:`/etc.
   don't trigger a release) — commit format is already enforced by
   commitlint (see above), so this "just works" off normal commit hygiene.
2. Bumps `package.json`, updates `CHANGELOG.md`, commits both back to
   `release` with `[skip ci]`, and creates the git tag.
3. Publishes to npm via `@semantic-release/npm`, authenticated with npm's
   OIDC trusted publishing (`id-token: write` permission) — no stored token.
4. Creates a GitHub Release with generated notes.

If there are no release-worthy commits since the last release, the workflow
runs and exits without publishing anything — this is expected, not a
failure.

### OIDC / trusted-publishing requirements

- npm >= 11.5.1 and `@semantic-release/npm` >= 13 (both pinned in this repo
  already) — older versions don't support OIDC and fail with `ENONPMTOKEN`.
- `actions/setup-node` in `release.yml` deliberately omits `registry-url`:
  setting it writes an auth-token line into `.npmrc` even with no
  `NODE_AUTH_TOKEN` configured, which breaks the OIDC flow (see
  [actions/setup-node#1440](https://github.com/actions/setup-node/issues/1440)).
  Do not add `registry-url` back to fix some unrelated auth issue — it will
  reintroduce this one.
- a trusted publisher must be configured on the package's npmjs.com settings
  page, pointing at this repo and the `release.yml` workflow filename. If
  that link is ever removed or the workflow file is renamed/moved, publish
  will fail until it's reconfigured on npmjs.com.

## Relationship to h5p-nodejs-library

This package depends on `@lumieducation/h5p-server` as a regular npm
dependency (not a workspace link) — treat version bumps there like any other
external dependency. If a change here requires a not-yet-released
`h5p-server` feature, coordinate versions explicitly rather than assuming
workspace-style instant availability.
