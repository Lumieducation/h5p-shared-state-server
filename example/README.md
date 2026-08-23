# h5p-shared-state-server example

A minimal Express server showing how to wire `SharedStateServer` into an
h5p-nodejs-library based application (`@lumieducation/h5p-server` +
`@lumieducation/h5p-express`), ported from the `h5p-rest-example-server`
package that used to live alongside this one in the h5p-nodejs-library
monorepo.

## Setup

```bash
npm install
```

`npm install` downloads the H5P core/editor JS+CSS client files into `h5p/`
via `download-core.sh` (runs automatically as a `postinstall` step).

## Run

```bash
npm start
```

The server listens on port 8080 by default (`PORT` env var to override).
Log in as one of the example users defined in `src/index.ts` (e.g.
`teacher1`/anything) via `POST /login`, then create H5P content with a
content type that uses the shared-state client (`serverUrl` /
`auth` entries in `config.json`) to see real-time multi-user state in action.

## Browser client

This is a server-only example — it exposes the same REST API
(`/h5p/*`, `/login`, `/logout`, `/auth-data/:contentId`) as
`h5p-rest-example-server` in the
[h5p-nodejs-library](https://github.com/Lumieducation/H5P-Nodejs-library)
monorepo, so there is no need for a separate client here. To get a browser
UI, clone that repo and run its `h5p-rest-example-client` against this
server instead of `h5p-rest-example-server`:

```bash
git clone https://github.com/Lumieducation/H5P-Nodejs-library
cd H5P-Nodejs-library
npm install
npm run build:h5p-server
npm run build:h5p-react
npm run build:h5p-webcomponents
npm run start --workspace=packages/h5p-rest-example-client
```

`h5p-rest-example-client`'s dev server (port 3000) proxies `/h5p`, `/login`
and `/logout` to `http://127.0.0.1:8080` (see its `vite.config.ts`), and this
example server's `/auth-data/:contentId` route already allows CORS from
`http://localhost:3000` directly — exactly where this example server listens
by default, so no configuration changes are needed on either side.
