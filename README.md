# ChuukeseBridge

ChuukeseBridge is a Harp★Star web translator for **Chuukese ↔ English**. It keeps provider credentials on the server and returns machine-generated translations with examples, notes, and an explicit confidence level.

## Current features

- Bidirectional Chuukese → English and English → Chuukese translation
- Server-owned provider boundary (`POST /api/translate`)
- Provider-neutral OpenAI-compatible adapter with presets for OpenAI, OpenRouter, Ollama, LM Studio, and custom endpoints
- Structured examples, notes, and low/medium/high confidence
- Input validation and a 4,000-character request limit
- Curated phrasebook UI (content still requires fluent-speaker review)
- Versioned research lexicon at `data/lexicon.json` with source URLs, IPA when available, glosses, examples, and review status
- Lexicon QA gate currently blocks promotion; quarantined records remain excluded from translation truth until review

## Quick start

```bash
npm install
cp .env.example .env
# Add LLM_API_KEY to .env
npm run dev
```

Open <http://localhost:3000>.

## Configuration

| Variable | Description | Default |
| :--- | :--- | :--- |
| `LLM_PROVIDER` | `demo`, `openai`, `openrouter`, `ollama`, `lmstudio`, or `openai-compatible` | `demo` for smoke testing |
| `LLM_MODEL` | Provider model identifier | `demo` in demo mode |
| `LLM_API_KEY` | Server-side provider key; optional for demo/local Ollama/LM Studio | Required for hosted providers |
| `LLM_BASE_URL` | Custom OpenAI-compatible `/v1` endpoint | Required for `openai-compatible` |
| `PORT` | HTTP server port | `3000` |

## API contract

`POST /api/translate`

```json
{
  "text": "source text",
  "direction": "chuukese-to-english"
}
```

`direction` must be `chuukese-to-english` or `english-to-chuukese`. Successful responses contain `translation`, `exampleSource`, `exampleTarget`, `notes`, and `confidence`. Invalid requests return a JSON `error` with HTTP 400 or 413.

## Verification

```bash
npm run build
npx tsc --noEmit
npm run validate:lexicon
```

The repository's Hermes Vite verification recipe currently expects Bun. If Bun is unavailable, use the npm commands above and report that limitation rather than treating the npm run as a Bun verification.

## Limitations

Chuukese is a low-resource language with dialect, orthography, and data-coverage challenges. Results may be wrong or overconfident; they are not authoritative translations. Review important text with a fluent Chuukese speaker or a trusted linguistic source. The project does not yet have an expert-reviewed evaluation corpus, live audio translation, or a verified phrasebook source record.

## About

Built by [Harp★Star](https://harpstarunlimited.com) to bridge linguistic gaps.

## License

MIT
