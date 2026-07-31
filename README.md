# AI-First Dev Consult Platform

A pnpm monorepo for an AI-first development consult platform.

## Structure

```
apps/        - Application packages (API, web, AI engine)
packages/    - Shared packages (@repo/*)
tools/       - Development tools and scripts
```

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```

## Test

```bash
pnpm test
```

## Scripts

| Script       | Description                             |
| ------------ | --------------------------------------- |
| `pnpm dev`   | Run all apps in development mode        |
| `pnpm build` | Build all apps                          |
| `pnpm lint`  | Lint all TypeScript files               |
| `pnpm test`  | Run tests for all apps                  |
| `pnpm clean` | Remove build artifacts and node_modules |

## Path Aliases

- `@repo/*` - Shared packages in `packages/`
- `@/*` - App-specific imports in `apps/`
