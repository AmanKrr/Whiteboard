'use client';
import React from 'react';
import { Rect, Group } from 'react-konva';

interface RectangleToolProps {
  rectangles: any[];
  setSelectedId: React.Dispatch<
    React.SetStateAction<{
      id: string | null;
      type: ToolType | '';
    }>
  >;
  selectedId: string | null;
}

const RectangleTool: React.FC<RectangleToolProps> = ({ rectangles, setSelectedId, selectedId }) => {
  function handleSelection(id: string) {
    setSelectedId({ id: id, type: 'rectangle' });
  }
  return (
    <>
      {rectangles.map(rect => (
        <Group key={rect.id} id={rect.id} draggable={selectedId === rect.id} onClick={() => handleSelection(rect.id)} onTap={() => handleSelection(rect.id)}>
          {/* Invisible Hit Area */}
          <Rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill='transparent'
            strokeWidth={rect.strokeWidth + 10}
            stroke='transparent'
            onClick={() => handleSelection(rect.id)}
            onTap={() => handleSelection(rect.id)}
          />

          {/* Actual Rectangle */}
          <Rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill='transparent'
            stroke={rect.color}
            strokeWidth={rect.strokeWidth}
            // opacity={selectedId === rect.id ? 0.7 : 1}
            onClick={() => handleSelection(rect.id)}
            onTap={() => handleSelection(rect.id)}
          />
        </Group>
      ))}
    </>
  );
};

export default RectangleTool;
