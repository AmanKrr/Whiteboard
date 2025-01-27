'use client';
import { drawingTools } from '../../constants/drawingtools';
import React from 'react';
import ToolbarButtons from '../global/ToolbarButtons';

function LeftToolbar({ onClick, selectedTool }: { onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, tooltype: ToolType) => void; selectedTool: ToolType }) {
  console.log('LeftToolbar re-rendered');

  return (
    <nav className='fixed left-4 top-1/2 z-50 flex w-16 -translate-y-1/2 flex-col items-center rounded-xl border border-white/20 bg-gray-800/70 p-4 shadow-xl backdrop-blur-lg'>
      <div className='flex flex-col space-y-3'>
        {drawingTools.map((item: DrawingTools) => {
          if (item.isSeparator) {
            return <hr key={item.id + 'separator'} className='my-2 w-full border-white/20' />;
          }

          return <ToolbarButtons key={item['id']} item={item} selectedTool={selectedTool} onClick={onClick} />;
        })}
      </div>
    </nav>
  );
}

export default React.memo(LeftToolbar);
