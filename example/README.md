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
