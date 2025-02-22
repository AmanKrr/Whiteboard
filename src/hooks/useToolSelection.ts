'use client';
import { useCallback, useState } from 'react';

export default function useToolSelection() {
  const [isDraggable, setIsDraggable] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pan');

  const handleOnToolSelection = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, tooltype: ToolType) => {
    if (tooltype === 'pan') {
      setIsDraggable(true);
    } else {
      setIsDraggable(false);
    }
    setSelectedTool(tooltype);
  }, []);

  return { isDraggable, selectedTool, handleOnToolSelection };
}
