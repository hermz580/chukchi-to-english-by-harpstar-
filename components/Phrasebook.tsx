import React from 'react';

const phrases = [
  { chukchi: 'Энъэни', english: 'Hello' },
  { chukchi: 'Иттык?', english: 'How are you?' },
  { chukchi: 'Ённы', english: 'Yes' },
  { chukchi: 'Ыннэн', english: 'No' },
  { chukchi: 'Тыткэн', english: 'Thank you' },
  { chukchi: 'Маяк', english: 'Goodbye' },
];

const Phrasebook: React.FC = () => {
  return (
    <section className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Phrasebook</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phrases.map((phrase, index) => (
          <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <p className="text-lg font-semibold text-blue-400">{phrase.chukchi}</p>
            <p className="text-gray-300">{phrase.english}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Phrasebook;
