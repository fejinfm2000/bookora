# Bookora

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## CI / Build Environment Variables

This project generates `src/environments/environment*.ts` at build time using `scripts/set-env.js`. Do not commit those generated files.

Required environment variables for CI (Netlify, Vercel, GitHub Actions, etc.):

- `GITHUB_TOKEN` — Personal access token used to write files to the repository (required for saving JSON files to `src/assets/data`).
- `REPO_OWNER` — GitHub repo owner (defaults to `fejinfm2000`).
- `REPO_NAME` — GitHub repository name (defaults to `bookora`).
- `MEGA_EMAIL` — Mega.io account email (required for media uploads to Mega).
- `MEGA_PASSWORD` — Mega.io account password (required for media uploads to Mega).
- `MEGA_APIKEY` — Optional Mega API key if used by your account.
- `ADMIN_EMAILS` — Optional comma-separated list of admin emails (e.g. `admin@example.com,owner@example.com`).

Notes:
- The build runs `npm run config` which executes `node scripts/set-env.js` and writes `src/environments/environment.prod.ts` (and optionally `environment.ts`). Ensure CI variables are set so `mega` and `adminEmails` are present in the generated file.
- `.gitignore` is configured to ignore generated environment files; keep `src/environments/environment.d.ts` in the repo so TypeScript knows the expected shape.

