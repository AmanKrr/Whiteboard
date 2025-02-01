'use client';
import { debounce } from 'lodash';
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// A small helper to clone shapes so we keep final snapshot
function cloneShape<T extends BaseShape>(shape: T): T {
  return JSON.parse(JSON.stringify(shape));
}

// A helper to get the correct shape type key
function getShapeType(tool: ToolType): keyof DrawingState {
  switch (tool) {
    case 'pencil':
      return 'pencilLines';
    case 'rectangle':
      return 'rectangles';
    case 'circle':
      return 'circles';
    case 'arrow':
      return 'arrows';
    case 'text':
      return 'texts';
    default:
      return 'pencilLines'; // Fallback, shouldn't happen
  }
}

export function useDrawing(sendMessage: (data: SocketData) => void) {
  // Separate states
  const [pencilLines, setPencilLines] = useState<LineType[]>([]);
  const [rectangles, setRectangles] = useState<RectangleType[]>([]);
  const [circles, setCircles] = useState<CircleType[]>([]);
  const [arrows, setArrows] = useState<ArrowType[]>([]);
  const [texts, setTexts] = useState<TextType[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);

  // Flags/Refs
  const isDrawing = useRef(false);
  const shapeRef = useRef<any>(null);

  // Undo/Redo stacks
  const undoStack = useRef<UndoRedoAction[]>([]);
  const redoStack = useRef<UndoRedoAction[]>([]);

  const MAX_HISTORY = 50;

  // Helper to push an action onto the Undo stack
  const pushToUndoStack = (action: UndoRedoAction) => {
    if (undoStack.current.length >= MAX_HISTORY) {
      undoStack.current.shift(); // Remove the oldest action
    }
    undoStack.current.push(action);
    redoStack.current = [];
  };

  const pushToUndoStackDebounced = debounce(
    (shapeType, oldShape, oldValue, newValue) => {
      pushToUndoStack({
        type: 'update',
        shapeType,
        shapeId: oldShape.id,
        oldValue,
        newValue
      });
    },
    200 // Delay of 200ms
  );

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
        setTexts(prev => [...prev, { id: uuidv4(), tool, x, y, text: textContent, color, fontSize: 24 }]);
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

    if (shapeRef.current) {
      sendMessage({ mouseEvent: 'MouseDown', tool, ...shapeRef.current });
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
          shapeRef.current = updated[lastIndex];
          return updated;
        });
        break;

      case 'rectangle':
        setRectangles(prev => {
          if (!shapeRef.current) return prev; // Additional safety check
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], width: x - shapeRef.current.x, height: y - shapeRef.current.y };
          shapeRef.current = updated[lastIndex];
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
          shapeRef.current = updated[lastIndex];
          return updated;
        });
        break;

      case 'arrow':
        setArrows(prev => {
          if (!shapeRef.current) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], points: [shapeRef.current.points[0], shapeRef.current.points[1], x, y] };
          shapeRef.current = updated[lastIndex];
          return updated;
        });
        break;

      default:
        break;
    }

    if (shapeRef.current) {
      sendMessage({ mouseEvent: 'MouseMove', x, y });
    }
  };

  const stopDrawing = () => {
    if (shapeRef.current) {
      // Get final shape type
      const shapeType = getShapeType(shapeRef.current.tool);
      // Clone the shape so we store the final snapshot
      const finalShape = cloneShape(shapeRef.current);
      // Now push to the undo stack as an 'add' action
      pushToUndoStack({ type: 'add', shapeType, shape: finalShape });
      sendMessage({ mouseEvent: 'MouseUp', ...shapeRef.current });
    }
    isDrawing.current = false;
    shapeRef.current = null;
    console.log('Shapes Data:', { pencilLines, rectangles, circles, arrows });
  };

  // Undo the last action
  const undo = () => {
    if (undoStack.current.length === 0) return;
    console.log(undoStack);
    const lastAction = undoStack.current.pop()!;
    redoStack.current.push(lastAction);

    console.log('shape type: ', lastAction);
    switch (lastAction.type) {
      case 'add': {
        // Remove the shape from state
        switch (lastAction.shapeType) {
          case 'pencilLines':
            setPencilLines(prev => prev.filter(s => s.id !== lastAction.shape.id));
            break;
          case 'rectangles':
            setRectangles(prev => prev.filter(s => s.id !== lastAction.shape.id));
            break;
          case 'circles':
            setCircles(prev => prev.filter(s => s.id !== lastAction.shape.id));
            break;
          case 'arrows':
            setArrows(prev => prev.filter(s => s.id !== lastAction.shape.id));
            break;
          case 'texts':
            setTexts(prev => prev.filter(s => s.id !== lastAction.shape.id));
            break;
          default:
            break;
        }
        break;
      }
      case 'update': {
        // revert the shape to oldValue
        const { shapeId, shapeType, oldValue } = lastAction;
        switch (shapeType) {
          case 'rectangles':
            setRectangles(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...oldValue } as RectangleType;
                }
                return shape;
              });
            });
            break;
          // handle 'circles', 'arrows', 'texts', etc. similarly
          case 'circles':
            setCircles(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...oldValue } as CircleType;
                }
                return shape;
              });
            });
            break;
          case 'arrows':
            setArrows(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...oldValue } as ArrowType;
                }
                return shape;
              });
            });
            break;
          case 'texts':
            setTexts(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...oldValue } as TextType;
                }
                return shape;
              });
            });
            break;
          default:
            break;
        }
        break;
      }
      case 'delete': {
        // shape was removed, so add it back
        const { shapeType, shape } = lastAction;
        switch (shapeType) {
          case 'rectangles':
            setRectangles(prev => [...prev, shape as RectangleType]);
            break;
          case 'circles':
            setCircles(prev => [...prev, shape as CircleType]);
            break;
          case 'arrows':
            setArrows(prev => [...prev, shape as unknown as ArrowType]);
            break;
          case 'texts':
            setTexts(prev => [...prev, shape as TextType]);
            break;
          // etc...
        }
        break;
      }
    }
  };

  // Redo the last undone action
  const redo = () => {
    if (redoStack.current.length === 0) return;
    const lastUndo = redoStack.current.pop()!;
    undoStack.current.push(lastUndo);

    // Add the shape back to state
    switch (lastUndo.type) {
      case 'add': {
        switch (lastUndo.shapeType) {
          case 'pencilLines':
            setPencilLines(prev => [...prev, lastUndo.shape as LineType]);
            break;
          case 'rectangles':
            setRectangles(prev => [...prev, lastUndo.shape as RectangleType]);
            break;
          case 'circles':
            setCircles(prev => [...prev, lastUndo.shape as CircleType]);
            break;
          case 'arrows':
            setArrows(prev => [...prev, lastUndo.shape as ArrowType]);
            break;
          case 'texts':
            setTexts(prev => [...prev, lastUndo.shape as TextType]);
            break;
          default:
            break;
        }
        break;
      }
      case 'update': {
        // apply newValue
        const { shapeId, shapeType, newValue } = lastUndo;
        switch (shapeType) {
          case 'rectangles':
            setRectangles(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...newValue } as RectangleType;
                }
                return shape;
              });
            });
            break;
          case 'circles':
            setCircles(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...newValue } as CircleType;
                }
                return shape;
              });
            });
            break;
          case 'arrows':
            setArrows(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...newValue } as ArrowType;
                }
                return shape;
              });
            });
            break;
          case 'texts':
            setTexts(prev => {
              return prev.map(shape => {
                if (shape.id === shapeId) {
                  return { ...shape, ...newValue } as TextType;
                }
                return shape;
              });
            });
            break;
          // similarly for circles, arrows, etc.
        }
        break;
      }
      case 'delete': {
        // re-delete the shape
        // that means remove it from state
        const { shapeType, shape } = lastUndo;
        switch (shapeType) {
          case 'rectangles':
            setRectangles(prev => prev.filter(s => s.id !== shape.id));
            break;
          case 'circles':
            setCircles(prev => prev.filter(s => s.id !== shape.id));
            break;
          case 'arrows':
            setArrows(prev => prev.filter(s => s.id !== shape.id));
            break;
          case 'texts':
            setTexts(prev => prev.filter(s => s.id !== shape.id));
            break;
          // etc. for other shape arrays
        }
        break;
      }
    }
  };

  function updateStackHelper<T extends BaseShape | ArrowType>(oldShape: T, options: { color: string; strokeWidth: number; type: ToolType }) {
    const { color, strokeWidth, type } = options;
    const shapeType = getShapeType(type);

    // Values for undo
    const oldValue = {
      color: oldShape!.color!,
      strokeWidth: oldShape!.strokeWidth!
    } as Partial<T>;

    // Construct the new shape by merging oldShape with changes
    const newShape: T = {
      ...oldShape,
      color: color ?? oldShape.color,
      strokeWidth: strokeWidth ?? oldShape.strokeWidth
    };

    // Values for redo
    const newValue = {
      color: newShape.color,
      strokeWidth: newShape.strokeWidth
    } as Partial<T>;

    pushToUndoStackDebounced(shapeType, oldShape, oldValue, newValue);

    // Return the newly updated shape if you need it
    return newShape;
  }

  const updateDrawing = (id: string, type: ToolType, color: string | null = null, strokeWidth: number | null = null) => {
    switch (type) {
      case 'rectangle':
        setRectangles((prev: RectangleType[]) => {
          if (prev) {
            return prev.map((items: RectangleType) => {
              if (items['id'] == id && (color || strokeWidth)) {
                const newShape = updateStackHelper(items, { color: color!, strokeWidth: strokeWidth!, type });
                return newShape;
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
                const newShape = updateStackHelper(items, { color: color!, strokeWidth: strokeWidth!, type });
                return newShape;
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
                const newShape = updateStackHelper(items, { color: color!, strokeWidth: strokeWidth!, type });
                return newShape;
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

  return { pencilLines, rectangles, circles, arrows, texts, images, comments, startDrawing, continueDrawing, stopDrawing, updateDrawing, setTexts, redo, undo };
}
