'use client';
import useInfiniteStage from '@/hooks/useInfiniteStage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Text } from 'react-konva';
import PencilTool from '../toolbar/drawing/pencilTool';
import { useDrawing } from '@/hooks/useDrawing';
import SelectionLayer from './selectionLayer';
import useSelection from '@/hooks/useSelection';
import useToolOptions from '@/hooks/useToolOptions';
import ToolOptions from '../toolbar/drawing/toolOptions';
import RectangleTool from '../toolbar/drawing/rectangleTool';
import CircleTool from '../toolbar/drawing/circleTool';
import ArrowTool from '../toolbar/drawing/arrowTool';
// import TextTool from '../toolbar/drawing/textTools';
import { useWebSocket } from '@/hooks/useWebsockets';
import OnlineUsers from '../collection/Users';
import Cursor from '../global/Cursor';
// import Cursor from '../global/Cursor';
// import { randomUUID } from 'crypto';

interface InfiniteStageProps {
  selectedTool: ToolType;
  isDraggable: boolean;
  onTextNodeCreation: () => void;
}

function PublicInfiniteStage({ selectedTool, isDraggable, onTextNodeCreation }: InfiniteStageProps) {
  // State to track stage position
  const { sendMessage, remoteLines, activeUsers, cursors, userId } = useWebSocket(`ws://localhost:8000/ws/public`);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const { selectedId, setSelectedId } = useSelection();
  const { strokeWidth, setStrokeWidth, setColor, color } = useToolOptions();
  const { scale, stageRef, handleWheel } = useInfiniteStage(setStagePos);
  const { pencilLines, rectangles, circles, arrows, texts, startDrawing, continueDrawing, stopDrawing, updateDrawing, undo, redo } = useDrawing(sendMessage, userId);

  // Function to update position when the stage moves (panning)
  // const handleDragMove = (e: any) => {
  //   const stage = e.target.getStage()
  //   if (stage) {
  //     setStagePos({ x: stage.x(), y: stage.y() })
  //   }
  // }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      if (ctrlOrMeta && !shift && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if ((ctrlOrMeta && e.key.toLowerCase() === 'y') || (ctrlOrMeta && shift && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getExactDrawCoordintaesAfterPan = useCallback((stage: any, pointer: any) => {
    // Get a copy of the stage’s transform and invert it
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();

    // Transform the pointer position into local coordinates
    const localPos = transform.point(pointer);
    const localX = localPos.x;
    const localY = localPos.y;
    return [localX, localY];
  }, []);

  const handleMouseDown = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      const [localX, localY] = getExactDrawCoordintaesAfterPan(stage, pointer);
      if (!pointer) return;

      switch (selectedTool) {
        case 'pan':
          break;
        case 'select':
          const clickedOnEmpty = e.target === e.target.getStage(); // Detect if clicking on stage (empty area)
          if (clickedOnEmpty) {
            setSelectedId({ id: null, type: '' }); // Deselect shape
          }
          break;
        default:
          // If tool is eraser, force color to white
          const finalColor = selectedTool === 'eraser' ? '#ffffff' : color;
          const finalStrokeWidth = selectedTool === 'eraser' ? 5 : strokeWidth; // Increase stroke size for eraser
          if (selectedTool == 'text') {
            const callback = function onSelectTypeText(id: string) {
              setSelectedId({ id: id, type: 'text' });
              onTextNodeCreation();
            };
            startDrawing('text', finalColor, finalStrokeWidth, localX, localY, 'Enter text', '', callback);
          } else {
            startDrawing(selectedTool, finalColor, finalStrokeWidth, localX, localY);
          }
          break;
      }
    },
    [selectedTool, color, strokeWidth, getExactDrawCoordintaesAfterPan, setSelectedId, onTextNodeCreation, startDrawing]
  );

  const memoizedContinueDrawing = useCallback(
    (x: number, y: number, pointer: any) => {
      continueDrawing(x, y, pointer);
    },
    [continueDrawing]
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const [localX, localY] = getExactDrawCoordintaesAfterPan(stage, pointer);
      memoizedContinueDrawing(localX, localY, pointer);
    },
    [getExactDrawCoordintaesAfterPan, memoizedContinueDrawing]
  );

  const getCursorStyle = useCallback((tool: ToolType) => {
    switch (tool) {
      case 'pencil':
        return 'url(/assets/mouse/pencil.svg) 6 26, auto';
      case 'eraser':
        return 'url(/assets/mouse/eraser.svg) 6 26, auto';
      case 'line':
        return 'crosshair';
      case 'select':
        return 'url("/assets/mouse/arrowhead.svg"), auto';
      case 'pan':
        return 'grab';
      case 'shapes':
        return 'crosshair';
      default:
        return 'default';
    }
  }, []);

  const mousePoint = useMemo(() => {
    return getCursorStyle(selectedTool);
  }, [selectedTool, getCursorStyle]);

  const handleOnColorChange = useCallback(
    (c: string) => {
      if (selectedId.id && selectedId.type) {
        updateDrawing(selectedId.id, selectedId.type, c, null);
      }
      setColor(c);
    },
    [selectedId, updateDrawing, setColor]
  );

  const handleStrokeWidthChange = useCallback(
    (sw: number) => {
      if (selectedId.id && selectedId.type) {
        updateDrawing(selectedId.id, selectedId.type, null, sw);
      }
      setStrokeWidth(sw);
    },
    [selectedId, updateDrawing, setStrokeWidth]
  );

  return (
    <>
      {['pencil', 'line', 'rectangle', 'circle', 'arrow', 'select'].includes(selectedTool) && (
        <>
          {selectedTool == 'select' && !selectedId['id'] ? (
            <></>
          ) : (
            <ToolOptions color={color} strokeWidth={strokeWidth} onColorChange={handleOnColorChange} onStrokeWidthChange={handleStrokeWidthChange} />
          )}
        </>
      )}
      <Stage
        className='bg-white'
        width={window.innerWidth} // or use a responsive approach
        height={window.innerHeight}
        draggable={isDraggable} // allows panning by dragging
        onWheel={handleWheel} // custom zoom
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        // onDragMove={handleDragMove}
        // if you want to store position in state, you could do:
        // x={stagePos.x}
        // y={stagePos.y}
        // onDragEnd={e => {
        //   setStagePos({ x: e.target.x(), y: e.target.y() })
        // }}
        style={{ cursor: mousePoint }} // optional custom cursor
      >
        {/* 
          1) BACKGROUND LAYER:
             - Put large static background elements here (grid, background color, etc.).
             - listening={false} so it doesn't capture pointer events.
        */}
        <Layer id='background-layer' listening={false}>
          {/* <InfiniteGrid width={window.innerWidth} height={window.innerHeight} stagePos={stagePos} scale={scale} cellSize={50} strokeColor='#ccc' strokeWidth={1} /> */}
        </Layer>

        {/*
          2) DRAWING LAYER:
             - PencilTool for user lines.
             - Additional shapes that users create, manipulate, etc.
        */}
        <Layer id='drawing-layer'>
          <PencilTool lines={[...pencilLines, ...remoteLines]} setSelectedId={setSelectedId} selectedId={selectedId['id']} />
          <RectangleTool rectangles={rectangles} setSelectedId={setSelectedId} selectedId={selectedId['id']} />
          <CircleTool circles={circles} setSelectedId={setSelectedId} selectedId={selectedId['id']} />
          <ArrowTool arrows={arrows} setSelectedId={setSelectedId} selectedId={selectedId['id']} />
          {/* <TextTool selectedId={selectedId['id']} setSelectedId={setSelectedId} texts={texts} onTextDoubleClick={handleTextDoubleClick} /> */}
          {/* <ImageTool images={images} setSelectedId={setSelectedId} selectedId={selectedId} />
          <CommentTool comments={comments} setSelectedId={setSelectedId} selectedId={selectedId} /> */}
        </Layer>

        <SelectionLayer
          shapes={{ rectangle: rectangles, circle: circles, arrow: arrows, text: texts }}
          selectedId={selectedId}
          selectedTool={selectedTool}
          setStrokeWidth={setStrokeWidth}
          setColor={setColor}
        />

        {/*
          3) OVERLAY LAYER:
             - UI hints, text labels, selection boxes, cursors, etc., on top of everything else.
        */}
        <Layer id='overlay-layer'>
          <Text x={100} y={50} text='Drag to pan | Scroll to zoom' fontSize={24} fill='#333' />
        </Layer>
      </Stage>
      <OnlineUsers key='users' users={activeUsers} />
      {/* <TextEditor isEditing={!!editingTextId} position={inputPosition} value={inputValue} onChange={handleTextChange} onSave={handleTextSave} /> */}
      <Cursor cursors={cursors} userId={userId} />
    </>
  );
}

export default React.memo(PublicInfiniteStage);
