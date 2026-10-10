import fs from 'node:fs';
const tasks = JSON.parse(fs.readFileSync(new URL('../public/chuukese/data/roadmap.json', import.meta.url)));
const groups = ['Planned', 'In progress', 'Speaker review', 'Done'];
const intro = '# Chuukese / Unanu-Namonuito project Kanban\n\n'
  + 'Product: Standard Chuukese (`chk`) ↔ English, plus separate Unanu/Namonuito (`nmt`) vocabulary.\n'
  + 'One speaker may help occasionally. Use small sessions; do not assume availability.\n'
  + 'Starter chk records await review of meaning and standard orthography; nmt starts empty.\n'
  + 'Browser task edits are local; this file snapshots the committed initial roadmap.\n\n';
fs.writeFileSync(new URL('../docs/chuukese/PLAN.md', import.meta.url), intro + groups.map(status =>
  `## ${status}\n\n` + (tasks.filter(task => task.status === status).map(task =>
    `- **${task.title}** — ${task.detail}`).join('\n') || 'No tasks currently in this column.') + '\n'
).join('\n'));
console.log('Updated docs/chuukese/PLAN.md from roadmap.json.');
