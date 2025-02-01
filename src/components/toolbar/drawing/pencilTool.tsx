'use client';
import React from 'react';
import { Group, Line } from 'react-konva';

interface PencilToolProps {
  color?: string;
  strokeWidth?: number;
  lines: any[];
  setSelectedId?: React.Dispatch<
    React.SetStateAction<{
      id: string | null;
      type: ToolType | '';
    }>
  >;
  selectedId: string | null;
}

const PencilTool: React.FC<PencilToolProps> = ({ lines, selectedId }) => {
  // function handleSelection(id: string) {
  //   setSelectedId({ id: id, type: 'pencil' });
  // }

  return (
    <>
      {lines.map(line => (
        <Group key={line.id} id={line.id} draggable={selectedId == line.id} /*onClick={() => handleSelection(line.id)} onTap={() => handleSelection(line.id)}*/>
          {/* Invisible Hit Area for Easier Clicks */}
          <Line
            // id={line.id}
            points={line.points}
            stroke='transparent' // Invisible stroke
            strokeWidth={line.strokeWidth + 10} // Larger hit area
            hitStrokeWidth={20} // Ensures selection works well
            // onClick={() => handleSelection(line.id)}
            // onTap={() => handleSelection(line.id)}
          />

          {/* Actual Visible Line */}
          <Line
            // id={line.id}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            tension={0.5}
            lineCap='round'
            lineJoin='round'
            // opacity={selectedId === line.id ? 0.7 : 1}
            // onClick={() => handleSelection(line.id)}
            // onTap={() => handleSelection(line.id)}
          />
        </Group>
      ))}
    </>
  );
};

export default PencilTool;
