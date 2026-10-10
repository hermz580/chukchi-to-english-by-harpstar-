import React, { useCallback, useState } from 'react';
import Header from './components/Header';
import TextArea from './components/TextArea';
import TranslateButton from './components/TranslateButton';
import Phrasebook from './components/Phrasebook';
import HarpStarBranding from './components/HarpStarBranding';
import { ArrowRightIcon } from './components/Icons';

type Direction = 'chukchi-to-english' | 'english-to-chukchi';
interface TranslationData {
  translation: string;
  exampleSource: string;
  exampleTarget: string;
  notes: string;
  confidence: 'low' | 'medium' | 'high';
}

const MAX_TEXT_LENGTH = 4000;
const labels = {
  'chukchi-to-english': { source: 'Chukchi', target: 'English', sourcePlaceholder: 'Type Chukchi in Cyrillic…', targetPlaceholder: 'English translation appears here…' },
  'english-to-chukchi': { source: 'English', target: 'Chukchi', sourcePlaceholder: 'Type English here…', targetPlaceholder: 'Chukchi translation appears here…' },
};

const App: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('chukchi-to-english');
  const [sourceText, setSourceText] = useState('');
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const copy = labels[direction];

  const speak = useCallback((text: string, language: string) => {
    if (!('speechSynthesis' in window) || !text.trim()) {
      setSpeechError('Speech is not available in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.onstart = () => { setSpeechError(null); setIsSpeaking(true); };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => { setIsSpeaking(false); setSpeechError('Speech playback failed. Check the device audio output.'); };
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const handleTranslate = useCallback(async () => {
    const text = sourceText.trim();
    if (!text) { setError(`Enter ${copy.source} text to translate.`); return; }
    if (text.length > MAX_TEXT_LENGTH) { setError(`Keep the text under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`); return; }
    setIsLoading(true); setError(null); setTranslationData(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, direction }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Translation failed.');
      setTranslationData(payload as TranslationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed. Try again.');
    } finally { setIsLoading(false); }
  }, [copy.source, direction, sourceText]);

  const swapDirection = () => {
    setDirection((value) => value === 'chukchi-to-english' ? 'english-to-chukchi' : 'chukchi-to-english');
    setSourceText(translationData?.translation || '');
    setTranslationData(null); setError(null);
  };

  return <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4">
    <div className="w-full max-w-5xl mx-auto"><Header />
      <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div><p className="text-xs uppercase tracking-[0.2em] text-blue-300">Bidirectional translation</p><h1 className="text-2xl font-bold">{copy.source} <span className="text-gray-500">→</span> {copy.target}</h1></div>
          <button type="button" onClick={swapDirection} className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:border-blue-400" aria-label="Swap translation direction">Swap direction</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <TextArea id="source-input" label={copy.source} placeholder={copy.sourcePlaceholder} value={sourceText} maxLength={MAX_TEXT_LENGTH} onChange={(e) => setSourceText(e.target.value)} disabled={isLoading} />
          <TextArea id="translation-output" label={copy.target} placeholder={copy.targetPlaceholder} value={translationData?.translation || ''} readOnly isLoading={isLoading} />
        </div>
        <div className="mt-2 text-right text-xs text-gray-500">{sourceText.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}</div>
        {translationData && <div className="mt-6 space-y-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-300">Context & confidence</h2><span className="rounded-full bg-blue-900/60 px-3 py-1 text-xs capitalize text-blue-200">{translationData.confidence} confidence</span></div>
          <p className="text-blue-300">{translationData.exampleSource}</p><p className="text-gray-300 italic">{translationData.exampleTarget}</p>
          {translationData.notes && <p className="text-sm text-gray-400">{translationData.notes}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={() => speak(translationData.translation, direction === 'chukchi-to-english' ? 'en-US' : 'ckt')} className="rounded-lg border border-blue-500/60 px-3 py-2 text-sm text-blue-200 hover:bg-blue-900/40" aria-label="Speak translation">
              {isSpeaking ? 'Speaking…' : '🔊 Speak translation'}
            </button>
            <button type="button" onClick={() => speak(sourceText, direction === 'chukchi-to-english' ? 'ckt' : 'en-US')} className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:border-blue-400" aria-label="Speak source text">🔊 Speak source</button>
            {isSpeaking && <button type="button" onClick={stopSpeaking} className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-200 hover:bg-red-900/40" aria-label="Stop speech">Stop</button>}
          </div>
        </div>}
        {speechError && <div role="status" className="mt-4 text-center text-amber-200 bg-amber-900/30 p-3 rounded-lg"><p>{speechError}</p><p className="mt-1 text-xs text-amber-100/70">Chukchi speech requires a browser/device voice that supports its language; English audio is broadly supported.</p></div>}
        {error && <div role="alert" className="mt-6 text-center text-red-300 bg-red-900/50 p-3 rounded-lg"><p>{error}</p></div>}
        <div className="mt-8 flex justify-center"><TranslateButton onClick={handleTranslate} isLoading={isLoading}>Translate<ArrowRightIcon className="w-5 h-5 ml-2" /></TranslateButton></div>
        <p className="mt-6 text-center text-xs text-gray-500">Chukchi is a low-resource language. Review high-stakes translations with a fluent speaker.</p>
      </main>
      <Phrasebook /><footer className="text-center text-gray-500 mt-8 text-sm"><p>Powered by the configured translation provider</p><HarpStarBranding /></footer>
    </div>
  </div>;
};
export default App;
