import React from 'react';

interface MobileOrderButtonsProps {
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
}

const MobileOrderButtons: React.FC<MobileOrderButtonsProps> = ({
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onClose,
}) => {
  return (
    <div 
      className="absolute inset-0 flex items-stretch justify-between bg-white/30 backdrop-blur-sm z-20 rounded-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={`flex-1 h-full flex items-center justify-center ${isFirst ? 'opacity-30' : 'active:bg-indigo-100'}`}
        onClick={() => {
          if (!isFirst) {
            onMoveUp();
            onClose();
          }
        }}
        disabled={isFirst}
        aria-label="向上移动"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      <div className="h-full w-px bg-gray-200"></div>
      
      <button
        className={`flex-1 h-full flex items-center justify-center ${isLast ? 'opacity-30' : 'active:bg-indigo-100'}`}
        onClick={() => {
          if (!isLast) {
            onMoveDown();
            onClose();
          }
        }}
        disabled={isLast}
        aria-label="向下移动"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default MobileOrderButtons; 