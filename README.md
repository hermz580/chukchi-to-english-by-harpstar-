# ChukchiBridge

ChukchiBridge is a web-based translator for the Chukchi language, built to help travelers and language enthusiasts easily understand and learn key phrases.

## Problem
Translating rare or under-represented languages like Chukchi can be challenging. ChukchiBridge solves this by providing a reliable, AI-powered bridge between Chukchi and English, with contextual examples for better understanding.

## Features
- AI-Powered Translation: Uses advanced LLMs to provide accurate translations.
- Contextual Learning: Every translation comes with an example sentence to show correct usage.
- Built-in Phrasebook: A handy reference for common greetings and phrases.
- Flexible Provider Support: Bring your own LLM provider and model.

## Quick Start
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set your environment variables (see Configuration).
4. Run: `npm run dev`

## Configuration
| Variable | Description | Default |
| :--- | :--- | :--- |
| `LLM_PROVIDER` | 'gemini', 'openai', etc. | 'gemini' |
| `LLM_MODEL` | The model to use | 'gemini-1.5-flash' |
| `LLM_API_KEY` | API Key for the provider | Required |
| `LLM_BASE_URL` | Optional base URL | None |

## About
Built by [Harp★Star](https://harpstarunlimited.com) to bridge linguistic gaps.

## Limitations
- Does not support real-time audio translation.

## License
MIT
