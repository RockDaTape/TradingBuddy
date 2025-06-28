# Project Overview

This document describes the purpose of each top-level folder and its main files.

## 📁 app/components
Reusable Vue components that make up your UI.
- **HomePeriodSelect.vue**  
  A `<USelect>` dropdown to pick a time period (`daily`, `weekly`, `monthly`) based on a date range.
- **DateRangePicker.vue**  
  A popover calendar + preset‐ranges picker for selecting any date interval.
- **HomeDateRangePicker.vue**  
  Same as above, but customized for the home/dashboard view (two-month view, quick‐range buttons).

## 📁 composables
Vue Composition-API “hooks”—stateful, reactive utilities that can be auto-imported.
- `useXYZ.ts`  
  (Examples: data-fetching hooks, global state, watchers, etc.)

## 📁 extensions
Custom extensions or plugins for external libraries.
- Tiptap extension files (e.g. `EmbedExtension.ts`, `ColorExtension.ts`)  
  Keep all editor‐specific augmentations here.

## 📁 types
TypeScript type and interface definitions.
- **Period.ts**  
  `type Period = 'daily' | 'weekly' | 'monthly'`
- **Range.ts**  
  `{ start: Date; end?: Date }`
- Any other domain or API payload shapes.

## 📁 utils
Pure utility functions with no side effects.
- **dateHelpers.ts**  
  Helpers around `date-fns` or `@internationalized/date`.
- **stringUtils.ts**, **mathUtils.ts**  
  Miscellaneous formatters, parsers, transforms.

## 📁 scripts
Standalone Node/TS scripts for project automation.
- **migrate-db.ts**  
  Runs Prisma migrations.
- **seed.ts**  
  Populates your database with test data.
- **cleanup.ts**  
  Removes temporary files or clears logs.

Run via:

bash npm run script:migrate-db npm run script:seed


## 📁 server
Server-only code (never shipped to the browser).

### 📁 server/api
H3 event handlers → auto-mounted under `/api/*`.
- **round-turns.ts**  
  `GET /api/round-turns?start=…&end=…`  
  Fetches and serializes `roundTurn` records from Prisma.

### 📁 server/db
Database client initialization.
- **client.ts**  
  Exports a single Prisma client instance (`prisma`) for reuse.

### (Optional) server/middleware, server/plugins
– Custom H3 middleware or server-side plugins  
(for auth, logging, tracing, etc.)

---

By following this layout you keep:
- UI vs. logic vs. data separate
- Client vs. server boundaries clear
- Reusable pieces in their own folders
- Automation scripts out of your source tree
