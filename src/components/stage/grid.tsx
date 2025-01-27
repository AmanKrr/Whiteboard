'use client'
import React from 'react'
import { Rect } from 'react-konva'

interface InfiniteGridProps {
  width: number
  height: number
  stagePos: { x: number; y: number }
  scale: number
  cellSize?: number
  strokeColor?: string
  strokeWidth?: number
}

/**
 * Renders an 'infinite' grid using a repeated pattern.
 */
export default function InfiniteGrid({ width, height, stagePos, scale, cellSize = 50, strokeColor = '#ccc', strokeWidth = 1 }: InfiniteGridProps) {
  // 1. Create an off-screen canvas for your grid tile
  const patternCanvas = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = cellSize
    canvas.height = cellSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth

    // Horizontal line at the top
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(cellSize, 0)
    ctx.stroke()

    // Vertical line on the left
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, cellSize)
    ctx.stroke()

    return canvas
  }, [cellSize, strokeColor, strokeWidth])

  // 2. Convert the canvas to an <img> to match Konva’s `fillPatternImage` type
  //    (or cast it as `HTMLImageElement` if you prefer).
  const patternImage = React.useMemo(() => {
    const img = new Image()
    img.src = patternCanvas.toDataURL()
    return img
  }, [patternCanvas])

  // 3. Offset so grid lines stay “snapped” in world space as you pan
  const patternOffset = {
    x: -stagePos.x / scale,
    y: -stagePos.y / scale
  }

  // 4. Scale the pattern inversely so lines don’t get bigger/smaller when you zoom.
  const patternScale = {
    x: 1 / scale,
    y: 1 / scale
  }

  return (
    <Rect
      x={0}
      y={0}
      width={width} // cover the viewport
      height={height}
      fillPatternImage={patternImage}
      fillPatternOffset={patternOffset}
      fillPatternScale={patternScale}
      listening={false} // no pointer events needed
    />
  )
}
