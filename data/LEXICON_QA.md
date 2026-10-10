# Lexicon QA Gate

**Decision:** `REJECT_PROMOTION`

The dataset is a research lead only. No entry is approved translation truth. Entries with contamination, malformed glosses, unsupported artifacts, or duplicate identity are marked `quarantine` in `data/lexicon.json`; all other entries remain `unverified`.

## Current counts

- Total records: 116
- Quarantined: 28
- Unverified: 88
- Approved: 0
- Reviewed: 0 by fluent Chukchi speaker or primary dictionary

## Quarantine reasons

- `0001–0006`: repeated alphabet/same-lemma extraction; canonical merge required
- `0013–0014`: duplicate same-lemma extraction
- `0016–0017`: non-Chukchi contamination reported in the English review
- `0023–0025`: duplicate same-lemma extraction
- `0035`: malformed or conflated gloss
- `0053–0058`: malformed obsolete-letter glosses
- `0066–0067`: duplicate same-lemma extraction
- `0094`: malformed arctic-fox gloss
- `0101–0104`: malformed obsolete-letter glosses
- `0116`: duplicate seven entry

Entry `0108` has a safe English typo correction from `it appear so` to `it appears so`; the original gloss is retained in `originalGlosses`.

## Required before promotion

1. Verify every record against a primary dictionary, source page, or fluent Chukchi reviewer.
2. Preserve orthographic form separately from transliteration and IPA.
3. Preserve Chukchi-specific letters such as `ӄ`, `ӈ`, `Ԓ/ԓ`, and modifier-letter apostrophe `ʼ`.
4. Confirm the source page has an explicit Chukchi language section.
5. Verify each example's Chukchi source, English target, and language-section provenance.
6. Resolve duplicate records with an auditable canonical-record decision.
7. Confirm part of speech, lemma boundaries, morphology, IPA, and transliteration; never infer missing values.
8. Change `status` to `reviewed` or `approved` only after the preceding checks pass.

## Source leads

- [Wiktionary Chukchi lemmas](https://en.wiktionary.org/wiki/Category:Chukchi_lemmas)
- [Institute of Linguistic Studies, Russian Academy of Sciences: Chukchi](https://lingsib.iea.ras.ru/en/languages/chukchi.shtml)
- [Chukchi Dictionary](https://chukdict.com/)
- [Chukchi transliteration reference](https://transliteration.eki.ee/pdf/Chukchi.pdf)

The English-side review covered all 116 records and spot-checked 15 source pages. The Chukchi-side review could not access the parent workspace's dataset, so its entry-level coverage is zero; this is a documented coverage gap, not approval.
