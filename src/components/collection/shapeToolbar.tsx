import React from 'react';
import ToolbarButtons from '../global/ToolbarButtons';
import { drawingShapeTools } from '@/constants/drawingtools';

function ShapesToolbar({ onClick, selectedTool }: { onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, tooltype: ToolType) => void; selectedTool: ToolType }) {
  return (
    <nav className='fixed left-[90px] top-1/2 z-50 flex w-16 -translate-y-1/2 flex-col items-center rounded-xl border border-white/20 bg-gray-800/70 p-4 shadow-xl backdrop-blur-lg'>
      <div className='flex flex-col space-y-3'>
        {drawingShapeTools.map((item: DrawingTools) => (
          <ToolbarButtons key={item.id} item={item} selectedTool={selectedTool} onClick={onClick} />
        ))}
      </div>
    </nav>
  );
}

export default React.memo(ShapesToolbar);
