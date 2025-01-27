import React from 'react';

interface ToolOptionsProps {
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

const ToolOptions: React.FC<ToolOptionsProps> = ({ color, strokeWidth, onColorChange, onStrokeWidthChange }) => {
  return (
    <div className='absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-6 rounded-xl border border-white/10 bg-gray-800/60 p-5 shadow-xl backdrop-blur-lg transition-all duration-300 hover:bg-gray-800/70'>
      {/* Color Picker */}
      <div className='flex items-center gap-3'>
        <label className='text-sm font-semibold text-gray-200'>Color</label>
        <div className='relative'>
          <input type='color' value={color} onChange={e => onColorChange(e.target.value)} className='absolute inset-0 h-full w-full cursor-pointer opacity-0' />
          <div
            className='flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 shadow-md transition-all duration-300 hover:ring-2 hover:ring-blue-500'
            style={{ backgroundColor: color }}
          ></div>
        </div>
      </div>

      {/* Stroke Width Slider */}
      <div className='flex items-center gap-3'>
        <label className='text-sm font-semibold text-gray-200'>Width</label>
        <input
          type='range'
          min='1'
          max='10'
          value={strokeWidth}
          onChange={e => onStrokeWidthChange(Number(e.target.value))}
          className='h-2 w-28 cursor-pointer appearance-none rounded-full bg-gray-600'
          style={{
            accentColor: '#3B82F6' // Tailwind's blue-500 for modern look
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(ToolOptions);
