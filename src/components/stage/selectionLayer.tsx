'use client';
import React, { useEffect, useRef } from 'react';
import { Layer, Transformer } from 'react-konva';

interface SelectionLayerProps {
  shapes: { rectangle: RectangleType[]; circle: CircleType[]; arrow: ArrowType[]; text: TextType[] }; // List of all shapes (lines, rectangles, etc.)
  selectedId: {
    id: string | null;
    type: ToolType | '';
  };
  selectedTool: ToolType;
  setStrokeWidth: React.Dispatch<React.SetStateAction<number>>;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

const SelectionLayer: React.FC<SelectionLayerProps> = ({ shapes, selectedId, selectedTool, setColor, setStrokeWidth }) => {
  const transformerRef = useRef<any>(null);
  const currentSelectedNode = useRef<any>(null);

  useEffect(() => {
    if (!transformerRef.current) return;
    if (!selectedId['id'] || selectedId['type'] == '') {
      transformerRef.current.nodes([]);
      return;
    }

    // Find the selected shape in the provided list
    // const selectedShape = shapes.find(shape => shape.id === selectedId);
    let selectedShape = null;
    switch (selectedId['type']) {
      case 'rectangle':
        selectedShape = shapes['rectangle'].find(shape => shape.id === selectedId['id']);
        break;
      case 'circle':
        selectedShape = shapes['circle'].find(shape => shape.id === selectedId['id']);
        break;
      case 'arrow':
        selectedShape = shapes['arrow'].find(shape => shape.id === selectedId['id']);
        break;
      case 'text':
        selectedShape = shapes['text'].find(shape => shape.id === selectedId['id']);
        break;
    }
    if (!selectedShape) return; // Exit if the shape doesn't exist

    // set current shape storke and color in tool settings
    if (selectedShape['strokeWidth'] != undefined && selectedShape['color'] != undefined) {
      setStrokeWidth(selectedShape['strokeWidth']);
      setColor(selectedShape['color']);
    }

    // Find the selected node in Konva's stage
    const stage = transformerRef.current.getStage();
    const selectedNode = stage.findOne(`#${selectedId['id']}`);
    if (selectedId['type'] === 'text') {
      currentSelectedNode.current = selectedNode;
    }

    if (selectedNode) {
      // ✅ Custom Transformer Styles
      transformerRef.current.setAttrs({
        rotateEnabled: false, // Disable rotation handles
        borderStroke: '#ff5733', // Custom border color (orange)
        borderStrokeWidth: 2, // Border width
        borderDash: [4, 4], // Dashed border
        anchorStroke: '#007bff', // Blue anchor points
        anchorFill: '#ffffff', // White inner color
        anchorSize: 12, // Bigger anchors
        anchorCornerRadius: 6 // Make anchors rounded (circle-like)
      });
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId['id'], selectedId['type'], shapes['arrow'], shapes['circle'], shapes['rectangle'], shapes['text']]); // ✅ Now listens to shape changes too

  if (selectedTool != 'select') return;

  return (
    <Layer>{selectedId['type'] == 'text' ? <Transformer ref={transformerRef} enabledAnchors={['middle-left', 'middle-right']} /> : <Transformer ref={transformerRef} />}</Layer>
  );
};

export default SelectionLayer;
