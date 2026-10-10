#!/usr/bin/env python3
"""Fail-closed validation for the ChukchiBridge lexicon."""
from __future__ import annotations

import json
import sys
import unicodedata
from pathlib import Path

ALLOWED_STATUS = {"unverified", "quarantine", "reviewed", "approved"}
REQUIRED_ENTRY_KEYS = {"id", "lemma", "glosses", "examples", "source", "status", "provenance", "review"}
REQUIRED_EXAMPLE_KEYS = {"source", "target", "provenance"}


def fail(message: str) -> None:
    raise ValueError(message)


def validate(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schemaVersion") != "0.3.0":
        fail("schemaVersion must be 0.3.0")
    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        fail("entries must be a non-empty array")
    ids = set()
    for index, entry in enumerate(entries):
        prefix = f"entries[{index}]"
        if not REQUIRED_ENTRY_KEYS <= entry.keys():
            fail(f"{prefix} is missing required fields")
        if entry["id"] in ids:
            fail(f"duplicate id: {entry['id']}")
        ids.add(entry["id"])
        if not isinstance(entry["lemma"], str) or not entry["lemma"].strip():
            fail(f"{prefix}.lemma must be a non-empty string")
        if unicodedata.normalize("NFC", entry["lemma"]) != entry["lemma"]:
            fail(f"{prefix}.lemma is not NFC-normalized")
        if not isinstance(entry["glosses"], list) or not all(isinstance(x, str) and x.strip() for x in entry["glosses"]):
            fail(f"{prefix}.glosses must contain non-empty strings")
        if entry["status"] not in ALLOWED_STATUS:
            fail(f"{prefix}.status is not controlled")
        if not isinstance(entry["source"], str) or not entry["source"].startswith("http"):
            fail(f"{prefix}.source must be an http URL")
        provenance = entry["provenance"]
        if provenance.get("source") != entry["source"] or provenance.get("languageSection") != "Chukchi":
            fail(f"{prefix}.provenance must identify the Chukchi source section")
        for example_index, example in enumerate(entry["examples"]):
            if not REQUIRED_EXAMPLE_KEYS <= example.keys():
                fail(f"{prefix}.examples[{example_index}] is missing provenance")
            if not example["source"].strip() or not example["target"].strip():
                fail(f"{prefix}.examples[{example_index}] has empty text")
            if example["provenance"].get("languageSection") != "Chukchi":
                fail(f"{prefix}.examples[{example_index}] lacks Chukchi provenance")
    counts = {status: sum(entry["status"] == status for entry in entries) for status in ALLOWED_STATUS}
    if data.get("qaGate", {}).get("promotionBlocked") is not True:
        fail("qaGate.promotionBlocked must remain true until review is complete")
    return {"total": len(entries), **counts}


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/lexicon.json")
    try:
        counts = validate(target)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"LEXICON_INVALID: {error}", file=sys.stderr)
        raise SystemExit(1)
    print("LEXICON_VALID " + " ".join(f"{key}={value}" for key, value in counts.items()))
