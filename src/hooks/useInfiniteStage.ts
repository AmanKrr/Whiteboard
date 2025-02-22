'use client';
import Konva from 'konva';
import { useCallback, useRef, useState } from 'react';

export default function useInfiniteStage(
  setStagePos: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >
) {
  const stageRef = useRef<any>(null); // We'll use this ref for direct access to the Stage if needed

  // Scale state: how far we've zoomed in/out
  const [scale, setScale] = useState(1);

  // You could also store stage position in React state if you want full control over panning
  // but with `draggable={true}`, Konva handles offset automatically.
  // If you do want to store it, you'd do something like:
  // const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Wheel event: zoom in/out
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      if (stageRef && stageRef.current) {
        // Konva automatically passes a wheel event in e.evt
        const oldScale = stageRef.current.scaleX();
        const pointer = stageRef.current.getPointerPosition();

        // How fast to zoom per scroll step
        const zoomSpeed = 1.02;
        // Scroll up => zoom in, scroll down => zoom out
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * zoomSpeed : oldScale / zoomSpeed;

        // Limit or clamp scale if you like
        const clampedScale = Math.max(0.05, Math.min(newScale, 10));

        // Calculate pointer position before and after zoom
        // so we can keep the pointer in the same relative position
        const mousePointTo = {
          x: (pointer.x - stageRef.current.x()) / oldScale,
          y: (pointer.y - stageRef.current.y()) / oldScale
        };

        stageRef.current.scale({ x: clampedScale, y: clampedScale });

        // new position
        const newPos = {
          x: pointer.x - mousePointTo.x * clampedScale,
          y: pointer.y - mousePointTo.y * clampedScale
        };
        stageRef.current.position(newPos);

        setScale(clampedScale);
        setStagePos(newPos);
      }
    },
    [setStagePos]
  );

  return { stageRef, scale, handleWheel };
}
