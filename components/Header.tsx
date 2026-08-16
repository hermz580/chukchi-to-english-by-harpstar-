
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 md:py-12 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Chukchi to English Translator
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Instantly translate text from the Chukchi language to English using advanced AI.
      </p>
    </header>
  );
};

export default Header;
