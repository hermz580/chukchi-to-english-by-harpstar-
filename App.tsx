
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TextArea from './components/TextArea';
import TranslateButton from './components/TranslateButton';
import Phrasebook from './components/Phrasebook';
import HarpStarBranding from './components/HarpStarBranding';
import { translate } from './services/llm';
import { ArrowRightIcon } from './components/Icons';

interface TranslationData {
  translation: string;
  exampleChukchi: string;
  exampleEnglish: string;
}

const App: React.FC = () => {
  const [chukchiText, setChukchiText] = useState<string>('');
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = useCallback(async () => {
    if (!chukchiText.trim()) {
      setError('Please enter some text to translate.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setTranslationData(null);

    try {
      const data = await translate(chukchiText);
      setTranslationData(data);
    } catch (err) {
      setError('Failed to translate. Please check your connection or try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [chukchiText]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <Header />
        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <TextArea
              id="chukchi-input"
              label="Chukchi"
              placeholder="Enter Chukchi text here..."
              value={chukchiText}
              onChange={(e) => setChukchiText(e.target.value)}
              disabled={isLoading}
            />
            <TextArea
              id="english-output"
              label="English"
              placeholder="Translation will appear here..."
              value={translationData?.translation || ''}
              readOnly
              isLoading={isLoading}
            />
          </div>
          
          {translationData && (
              <div className="mt-6 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <h3 className="font-semibold text-gray-300">Example:</h3>
                  <p className="text-blue-400">{translationData.exampleChukchi}</p>
                  <p className="text-gray-300 italic">{translationData.exampleEnglish}</p>
              </div>
          )}
          
          {error && (
            <div className="mt-6 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <TranslateButton
              onClick={handleTranslate}
              isLoading={isLoading}
            >
              Translate
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </TranslateButton>
          </div>
        </main>
        <Phrasebook />
        <footer className="text-center text-gray-500 mt-8 text-sm">
          <p>Powered by Google Gemini</p>
          <HarpStarBranding />
        </footer>
      </div>
    </div>
  );
};

export default App;
