'use client';
import useToolSelection from '@/hooks/useToolSelection';
import LeftToolbar from './leftToolbar';
import ShapesToolbar from './shapeToolbar';
import React from 'react';
import dynamic from 'next/dynamic';

const InfiniteStage = dynamic(() => import('../stage/infiniteStage'), { ssr: false, loading: () => <p style={{ color: 'black' }}>Loading</p> });

function Board() {
  const { isDraggable, selectedTool, handleOnToolSelection } = useToolSelection();
  console.log('Board re-rendered');

  return (
    <div className='relative h-screen w-full overflow-hidden bg-gray-100'>
      <LeftToolbar onClick={handleOnToolSelection} selectedTool={selectedTool} />
      {['rectangle', 'circle', 'arrow', 'shapes'].includes(selectedTool) && <ShapesToolbar onClick={handleOnToolSelection} selectedTool={selectedTool} />}
      <InfiniteStage isDraggable={isDraggable} selectedTool={selectedTool} onTextNodeCreation={() => handleOnToolSelection(null, 'select')} />
    </div>
  );
}

export default React.memo(Board);
