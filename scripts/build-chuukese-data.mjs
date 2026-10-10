// Offline, repeatable transformation of the committed source snapshot.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const raw = fs.readFileSync(new URL('data/chuukese/source-kaikki.jsonl', root), 'utf8');
const rows = raw.trim().split(/\r?\n/).map(line => JSON.parse(line));
const entries = rows.flatMap((row, index) => {
  if (row.lang_code !== 'chk') throw new Error(`Unexpected language at row ${index}`);
  const senses = (row.senses || []).filter(sense => sense.glosses?.length).map(sense => ({
    glosses: sense.glosses, tags: sense.tags || [], examples: sense.examples || []
  }));
  if (!senses.length) return [];
  return [{
    id: `kaikki-${index}`, languageCode: 'chk', word: row.word, pos: row.pos || '', senses, forms: row.forms || [],
    source: 'https://en.wiktionary.org/wiki/' + row.word.replaceAll(' ', '_') + '#Chuukese',
    status: 'unreviewed', notes: '', reviewer: '', dialect: '', exampleChuukese: '', exampleEnglish: ''
  }];
});
const output = new URL('public/chuukese/data/entries.json', root);
const stats = {
  entries: entries.length, distinctWords: new Set(entries.map(entry => entry.word)).size,
  senses: entries.reduce((sum, entry) => sum + entry.senses.length, 0),
  sourceSHA256: createHash('sha256').update(raw).digest('hex')
};
if (process.argv.includes('--check')) {
  const committed = JSON.parse(fs.readFileSync(output, 'utf8'));
  if (JSON.stringify(committed) !== JSON.stringify(entries)) throw new Error('Generated dictionary differs. Run npm run build:chuukese-data.');
} else {
  fs.writeFileSync(output, JSON.stringify(entries, null, 2) + '\n');
}
console.log(JSON.stringify({ ...stats, path: fileURLToPath(output) }));
