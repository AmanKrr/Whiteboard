'use client';
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useDrawing() {
  const [pencilLines, setPencilLines] = useState<LineType[]>([]);
  const [rectangles, setRectangles] = useState<RectangleType[]>([]);
  const [circles, setCircles] = useState<CircleType[]>([]);
  const [arrows, setArrows] = useState<ArrowType[]>([]);
  const [texts, setTexts] = useState<TextType[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const isDrawing = useRef(false);
  const shapeRef = useRef<any>(null);

  const startDrawing = (
    tool: ToolType,
    color: string,
    strokeWidth: number,
    x: number,
    y: number,
    textContent?: string,
    imageUrl?: string,
    onTextCallback: ((id: string) => void) | null = null
  ) => {
    isDrawing.current = true;
    console.log('tool', tool);

    switch (tool) {
      case 'pencil':
        shapeRef.current = { id: uuidv4(), tool, points: [x, y], color, strokeWidth, type: 'pencil' };
        setPencilLines(prev => [...prev, shapeRef.current]);
        break;

      case 'rectangle':
        shapeRef.current = { id: uuidv4(), tool, x, y, width: 0, height: 0, color, strokeWidth, type: 'rectangle' };
        setRectangles(prev => [...prev, shapeRef.current]);
        break;

      case 'circle':
        shapeRef.current = { id: uuidv4(), tool, x, y, radius: 0, color, strokeWidth, type: 'circle' };
        setCircles(prev => [...prev, shapeRef.current]);
        break;

      case 'arrow':
        shapeRef.current = { id: uuidv4(), tool, points: [x, y, x, y], color, strokeWidth, type: 'arrow' };
        setArrows(prev => [...prev, shapeRef.current]);
        break;

      case 'text':
        if (!textContent) return; // Prevent adding empty text
        const id = uuidv4();
        if (onTextCallback) onTextCallback(id);
        setTexts(prev => [...prev, { id: uuidv4(), tool, x, y, text: textContent, color, fontSize: 16 }]);
        break;

      // case 'image':
      //   if (!imageUrl) return; // Prevent adding empty images
      //   setImages(prev => [...prev, { id: uuidv4(), tool, x, y, src: imageUrl, width: 100, height: 100 }]);
      //   break;

      // case 'comment':
      //   setComments(prev => [...prev, { id: uuidv4(), tool, x, y, text: 'New comment', color: 'black', fontSize: 14 }]);
      //   break;

      default:
        break;
    }
  };

  const continueDrawing = (x: number, y: number) => {
    if (!isDrawing.current || !shapeRef.current) return; // Ensure shapeRef.current is valid

    switch (shapeRef.current.tool) {
      case 'pencil':
        setPencilLines(prev => {
          if (prev.length === 0) return prev; // Ensure there's something to update
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], points: [...updated[lastIndex].points, x, y] };
          return updated;
        });
        break;

      case 'rectangle':
        setRectangles(prev => {
          if (!shapeRef.current) return prev; // Additional safety check
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], width: x - shapeRef.current.x, height: y - shapeRef.current.y };
          return updated;
        });
        break;

      case 'circle':
        if (!shapeRef.current) return; // Prevent null reference
        const radius = Math.sqrt(Math.pow(x - shapeRef.current.x, 2) + Math.pow(y - shapeRef.current.y, 2));
        setCircles(prev => {
          if (prev.length === 0) return prev; // Ensure there's something to update
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], radius };
          return updated;
        });
        break;

      case 'arrow':
        setArrows(prev => {
          if (!shapeRef.current) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], points: [shapeRef.current.points[0], shapeRef.current.points[1], x, y] };
          return updated;
        });
        break;

      default:
        break;
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    shapeRef.current = null;
    console.log('Shapes Data:', { pencilLines, rectangles, circles, arrows });
  };

  const updateDrawing = (id: string, type: ToolType, color: string | null = null, strokeWidth: number | null = null) => {
    switch (type) {
      case 'rectangle':
        setRectangles((prev: RectangleType[]) => {
          if (prev) {
            return prev.map((items: RectangleType) => {
              if (items['id'] == id && (color || strokeWidth)) {
                return {
                  ...items,
                  color: color ?? items['color'],
                  strokeWidth: strokeWidth ?? items['strokeWidth']
                };
              }

              return items;
            });
          }

          return prev;
        });
        break;
      case 'circle':
        setCircles((prev: CircleType[]) => {
          if (prev) {
            return prev.map((items: CircleType) => {
              if (items['id'] == id && (color || strokeWidth)) {
                return {
                  ...items,
                  color: color ?? items['color'],
                  strokeWidth: strokeWidth ?? items['strokeWidth']
                };
              }

              return items;
            });
          }

          return prev;
        });
        break;
      case 'arrow':
        setArrows((prev: ArrowType[]) => {
          if (prev) {
            return prev.map((items: ArrowType) => {
              if (items['id'] == id && (color || strokeWidth)) {
                return {
                  ...items,
                  color: color ?? items['color'],
                  strokeWidth: strokeWidth ?? items['strokeWidth']
                };
              }

              return items;
            });
          }

          return prev;
        });
        break;

      default:
        break;
    }
  };

  return { pencilLines, rectangles, circles, arrows, texts, images, comments, startDrawing, continueDrawing, stopDrawing, updateDrawing, setTexts };
}
