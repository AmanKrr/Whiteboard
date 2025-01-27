'use client';
import { useState } from 'react';

export default function useSelection() {
  const [selectedId, setSelectedId] = useState<{ id: string | null; type: ToolType | '' }>({ id: null, type: '' });

  return { selectedId, setSelectedId };
}
