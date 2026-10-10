import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalize, escapeHtml, safeURL, reviewQueue, validState, selectLanguage, mergeRoadmap } from '../public/chuukese/core.js';

const entries = JSON.parse(fs.readFileSync(new URL('../public/chuukese/data/entries.json', import.meta.url)));
const tasks = JSON.parse(fs.readFileSync(new URL('../public/chuukese/data/roadmap.json', import.meta.url)));
test('starter data stays Chuukese, attributed, and unreviewed', () => {
  assert.equal(entries.length, 851);
  assert.equal(new Set(entries.map(entry => entry.word)).size, 780);
  assert.equal(entries.reduce((sum, entry) => sum + entry.senses.length, 0), 994);
  assert.ok(entries.every(entry => entry.status === 'unreviewed' && entry.source.endsWith('#Chuukese')));
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  assert.equal(validState({ overrides: Object.fromEntries(entries.map(entry => [entry.id, entry])), tasks }), true);
});
test('review sheet skips affixes, duplicates, and reviewed entries', () => {
  const queue = reviewQueue(entries);
  assert.equal(queue.length, 10);
  assert.equal(new Set(queue.map(entry => entry.word)).size, 10);
  assert.ok(queue.every(entry => !['suffix', 'prefix', 'infix'].includes(entry.pos)));
  assert.ok(!reviewQueue(entries.map(entry => ({ ...entry, status: 'reviewed' }))).length);
});
test('backup validation rejects malformed records and uncredited approval', () => {
  const entry = structuredClone(entries[0]);
  assert.equal(validState({ overrides: { [entry.id]: entry }, tasks }), true);
  for (const invalid of [null, { overrides: {}, tasks: [tasks[0], tasks[0]] },
    { overrides: { [entry.id]: { ...entry, status: 'reviewed', reviewer: '' } }, tasks },
    { overrides: { [entry.id]: { ...entry, senses: [{ glosses: [null] }] } }, tasks },
    { overrides: { wrongId: entry }, tasks }]) assert.equal(validState(invalid), false);
});
test('normalization preserves source spelling while matching accents', () => {
  assert.equal(normalize(' SÁPÚK '), 'sapuk');
  assert.equal(safeURL('javascript:alert(1)'), false);
  assert.equal(safeURL('https://en.wiktionary.org/wiki/chaan#Chuukese'), true);
  assert.equal(escapeHtml('<img src=x onerror="run()">'), '&lt;img src=x onerror=&quot;run()&quot;&gt;');
});
test('chk and nmt are separate; legacy backups default to chk', () => {
  const legacy = { ...entries[0] }; delete legacy.languageCode;
  const nmt = { ...entries[1], id: 'test-only-nmt', languageCode: 'nmt' };
  assert.deepEqual(selectLanguage([legacy, nmt], 'chk'), [legacy]);
  assert.deepEqual(selectLanguage([legacy, nmt], 'nmt'), [nmt]);
  assert.equal(validState({ overrides: { [nmt.id]: nmt }, tasks }), true);
  assert.equal(validState({ overrides: { [nmt.id]: { ...nmt, languageCode: 'ckt' } }, tasks }), false);
  // No sourced Namonuito vocabulary has been supplied yet.
  assert.deepEqual(JSON.parse(fs.readFileSync(new URL('../public/chuukese/data/namonuito.json', import.meta.url))), []);
});
test('old backups keep task edits and gain newly introduced roadmap cards', () => {
  const customized = { ...tasks[0], status: 'In progress', detail: 'Local edit' };
  const merged = mergeRoadmap([customized], tasks);
  assert.deepEqual(merged[0], customized);
  assert.equal(merged.length, tasks.length);
  assert.ok(merged.some(task => task.id === 't11'));
});
