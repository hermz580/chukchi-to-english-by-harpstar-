# Dissecting and rebuilding the app

This source is the product, not a screenshot or a link to a hosted builder.
Another developer or agent can replace any layer below and keep the data contracts.

## File map

| Layer | Files | Responsibility |
| --- | --- | --- |
| Page | `public/chuukese/index.html` | Dictionary, collection selector, review forms, Kanban, backup controls |
| Presentation | `public/chuukese/style.css` | Responsive layout and visual system |
| Browser controller | `public/chuukese/app.js` | Search, forms, pagination, rendering, local saving, import/export |
| Pure functions | `public/chuukese/core.js` | Accent matching, collection isolation, review queue, backup validation, escaping |
| Chuukese data | `public/chuukese/data/entries.json` | Generated, attributed `chk` starter entries, all unreviewed |
| Namonuito data | `public/chuukese/data/namonuito.json` | Empty until actual sourced `nmt` entries are supplied |
| Roadmap | `public/chuukese/data/roadmap.json` | Initial Kanban cards; editable separately from UI |
| Source snapshot | `data/chuukese/source-kaikki.jsonl` | Exact imported research snapshot for reproducibility |
| Transformation | `scripts/build-chuukese-data.mjs` | Offline regeneration and drift check |
| Checks | `scripts/test-chuukese.mjs` | Data integrity, isolation, review and restore guardrails |
| Handoff | `AGENTS.md`, this document, `PLAN.md`, `DATA-LICENSE.md` | Constraints and next actions |

## Running and hosting

`npm ci` then `npm run dev` starts the existing Express/Vite host at port 3000.
Root `/` redirects to `/chuukese/`. Vite serves the `public/` directory and copies it
unchanged into the build. `npm run build` builds the host; use `NODE_ENV=production`
with `npm start` for its production server. The old React Chukchi UI is retained at
`/legacy/chukchi`. Its provider API remains legacy and is not called by the lexicon.
Static deployments also select the Chuukese front door through `index.tsx`.

The lexicon can be extracted entirely: serve `public/chuukese/` as a static
directory. For example, `python -m http.server 4182 --directory public/chuukese`.
No build, API key, React, AI provider, or hosted Sites account is required for that
standalone app. Serve over HTTP; ES modules and JSON loading need a web origin.

## Entry contract

An entry has `id`, `languageCode` (`chk` or `nmt`), `word`, `pos`, `senses`, `forms`,
`source`, `status`, `notes`, `reviewer`, `dialect`, `exampleChuukese`, and
`exampleEnglish`. Each sense has `glosses`, `tags`, and source `examples`.
`exampleChuukese` is retained as the source-language example field for schema-1
backup compatibility; the UI labels it source-language example for both collections.
Review saves may also contain `reviewDate`, `modifiedAt`, and the form's `meanings`.
Status is `unreviewed`, `question`, or `reviewed`. The latter requires reviewer
initials; changed content returns an already-reviewed record to unreviewed.

Imported IDs `kaikki-{rowIndex}` refer to the committed snapshot row, so do not
reorder the source snapshot or overwrite it with a newer download. For a refresh,
design an ID migration and record provenance first. All original text is recoverable
from the snapshot even if a browser user changes a definition.

`chk` imports are Chuukese research material, not proof of Standard Chuukese
spelling. `nmt` is the Namonuito collection code; Unanu is retained in the product
label per the user's scope. Capture actual island/dialect evidence in `dialect`.
Neither collection uses Chukchi records. Related words are not automatic equivalents.

## Browser state and backups

Storage key: `chuukese-lexicon-v1`. State: `{ overrides: { [entryId]: entry }, tasks: [] }`.
The UI merges baseline entries with overrides and adds locally contributed entries.
Collection filtering happens after merge, including when selecting review batches.
The initial tasks come from roadmap.json; saved browser tasks take precedence. New task IDs from the committed roadmap are appended when older state is loaded or restored.

Backup shape: `{ schema: 1, exportedAt, state, entries, attribution }`.
`state` is the restore authority; the full `entries` snapshot is included for audit
and portability. Schema-1 entries without `languageCode` are interpreted as `chk`,
which preserves backups from the first private prototype. No `nmt` inference occurs.
Restore validates records, task IDs, statuses, and reviewer attribution before a
replacement confirmation. Downloads are the cross-device handoff today.

LocalStorage belongs to an origin and device: edits made on the private Sites URL
do not appear on localhost/GitHub automatically. Download a backup from that URL,
then restore it on the new app. Backups may contain speaker notes; do not commit
them publicly by default. A shared database and versioned edit history are planned.

## Rebuild recipe

1. Retain the baseline JSON, language codes, provenance, and roadmap.
2. Reuse `core.js` or implement its tested contracts in the replacement framework.
3. Build the dictionary and entry-review views before sentence translation.
4. Import old browser backups using the schema-1 migration rule above.
5. If adding a database, migrate overrides and tasks explicitly and preserve review evidence.
6. Add reviewed paired sentences and an evaluation set before introducing an AI provider.
7. Run data checks and test both collections, empty `nmt`, backup restore, and Kanban.

The private Sites prototype remains a separately deployed copy. A GitHub commit
or PR does not update it. This repository is now the rebuildable source handoff;
choose a deployment pipeline explicitly for subsequent publication.
