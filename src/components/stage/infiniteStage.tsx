'use client';
import useInfiniteStage from '@/hooks/useInfiniteStage';
import React, { useEffect, useMemo, useState } from 'react';
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
import { debounce } from 'lodash';

interface InfiniteStageProps {
  selectedTool: ToolType;
  isDraggable: boolean;
  onTextNodeCreation: () => void;
}

function InfiniteStage({ selectedTool, isDraggable, onTextNodeCreation }: InfiniteStageProps) {
  // State to track stage position
  const { sendMessage, remoteLines } = useWebSocket();
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const { selectedId, setSelectedId } = useSelection();
  const { strokeWidth, setStrokeWidth, setColor, color } = useToolOptions();
  const { scale, stageRef, handleWheel } = useInfiniteStage(setStagePos);
  const { pencilLines, rectangles, circles, arrows, texts, startDrawing, continueDrawing, stopDrawing, updateDrawing, undo, redo } = useDrawing(sendMessage);

  // Function to update position when the stage moves (panning)
  // const handleDragMove = (e: any) => {
  //   const stage = e.target.getStage()
  //   if (stage) {
  //     setStagePos({ x: stage.x(), y: stage.y() })
  //   }
  // }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Check for Ctrl (Windows) or Meta (Mac) pressed
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrlOrMeta && !shift && e.key.toLowerCase() === 'z') {
        // Ctrl + Z or Cmd + Z => Undo
        e.preventDefault();
        undo();
      } else if ((ctrlOrMeta && e.key.toLowerCase() === 'y') || (ctrlOrMeta && shift && e.key.toLowerCase() === 'z')) {
        // Ctrl + Y or Ctrl + Shift + Z => Redo
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  const mousePoint = useMemo(() => {
    return getCursorStyle(selectedTool);
  }, [selectedTool]);

  const getExactDrawCoordintaesAfterPan = (stage: any, pointer: any) => {
    // Get a copy of the stage’s transform and invert it
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();

    // Transform the pointer position into local coordinates
    const localPos = transform.point(pointer);
    const localX = localPos.x;
    const localY = localPos.y;
    return [localX, localY];
  };

  const handleMouseDown = (e: any) => {
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
  };

  const handleMouseMove = debounce((e: any) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const [localX, localY] = getExactDrawCoordintaesAfterPan(stage, pointer);
    if (!pointer) return;

    continueDrawing(localX, localY);
  }, 14);

  function getCursorStyle(selectedTool: ToolType) {
    switch (selectedTool) {
      case 'pencil':
        return 'url(/assets/mouse/pencil.svg) 6 26, auto'; // Custom pencil cursor
      case 'eraser':
        return 'url(/assets/mouse/eraser.svg) 6 26, auto';
      case 'line':
        return 'crosshair';
      case 'select':
        return 'url("/assets/mouse/arrowhead.svg"), auto';
      case 'pan':
        return 'grab';
      default:
        return 'default';
    }
  }

  const handleOnColorChange = debounce((color: string) => {
    const { id, type } = selectedId;
    if (id && type) {
      updateDrawing(id, type, color);
    }
    setColor(color);
  }, 80);

  const handleStrokeWidthChange = debounce((strokeWidth: number) => {
    const { id, type } = selectedId;
    if (id && type) {
      updateDrawing(id, type, null, strokeWidth);
    }
    setStrokeWidth(strokeWidth);
  }, 80);

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
      {/* <TextEditor isEditing={!!editingTextId} position={inputPosition} value={inputValue} onChange={handleTextChange} onSave={handleTextSave} /> */}
    </>
  );
}

export default React.memo(InfiniteStage);
