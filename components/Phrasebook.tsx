import React, { useState } from 'react';

type Phrase = { english: string; chuukese: string; note?: string };

const phrases: Phrase[] = [
  { english: 'Hello / general greeting', chuukese: 'Ran annim' },
  { english: 'How are you?', chuukese: 'Ifa usum?' },
  { english: "I'm fine, thank you", chuukese: 'Pechekun, kinisou' },
  { english: 'What is your name?', chuukese: 'Ifa itom?' },
  { english: 'My name is…', chuukese: 'Itei …' },
  { english: 'Please', chuukese: 'Kose mochen' },
  { english: 'Thank you', chuukese: 'Kinisou', note: 'Published sources also show longer forms; speaker review is needed.' },
  { english: 'Do you speak Chuukese?', chuukese: 'Kose sine fosun chuuk?' },
];

const OMNIGLOT_SOURCE = 'https://www.omniglot.com/language/phrases/chuukese.htm';
const AUDIO_SOURCE = 'https://soundcloud.com/jared-dann/sets/10-common-phrases-chuukese';

const Phrasebook: React.FC = () => {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const speak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'chk';
    utterance.rate = 0.82;
    utterance.onstart = () => setSpeaking(id);
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="phrasebook-panel mt-12 rounded-2xl p-6 md:p-8" aria-labelledby="phrasebook-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="phrasebook-eyebrow">SPEAKER REVIEW SET · CHUUKESE (CHK)</p>
          <h2 id="phrasebook-title" className="text-2xl font-bold mb-2">Phrases Bianca can review</h2>
          <p className="phrasebook-intro">These starter phrases are copied with attribution from public Chuukese phrase references. They are not yet treated as authoritative.</p>
        </div>
        <a className="phrasebook-source" href={OMNIGLOT_SOURCE} target="_blank" rel="noopener noreferrer">Open source ↗</a>
      </div>
      <div className="phrase-grid">
        {phrases.map((phrase) => {
          const id = phrase.chuukese;
          return <article className="phrase-card" key={id}>
            <div><span className="phrase-english">{phrase.english}</span><strong>{phrase.chuukese}</strong>{phrase.note && <small>{phrase.note}</small>}</div>
            <button type="button" className="phrase-audio" onClick={() => speak(phrase.chuukese, id)} disabled={speaking !== null && speaking !== id} aria-label={`Play browser pronunciation for ${phrase.chuukese}`}>
              {speaking === id ? 'Speaking…' : '▶ Preview'}
            </button>
          </article>;
        })}
      </div>
      <div className="phrasebook-note">
        <strong>Audio review status:</strong> Preview uses the browser/device speech engine with a <code>chk</code> language hint. It is not a verified Chuukese voice. <a href={AUDIO_SOURCE} target="_blank" rel="noopener noreferrer">Open a public community recording set ↗</a> and have Bianca confirm natural pronunciation before anything is promoted.
      </div>
    </section>
  );
};

export default Phrasebook;
