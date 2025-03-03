import React from 'react';

interface ToolOptionsProps {
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

// Predefined palette (adjust to suit your taste/brand)
const PRESET_COLORS = [
  '#EF4444', // red-500
  '#F59E0B', // amber-500
  '#10B981', // green-500
  '#3B82F6', // blue-500
  '#8B5CF6' // violet-500
];

const ToolOptions: React.FC<ToolOptionsProps> = ({ color, strokeWidth, onColorChange, onStrokeWidthChange }) => {
  return (
    <div className='absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-6 rounded-xl border border-white/10 bg-gray-800/60 p-5 shadow-xl backdrop-blur-lg transition-all duration-300 hover:bg-gray-800/70'>
      {/* ---- Color Palette ---- */}
      <div className='flex items-center gap-3'>
        <label className='text-sm font-semibold text-gray-200'>Color</label>
        <div className='flex items-center gap-2'>
          {PRESET_COLORS.map(swatch => (
            <button
              key={swatch}
              onClick={() => onColorChange(swatch)}
              className={`h-8 w-8 rounded-full border-2 border-white/10 shadow-md transition-all duration-300 hover:scale-110 hover:border-blue-500 ${color === swatch ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      </div>

      {/* ---- Stroke Width Slider ---- */}
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
            accentColor: '#3B82F6' // Tailwind's blue-500 for a modern look
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(ToolOptions);
