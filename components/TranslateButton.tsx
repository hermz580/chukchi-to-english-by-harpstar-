
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface TranslateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({ isLoading, children, ...props }) => {
  return (
    <button
      type="button"
      className="px-10 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800 transition-all duration-300 ease-in-out disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 disabled:scale-100"
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="w-6 h-6 mr-3" />
          Translating...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default TranslateButton;
