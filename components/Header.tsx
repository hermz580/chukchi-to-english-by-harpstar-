
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 md:py-12 text-left">
      <div className="brand-lockup"><img src="/unanu-logo.svg" alt="UNANU" /><span>UNANU <small>· ChuukeseBridge</small></span></div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        Chuukese ↔ English Translator
      </h1>
      <p className="mt-3 text-lg max-w-2xl">
        Translate with care between Chuukese and English, with an optional Unanu/Namonuito vocabulary profile.
      </p>
    </header>
  );
};

export default Header;
