
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  isLoading?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ id, label, isLoading = false, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block mb-2 text-md font-medium text-gray-400">
        {label}
      </label>
      <div className="relative">
        <textarea
          id={id}
          rows={10}
          className={`w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200 transition-all duration-200 resize-none ${props.readOnly ? 'bg-gray-700/60 cursor-default' : 'hover:border-gray-500'}`}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700/50 rounded-xl">
            <LoadingSpinner className="w-8 h-8 text-blue-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextArea;
