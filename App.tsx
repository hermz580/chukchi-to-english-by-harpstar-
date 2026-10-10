import React, { useCallback, useState } from 'react';
import './unanu-bridge.css';
import Header from './components/Header';
import TextArea from './components/TextArea';
import TranslateButton from './components/TranslateButton';
import Phrasebook from './components/Phrasebook';
import HarpStarBranding from './components/HarpStarBranding';
import { ArrowRightIcon } from './components/Icons';

type Direction = 'chuukese-to-english' | 'english-to-chuukese';
type Variant = 'chuukese' | 'unanu-namonuito';
interface TranslationData {
  translation: string;
  exampleSource: string;
  exampleTarget: string;
  notes: string;
  confidence: 'low' | 'medium' | 'high';
  confidenceScore: number;
  selfCheck: { backTranslation: string; matchScore: number; verdict: string };
}

const MAX_TEXT_LENGTH = 4000;
interface SpeechRecognitionResultLike { transcript: string; }
interface SpeechRecognitionEventLike { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>; }
interface SpeechRecognitionErrorEventLike { error: string; }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
}
const labels = {
  'chuukese-to-english': { source: 'Chuukese', target: 'English', sourcePlaceholder: 'Type Chuukese here…', targetPlaceholder: 'English translation appears here…' },
  'english-to-chuukese': { source: 'English', target: 'Chuukese', sourcePlaceholder: 'Type English here…', targetPlaceholder: 'Chuukese translation appears here…' },
};

const App: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('chuukese-to-english');
  const [variant, setVariant] = useState<Variant>('chuukese');
  const [sourceText, setSourceText] = useState('');
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
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

  const startListening = useCallback(() => {
      const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SR) { setSttError('Speech-to-text is not supported in this browser. Use Chrome or Edge.'); return; }
      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => { setSttError(null); setIsListening(true); };
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        if (transcript) setSourceText((prev) => (prev ? prev + ' ' : '') + transcript.trim());
      };
      recognition.onerror = (event) => { setIsListening(false); setSttError(`Speech recognition error: ${event.error}.`); };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }, []);

  const handleTranslate = useCallback(async () => {
    const text = sourceText.trim();
    if (!text) { setError(`Enter ${copy.source} text to translate.`); return; }
    if (text.length > MAX_TEXT_LENGTH) { setError(`Keep the text under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`); return; }
    setIsLoading(true); setError(null); setTranslationData(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, direction, variant }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Translation failed.');
      setTranslationData(payload as TranslationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed. Try again.');
    } finally { setIsLoading(false); }
  }, [copy.source, direction, sourceText, variant]);

  const swapDirection = () => {
    setDirection((value) => value === 'chuukese-to-english' ? 'english-to-chuukese' : 'chuukese-to-english');
    setSourceText(translationData?.translation || '');
    setTranslationData(null); setError(null);
  };

  const scoreColor = (score: number) => (score >= 80 ? 'text-emerald-300 bg-emerald-900/50' : score >= 50 ? 'text-amber-200 bg-amber-900/50' : 'text-red-300 bg-red-900/50');

  return <div className="unanu-shell min-h-screen flex flex-col items-center p-4">
    <div className="w-full max-w-5xl mx-auto"><Header />
      <div className="unanu-decorations" aria-hidden="true"><img className="crab" src="/unanu-animations/shoreline-hermit-crab.svg" alt="" /><img className="turtle" src="/unanu-animations/honu-green-turtle.svg" alt="" /><img className="fish" src="/unanu-animations/lagoon-reef-clownfish.svg" alt="" /></div>
      <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div><p className="text-xs uppercase tracking-[0.2em] text-blue-300">Bidirectional translation</p><h1 className="text-2xl font-bold">{copy.source} <span className="text-gray-500">→</span> {copy.target}</h1></div>
          <button type="button" onClick={swapDirection} className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:border-blue-400" aria-label="Swap translation direction">Swap direction</button>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-3"><label htmlFor="language-profile" className="text-sm text-gray-300">Language profile</label><select id="language-profile" value={variant} onChange={(e) => { setVariant(e.target.value as Variant); setTranslationData(null); }} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100"><option value="chuukese">Standard Chuukese (chk)</option><option value="unanu-namonuito">Unanu/Namonuito vocabulary (nmt)</option></select></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="relative">
            <TextArea id="source-input" label={copy.source} placeholder={copy.sourcePlaceholder} value={sourceText} maxLength={MAX_TEXT_LENGTH} onChange={(e) => setSourceText(e.target.value)} disabled={isLoading} />
            {direction === 'english-to-chuukese' && (
              <button type="button" onClick={startListening} disabled={isListening} className="absolute right-3 top-9 rounded-full border border-gray-600 px-3 py-1.5 text-sm text-gray-200 hover:border-blue-400 disabled:opacity-60" aria-label="Speak English to type it">
                {isListening ? '🎙 Listening…' : '🎙 Speak'}
              </button>
            )}
          </div>
          <TextArea id="translation-output" label={copy.target} placeholder={copy.targetPlaceholder} value={translationData?.translation || ''} readOnly isLoading={isLoading} />
        </div>
        <div className="mt-2 text-right text-xs text-gray-500">{sourceText.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}</div>
        {translationData && <div className="mt-6 space-y-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-300">Context & confidence</h2>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreColor(translationData.confidenceScore)}`}>{translationData.confidenceScore}% confidence</span>
              <span className="rounded-full bg-blue-900/60 px-3 py-1 text-xs capitalize text-blue-200">{translationData.confidence}</span>
            </div>
          </div>
          <p className="text-blue-300">{translationData.exampleSource}</p><p className="text-gray-300 italic">{translationData.exampleTarget}</p>
          {translationData.notes && <p className="text-sm text-gray-400">{translationData.notes}</p>}
          {translationData.selfCheck && (
            <div className="rounded-lg border border-gray-600 bg-gray-800/60 p-3">
              <p className="text-xs uppercase tracking-widest text-gray-400">Self-check (round-trip)</p>
              <p className="mt-1 text-sm text-gray-300">{translationData.selfCheck.verdict}</p>
              {translationData.selfCheck.backTranslation && <p className="mt-1 text-xs text-gray-400">Back-translation: “{translationData.selfCheck.backTranslation}”</p>}
              <p className="mt-1 text-xs text-gray-500">Match score: {translationData.selfCheck.matchScore}%</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={() => speak(translationData.translation, direction === 'chuukese-to-english' ? 'en-US' : 'chk')} className="rounded-lg border border-blue-500/60 px-3 py-2 text-sm text-blue-200 hover:bg-blue-900/40" aria-label="Speak translation">
              {isSpeaking ? 'Speaking…' : '🔊 Speak translation'}
            </button>
            <button type="button" onClick={() => speak(sourceText, direction === 'chuukese-to-english' ? 'chk' : 'en-US')} className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:border-blue-400" aria-label="Speak source text">🔊 Speak source</button>
            {isSpeaking && <button type="button" onClick={stopSpeaking} className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-200 hover:bg-red-900/40" aria-label="Stop speech">Stop</button>}
          </div>
        </div>}
        {speechError && <div role="status" className="mt-4 text-center text-amber-200 bg-amber-900/30 p-3 rounded-lg"><p>{speechError}</p><p className="mt-1 text-xs text-amber-100/70">Chuukese speech requires a browser/device voice that supports its language; English audio is broadly supported.</p></div>}
        {sttError && <div role="status" className="mt-4 text-center text-amber-200 bg-amber-900/30 p-3 rounded-lg"><p>{sttError}</p></div>}
        {error && <div role="alert" className="mt-6 text-center text-red-300 bg-red-900/50 p-3 rounded-lg"><p>{error}</p></div>}
        <div className="mt-8 flex justify-center"><TranslateButton onClick={handleTranslate} isLoading={isLoading}>Translate<ArrowRightIcon className="w-5 h-5 ml-2" /></TranslateButton></div>
        <p className="mt-6 text-center text-xs text-gray-500">Chuukese is a low-resource language. Unanu/Namonuito vocabulary is shown only when selected. Review high-stakes translations with a fluent speaker.</p>
      </main>
      <Phrasebook /><footer className="text-center text-gray-500 mt-8 text-sm"><p>Powered by the configured translation provider</p><p className="unanu-credit">By UNANU · Created by Harp★Star</p><HarpStarBranding /></footer>
    </div>
  </div>;
};
export default App;
