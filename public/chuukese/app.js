import {
  escapeHtml as esc,
  normalize as norm,
  STORAGE_KEY as KEY,
  STATUSES as statuses,
  reviewQueue,
  safeURL,
  validState,
  selectLanguage,
  mergeRoadmap,
} from "./core.js";
const $ = (selector) => document.querySelector(selector);
let baseline = [],
  initialRoadmap = [],
  state = { overrides: {}, tasks: [] },
  limit = 30,
  tab = "dictionary",
  languageCode = "chk";
const entries = () =>
  baseline
    .map((e) => state.overrides[e.id] || e)
    .concat(
      Object.values(state.overrides).filter(
        (e) => !baseline.some((b) => b.id === e.id),
      ),
    );
const notice = (s) => ($("#notice").textContent = s);
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    notice("Saved in this browser. Download a backup to keep a separate copy.");
  } catch {
    notice(
      "Browser storage is unavailable or full. Changes are in this session only; download a backup now.",
    );
  }
}
function card(e) {
  const label = {
    unreviewed: "Awaiting review",
    reviewed: "Speaker reviewed",
    question: "Needs discussion",
  }[e.status];
  return `<article class="entry"><div class="top"><h3>${esc(e.word)}</h3><span class="badge ${esc(e.status)}">${label}</span></div><span class="pos">${esc(e.pos)}</span><ol>${e.senses.map((s) => `<li>${esc(s.glosses.join(" / "))}${s.tags?.length ? ` <span class="pos">(${esc(s.tags.join(", "))})</span>` : ""}</li>`).join("")}</ol>${e.notes ? `<p><b>Notes:</b> ${esc(e.notes)}</p>` : ""}${e.dialect ? `<p><b>Dialect / island:</b> ${esc(e.dialect)}</p>` : ""}${e.exampleChuukese ? `<p>${esc(e.exampleChuukese)}<br><em>${esc(e.exampleEnglish)}</em></p>` : ""}${e.status === "reviewed" ? `<p class="pos">Reviewed by ${esc(e.reviewer)} · ${esc(e.reviewDate || "")}</p>` : ""}<div class="actions"><button data-edit="${esc(e.id)}">Review / edit</button>${safeURL(e.source) ? `<a href="${esc(e.source)}" target="_blank" rel="noopener">Source ↗</a>` : '<span class="pos">Community contribution</span>'}</div></article>`;
}
function render() {
  const all = selectLanguage(entries(), languageCode);
  $("#stats").innerHTML =
    `<div class="stat"><strong>${new Set(all.map((e) => e.word)).size}</strong><span>distinct words</span></div><div class="stat"><strong>${all.filter((e) => e.status === "reviewed").length}</strong><span>reviewed entries</span></div><div class="stat"><strong>${state.tasks.filter((t) => t.status !== "Done").length}</strong><span>next steps saved</span></div>`;
  const q = norm($("#search").value),
    dir = $("#direction").value,
    filter = $("#filter").value;
  const matches = all
    .filter(
      (e) =>
        (filter === "all" || filter === e.status) &&
        (!q ||
          norm(
            dir === "chk"
              ? e.word + " " + (e.forms || []).map((f) => f.form).join(" ")
              : e.senses.flatMap((s) => s.glosses).join(" "),
          ).includes(q)),
    )
    .sort((a, b) => {
      const exact = (e) =>
        dir === "chk"
          ? norm(e.word) === q
          : e.senses.some((s) => s.glosses.some((g) => norm(g) === q));
      return (
        Number(exact(b)) - Number(exact(a)) || a.word.localeCompare(b.word)
      );
    });
  $("#resultCount").textContent =
    `${matches.length} matching entries · showing ${Math.min(limit, matches.length)}`;
  $("#results").innerHTML = matches.length
    ? matches.slice(0, limit).map(card).join("")
    : "<p>No entry found. Add it as an unreviewed contribution for your speaker to check.</p>";
  $("#more").hidden = matches.length <= limit;
  const pending = reviewQueue(selectLanguage(entries(), languageCode));
  $("#reviewList").innerHTML = pending.map(card).join("");
  $("#review .section-title span").textContent =
    `${all.filter((e) => e.status === "reviewed").length} reviewed · next ${pending.length} to discuss`;
  $("#board").innerHTML = statuses
    .map(
      (status) =>
        `<div class="lane"><h3>${status} · ${state.tasks.filter((t) => t.status === status).length}</h3>${state.tasks
          .filter((t) => t.status === status)
          .map(
            (t) =>
              `<article class="task"><h4>${esc(t.title)}</h4><p>${esc(t.detail)}</p><select data-move="${esc(t.id)}" aria-label="Status for ${esc(t.title)}">${statuses.map((s) => `<option ${s === t.status ? "selected" : ""}>${s}</option>`).join("")}</select><button data-task="${esc(t.id)}">Edit card</button></article>`,
          )
          .join("")}</div>`,
    )
    .join("");
}
function showTab(t) {
  tab = t;
  ["dictionary", "review", "plan"].forEach((id) => {
    $("#" + id).hidden = id !== t;
    document
      .querySelector(`[data-tab="${id}"]`)
      .setAttribute("aria-pressed", String(id === t));
  });
}
document
  .querySelectorAll("[data-tab]")
  .forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
$("#startReview").onclick = () => showTab("review");
["search", "direction", "filter"].forEach((id) =>
  $("#" + id).addEventListener(id === "search" ? "input" : "change", () => {
    limit = 30;
    $("#search").placeholder =
      $("#direction").value === "chk"
        ? "Search a word in this collection…"
        : "Search an English meaning…";
    render();
  }),
);
$("#more").onclick = () => {
  limit += 30;
  render();
};
function editEntry(id) {
  const e = entries().find((e) => e.id === id) || {
    id: "local-" + crypto.randomUUID(),
    word: "",
    pos: "",
    senses: [],
    status: "unreviewed",
    languageCode,
  };
  const f = $("#entryForm");
  f.reset();
  for (const name of [
    "id",
    "word",
    "languageCode",
    "pos",
    "dialect",
    "notes",
    "exampleChuukese",
    "exampleEnglish",
    "source",
    "reviewer",
    "status",
  ])
    f.elements[name].value = e[name] || "";
  f.elements.status.value = e.status || "unreviewed";
  f.elements.languageCode.value = e.languageCode || "chk";
  f.elements.meanings.value = e.senses.flatMap((s) => s.glosses).join("\n");
  $("#editTitle").textContent = e.word ? "Review " + e.word : "Add an entry";
  $("#editor").showModal();
}
document.addEventListener("click", (ev) => {
  const e = ev.target.closest("[data-edit]"),
    t = ev.target.closest("[data-task]");
  if (e) editEntry(e.dataset.edit);
  if (t) editTask(t.dataset.task);
});
$("#newEntry").onclick = () => editEntry();
$("#closeEditor").onclick = () => $("#editor").close();
$("#entryForm").onsubmit = (ev) => {
  ev.preventDefault();
  const d = Object.fromEntries(new FormData(ev.target));
  if (d.status === "reviewed" && !d.reviewer.trim()) {
    notice("Add speaker / reviewer initials before marking this reviewed.");
    ev.target.elements.reviewer.focus();
    return;
  }
  if (Boolean(d.exampleChuukese.trim()) !== Boolean(d.exampleEnglish.trim())) {
    notice("Provide both sides of the example sentence.");
    return;
  }
  if (d.source && !safeURL(d.source)) {
    notice("Use an http or https source URL.");
    return;
  }
  const old = entries().find((e) => e.id === d.id);
  const oldText = old?.senses.flatMap((s) => s.glosses).join("\n") || "";
  const changed =
    old &&
    ((old.languageCode || "chk") !== d.languageCode ||
      old.word !== d.word ||
      oldText !== d.meanings ||
      ["pos", "source", "notes", "dialect", "exampleChuukese", "exampleEnglish"].some(
        (k) => (old[k] || "") !== d[k],
      ));
  if (old?.status === "reviewed" && changed) d.status = "unreviewed";
  const updated = {
    ...old,
    ...d,
    word: d.word.trim(),
    senses:
      old && oldText === d.meanings
        ? old.senses
        : d.meanings
            .split("\n")
            .filter((x) => x.trim())
            .map((g) => ({ glosses: [g.trim()], tags: [] })),
    reviewDate:
      d.status === "reviewed" ? new Date().toISOString().slice(0, 10) : "",
    modifiedAt: new Date().toISOString(),
  };
  if (!updated.word || !updated.senses.length) {
    notice("Enter at least one meaning.");
    return;
  }
  state.overrides[d.id] = updated;
  persist();
  render();
  $("#editor").close();
};
document.addEventListener("change", (ev) => {
  if (ev.target.dataset.move) {
    state.tasks.find((t) => t.id === ev.target.dataset.move).status =
      ev.target.value;
    persist();
    render();
  }
});
function editTask(id) {
  const t = state.tasks.find((t) => t.id === id) || {
    id: "task-" + crypto.randomUUID(),
    title: "",
    detail: "",
    status: "Planned",
  };
  const f = $("#taskForm");
  for (const k of ["id", "title", "detail", "status"])
    f.elements[k].value = t[k];
  $("#taskEditor").showModal();
}
$("#addTask").onclick = () => editTask();
$("#closeTask").onclick = () => $("#taskEditor").close();
$("#taskForm").onsubmit = (ev) => {
  ev.preventDefault();
  const t = Object.fromEntries(new FormData(ev.target)),
    i = state.tasks.findIndex((x) => x.id === t.id);
  if (i < 0) state.tasks.push(t);
  else state.tasks[i] = t;
  persist();
  render();
  $("#taskEditor").close();
};
function download(name, value, type = "application/json") {
  const a = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob(
        [typeof value === "string" ? value : JSON.stringify(value, null, 2)],
        { type },
      ),
    );
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#backup").onclick = () =>
  download(
    "chuukese-lexicon-backup-" +
      new Date().toISOString().slice(0, 10) +
      ".json",
    {
      schema: 1,
      exportedAt: new Date().toISOString(),
      state,
      entries: entries(),
      attribution:
        "Definitions adapted from Kaikki/Wiktionary, CC BY-SA 4.0. See individual entry source links.",
    },
  );
$("#restore").onchange = async (ev) => {
  try {
    const file = ev.target.files[0];
    if (!file) return;
    if (file.size > 15000000) throw Error("File too large");
    const b = JSON.parse(await file.text());
    if (b.schema !== 1 || !validState(b.state))
      throw Error("Invalid backup format");
    if (
      !confirm(
        "Restore this backup? It replaces this browser’s current edits and Kanban. Download your current backup first if needed.",
      )
    )
      return;
    state = b.state;
    state.tasks = mergeRoadmap(state.tasks, initialRoadmap);
    persist();
    render();
    notice("Backup restored.");
  } catch (e) {
    notice("Backup could not be restored: " + e.message);
  } finally {
    ev.target.value = "";
  }
};
$("#batch").onclick = () => {
  const list = reviewQueue(selectLanguage(entries(), languageCode));
  if (!list.length) {
    notice(
      "No entries are ready in this collection. Add speaker vocabulary first.",
    );
    return;
  }
  download(
    "chuukese-speaker-review.txt",
    (languageCode === "chk" ? "STANDARD CHUUKESE" : "UNANU / NAMONUITO") +
      " / ENGLISH — TEN-WORD REVIEW\nSpeaker initials: __________  Date: __________  Dialect / island: __________\nCheck spelling, meaning, natural usage, and uncertainty.\n\n" +
      list
        .map(
          (e, i) =>
            `${i + 1}. ${e.word} (${e.pos})\nEnglish: ${e.senses.flatMap((s) => s.glosses).join("; ")}\nSource: ${e.source}\nCorrection / alternate spelling:\nChuukese example:\nEnglish meaning of example:\nReviewed / needs discussion:\n\n`,
        )
        .join("") +
      "Definitions adapted from Kaikki/Wiktionary, CC BY-SA 4.0.\nEnter notes through Speaker review and download a backup.",
    "text/plain",
  );
};
$("#language").onchange = () => {
  languageCode = $("#language").value;
  limit = 30;
  $("#search").value = "";
  $("#direction").options[0].textContent =
    languageCode === "chk" ? "Chuukese → English" : "Namonuito → English";
  $("#direction").options[1].textContent =
    languageCode === "chk" ? "English → Chuukese" : "English → Namonuito";
  $("#collectionNote").textContent =
    languageCode === "chk"
      ? "Chuukese starter entries are imported research material awaiting speaker review; standard spelling is not yet verified."
      : "Unanu/Namonuito starts empty. Add vocabulary from your speaker with island and source notes; entries stay separate from Chuukese.";
  render();
};
async function init() {
  try {
    const responses = await Promise.all(
      ["data/entries.json", "data/roadmap.json", "data/namonuito.json"].map(
        (url) => fetch(url),
      ),
    );
    if (responses.some((r) => !r.ok)) throw new Error("Data unavailable");
    const [chkEntries, roadmap, nmtEntries] = await Promise.all(
      responses.map((r) => r.json()),
    );
    baseline = [...chkEntries, ...nmtEntries];
    initialRoadmap = roadmap;
    state.tasks = roadmap;
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && validState(saved)) state = { ...saved, tasks: mergeRoadmap(saved.tasks, roadmap) };
      else if (saved)
        notice(
          "Saved data could not be read. Restore a valid backup to recover edits.",
        );
    } catch {
      notice("Browser saving is unavailable. Use backups to keep your work.");
    }
    render();
  } catch {
    notice(
      "The dictionary could not load. Reload the page or check your connection.",
    );
  }
}
init();
