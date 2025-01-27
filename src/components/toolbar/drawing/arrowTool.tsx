'use client';
import React from 'react';
import { Arrow, Group } from 'react-konva';

interface ArrowToolProps {
  arrows: any[];
  setSelectedId: React.Dispatch<
    React.SetStateAction<{
      id: string | null;
      type: ToolType | '';
    }>
  >;
  selectedId: string | null;
}

const ArrowTool: React.FC<ArrowToolProps> = ({ arrows, setSelectedId, selectedId }) => {
  function handleSelection(id: string) {
    setSelectedId({ id: id, type: 'arrow' });
  }

  return (
    <>
      {arrows.map(arrow => (
        <Group key={arrow.id} id={arrow.id} draggable={selectedId === arrow.id} onClick={() => handleSelection(arrow.id)} onTap={() => handleSelection(arrow.id)}>
          {/* Invisible Hit Area */}
          <Arrow
            points={arrow.points}
            stroke='transparent'
            strokeWidth={arrow.strokeWidth + 10}
            hitStrokeWidth={20} // Ensures selection works well
            onClick={() => handleSelection(arrow.id)}
            onTap={() => handleSelection(arrow.id)}
          />

          {/* Actual Arrow */}
          <Arrow
            points={arrow.points}
            stroke={arrow.color}
            strokeWidth={arrow.strokeWidth}
            lineCap='round'
            lineJoin='round'
            pointerLength={10} // Arrowhead length
            pointerWidth={10}
            fill={arrow.color}
            // opacity={selectedId === arrow.id ? 0.7 : 1}
            onClick={() => handleSelection(arrow.id)}
            onTap={() => handleSelection(arrow.id)}
          />
        </Group>
      ))}
    </>
  );
};

export default ArrowTool;
