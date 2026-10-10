// Pure functions: usable by a replacement UI without a browser or provider API.
export const STORAGE_KEY = "chuukese-lexicon-v1";
export const STATUSES = ["Planned", "In progress", "Speaker review", "Done"];
export const languageOf = (entry) => entry.languageCode || "chk"; // v1 backups predate language tags.
export const selectLanguage = (entries, code) =>
  entries.filter((entry) => languageOf(entry) === code);
export function mergeRoadmap(saved, initial) {
  const ids = new Set(saved.map(task => task.id));
  return [...saved, ...initial.filter(task => !ids.has(task.id))];
}
export const normalize = (value) =>
  String(value).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

export function safeURL(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

// Everyday meanings first. This is a review suggestion, not a quality score.
export function reviewQueue(entries) {
  const used = new Set();
  const topics = [
    "water",
    "food",
    "mother",
    "father",
    "house",
    "fish",
    "hello",
    "thank",
    "child",
    "eat",
  ];
  const rank = (entry) => {
    const gloss = normalize(
      entry.senses.flatMap((sense) => sense.glosses).join(" "),
    );
    return topics.some(
      (topic) =>
        gloss === topic ||
        gloss.startsWith(topic + " ") ||
        gloss.includes("; " + topic),
    )
      ? 0
      : 1;
  };
  return entries
    .filter(
      (entry) =>
        entry.status !== "reviewed" &&
        !["suffix", "prefix", "infix"].includes(entry.pos),
    )
    .sort((a, b) => rank(a) - rank(b) || a.word.localeCompare(b.word))
    .filter((entry) => {
      if (used.has(entry.word)) return false;
      used.add(entry.word);
      return true;
    })
    .slice(0, 10);
}

const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const strings = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
export function validState(state) {
  if (
    !record(state) ||
    !record(state.overrides) ||
    !Array.isArray(state.tasks) ||
    state.tasks.length > 10000
  )
    return false;
  if (
    !state.tasks.every(
      (task) =>
        record(task) &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.detail === "string" &&
        STATUSES.includes(task.status),
    )
  )
    return false;
  if (new Set(state.tasks.map((task) => task.id)).size !== state.tasks.length)
    return false;
  return Object.entries(state.overrides).every(([id, entry]) => {
    if (
      ["__proto__", "constructor", "prototype"].includes(id) ||
      !record(entry) ||
      id !== entry.id
    )
      return false;
    if (
      typeof entry.word !== "string" ||
      !entry.word.trim() ||
      typeof entry.pos !== "string"
    )
      return false;
    if (
      entry.languageCode !== undefined &&
      !["chk", "nmt"].includes(entry.languageCode)
    )
      return false;
    if (!["unreviewed", "reviewed", "question"].includes(entry.status))
      return false;
    if (
      !Array.isArray(entry.senses) ||
      !entry.senses.length ||
      !entry.senses.every(
        (sense) =>
          record(sense) &&
          strings(sense.glosses) &&
          sense.glosses.length > 0 &&
          sense.glosses.every((gloss) => gloss.trim()) &&
          (sense.tags === undefined || strings(sense.tags)),
      )
    )
      return false;
    if (
      entry.forms !== undefined &&
      (!Array.isArray(entry.forms) ||
        !entry.forms.every(
          (form) => record(form) && typeof form.form === "string",
        ))
    )
      return false;
    if (
      ![
        "notes",
        "dialect",
        "exampleChuukese",
        "exampleEnglish",
        "source",
        "reviewer",
        "reviewDate",
      ].every(
        (field) =>
          entry[field] === undefined || typeof entry[field] === "string",
      )
    )
      return false;
    return entry.status !== "reviewed" || Boolean(entry.reviewer?.trim());
  });
}
