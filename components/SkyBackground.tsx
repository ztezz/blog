import React from 'react';

const SkyBackground: React.FC = () => {
  return (
    <div className="day-atlas fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="day-atlas__grid" />

      <svg className="day-atlas__contours" viewBox="0 0 900 620" fill="none" preserveAspectRatio="xMinYMax slice">
        <path d="M-42 128C91 52 235 62 324 142c80 72 64 167 155 216 102 54 214-17 328 49 67 39 101 102 116 179" />
        <path d="M-55 184c119-70 247-61 324 5 70 60 57 140 137 184 95 51 198-4 297 49 57 31 92 82 114 149" />
        <path d="M-61 245c101-60 207-54 272-1 61 50 52 117 118 155 82 47 171 6 256 48 46 22 80 64 105 120" />
        <path d="M-65 309c82-51 169-47 224-5 51 40 47 96 100 128 68 41 141 13 211 45 37 17 67 48 91 93" />
        <path d="M-68 374c65-43 134-41 178-8 42 32 42 77 84 104 54 35 113 17 169 41 30 13 55 36 76 68" />
      </svg>

      <div className="day-atlas__coordinate day-atlas__coordinate--one" />
      <div className="day-atlas__coordinate day-atlas__coordinate--two" />
    </div>
  );
};

export default SkyBackground;
