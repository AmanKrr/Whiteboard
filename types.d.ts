type ToolType = 'select' | 'pan' | 'pencil' | 'eraser' | 'shapes' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'image' | 'comment';
interface DrawingTools {
  id: number;
  label: string;
  tooltip: string;
  isSeparator: boolean;
  icon: string;
  type: ToolType;
}

type BaseShape = {
  id: string;
  tool: ToolType;
  x: number;
  y: number;
  color?: string;
  strokeWidth?: number;
};

type LineType = {
  id: string;
  tool: 'pencil';
  points: number[];
  color: string;
  strokeWidth: number;
  type: ToolType;
};

type RectangleType = {
  id: string;
  tool: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  type: ToolType;
};

type CircleType = {
  id: string;
  tool: 'circle';
  x: number;
  y: number;
  radius: number;
  color: string;
  strokeWidth: number;
  type: ToolType;
};

type ArrowType = {
  id: string;
  tool: 'arrow';
  points: number[]; // Only two points: [startX, startY, endX, endY]
  color: string;
  strokeWidth: number;
  type: ToolType;
};

type TextType = BaseShape & {
  tool: 'text';
  text: string;
  fontSize: number;
};

type ImageType = BaseShape & {
  tool: 'image';
  src: string;
  width: number;
  height: number;
};

type CommentType = BaseShape & {
  tool: 'comment';
  text: string;
  fontSize: number;
};

type SocketData = {
  mouseEvent: 'MouseDown' | 'MouseUp' | 'MouseMove';
  tool?: ToolType;
  x: number;
  y: number;
  color?: string;
  strokeWidth?: number;
};

/* 
  We unify shape references in state with separate arrays.
  If you want even more optimization, you could store all shapes in a single array,
  but for clarity, we'll keep them separate as you do now.
*/
interface DrawingState {
  pencilLines: LineType[];
  rectangles: RectangleType[];
  circles: CircleType[];
  arrows: ArrowType[];
  texts: TextType[];
  images: ImageType[];
  comments: CommentType[];
}

/* ========================
   Undo/Redo Action Types
======================== */
type UndoRedoAction =
  | {
      type: 'add';
      shapeType: keyof DrawingState;
      shape: LineType | RectangleType | CircleType | ArrowType | TextType | ImageType | CommentType; // final shape after creation
    }
  | {
      type: 'update';
      shapeType: keyof DrawingState;
      shapeId: string;
      oldValue: Partial<BaseShape>;
      newValue: Partial<BaseShape>;
    }
  | {
      type: 'delete';
      shapeType: keyof DrawingState;
      shape: BaseShape;
    };
