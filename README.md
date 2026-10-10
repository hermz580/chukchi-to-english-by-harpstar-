# Chuukese & Unanu/Namonuito Lexicon by Harp★Star

A rebuildable bilingual dictionary and speaker-review workspace for **Standard Chuukese (`chk`) ↔ English**, with a separately tagged **Unanu/Namonuito (`nmt`) vocabulary collection**. The repository URL retains its original name; Chukchi (`ckt`) is a different language and its previous translator is retained as legacy.

The source, data, transformation, tests, and Kanban are all in this repository. Read [the architecture and rebuild guide](docs/chuukese/ARCHITECTURE.md) and [AGENTS.md](AGENTS.md) to continue with another developer or agent.

## What works

- Word lookup in either direction, including accent-insensitive search.
- Separate `chk` and `nmt` collections and language tags on contributed entries.
- 851 imported Chuukese entries, 780 distinct forms, and 994 meanings, all awaiting review.
- Speaker corrections, dialect/island notes, paired examples, and review initials.
- Ten-entry review sheets and an editable Kanban with twelve project tasks.
- Browser saving and downloadable/restorable schema-1 backups.

The `nmt` collection starts empty. Imported `chk` does not mean standard spelling has been verified. Full-sentence translation, shared database saving, and audio collection are planned; this lexicon does not call an AI translation provider.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:3000 — it redirects to `/chuukese/`. No API key is needed. For the independent dictionary, serve only `public/chuukese/` with any static web server; it uses HTML, CSS, JavaScript modules, and JSON without a build step.

```sh
npm run check:chuukese
npm run build
npx tsc --noEmit
```

For production, set `NODE_ENV=production` and run `npm start` after building. In PowerShell: `$env:NODE_ENV='production'; npm start`.

## Continue or remake

- [File map, contracts, and migration instructions](docs/chuukese/ARCHITECTURE.md)
- [Saved Kanban plan](docs/chuukese/PLAN.md)
- [Initial task data](public/chuukese/data/roadmap.json)
- [Speaker review sheet](docs/chuukese/speaker-review-sheet.txt)
- [Dictionary attribution and licenses](docs/chuukese/DATA-LICENSE.md)

Regenerate the imported dictionary offline with `npm run build:chuukese-data`. Commit sourced Namonuito contributions in `public/chuukese/data/namonuito.json`. Do not use a browser backup as public source without checking the scope of its speaker notes. Browser edits do not write to GitHub or sync between devices.

The earlier private Sites prototype is a separate deployed copy. Export a backup there and restore it here to carry edits across origins. A repository commit does not publish or update that Site.

## Legacy

The prior Chukchi React UI is at `/legacy/chukchi`; its research dataset and provider endpoint are retained, separately from this product. See [legacy documentation](docs/legacy-chukchi.md). Its `validate:lexicon` command is a Chukchi promotion gate that deliberately reports unresolved research problems. Do not treat its data or provider output as Chuukese/Namonuito translations.

## License

Application code: [MIT](LICENSE). Imported dictionary data: CC BY-SA 4.0 with Wiktionary/Kaikki attribution; see [data licensing](docs/chuukese/DATA-LICENSE.md).

Built by [Harp★Star](https://harpstarunlimited.com).
