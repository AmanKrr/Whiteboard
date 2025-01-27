'use client';
import React from 'react';
import { Circle, Group } from 'react-konva';

interface CircleToolProps {
  circles: any[];
  setSelectedId: React.Dispatch<
    React.SetStateAction<{
      id: string | null;
      type: ToolType | '';
    }>
  >;
  selectedId: string | null;
}

const CircleTool: React.FC<CircleToolProps> = ({ circles, setSelectedId, selectedId }) => {
  function handleSelection(id: string) {
    setSelectedId({ id: id, type: 'circle' });
  }

  return (
    <>
      {circles.map(circle => (
        <Group key={circle.id} id={circle.id} draggable={selectedId === circle.id} onClick={() => handleSelection(circle.id)} onTap={() => handleSelection(circle.id)}>
          {/* Invisible Hit Area */}
          <Circle
            x={circle.x}
            y={circle.y}
            radius={circle.radius + 10} // Increase radius for easier selection
            fill='transparent'
            stroke='transparent'
            strokeWidth={circle.strokeWidth + 10}
            onClick={() => handleSelection(circle.id)}
            onTap={() => handleSelection(circle.id)}
          />

          {/* Actual Circle */}
          <Circle
            x={circle.x}
            y={circle.y}
            radius={circle.radius}
            stroke={circle.color}
            strokeWidth={circle.strokeWidth}
            fill='transparent'
            // opacity={selectedId === circle.id ? 0.7 : 1}
            onClick={() => handleSelection(circle.id)}
            onTap={() => handleSelection(circle.id)}
          />
        </Group>
      ))}
    </>
  );
};

export default CircleTool;
