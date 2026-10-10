# Project handoff

Read README.md and docs/chuukese/ARCHITECTURE.md before editing.

The user's current product is Standard Chuukese (`chk`) ↔ English with a separate
Unanu/Namonuito (`nmt`) vocabulary collection. The repository slug is historical;
Chukchi (`ckt`) is a different language and its previous implementation is legacy.
Do not mix the legacy data or translation prompts into either collection.

The lexicon source is public/chuukese/. It runs without provider credentials.
Keep data, pure functions, UI, and the roadmap independently replaceable. Keep
the entry IDs, backup schema 1, and storage key compatible, or document a migration.
User edits live in the browser; they are not automatically committed to GitHub.

Imported `chk` entries await speaker review. The code identifies the collection,
not verified standard orthography. Never mark a record reviewed without real
speaker/source evidence. Do not invent `nmt` vocabulary or copy `chk` definitions
into it. Preserve island/dialect labels, uncertainty, and attribution.

Run npm run check:chuukese, npm run build, and npx tsc --noEmit after relevant
changes. The legacy npm run validate:lexicon is an intentionally failing
Chukchi promotion gate, not the Chuukese build gate.

Update public/chuukese/data/roadmap.json and docs/chuukese/PLAN.md together when
project tasks change. Preserve HarpStar attribution. Never commit .env files,
provider keys, private speaker details, or browser backups without explicit scope.
