'use client';
import { useState } from 'react';

export default function useToolOptions() {
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  return {
    color,
    setColor,
    strokeWidth,
    setStrokeWidth
  };
}
