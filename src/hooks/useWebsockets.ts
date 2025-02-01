import { useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:8000/ws'; // Update for production

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [remoteLines, setRemoteLines] = useState<LineType[]>([]);
  const isDrawing = useRef(false);
  const shapeRef = useRef<any>(null);

  console.log('re-rendering issue');

  useEffect(() => {
    console.log('remote line:', remoteLines);
  }, [remoteLines]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ Connected to WebSocket');
    ws.onclose = () => console.log('❌ WebSocket Disconnected');

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data) {
        const drawingData = data as SocketData;
        if (drawingData['mouseEvent'] == 'MouseDown') {
          if (drawingData['tool']) {
            onMouseDown(drawingData['tool'], drawingData);
          }
        } else if (drawingData['mouseEvent'] == 'MouseMove') {
          if (data) {
            const drawingData = data as SocketData;
            onMouseMove(drawingData);
          }
        } else {
          onMouseUp();
        }
      }
    };

    setSocket(ws);

    return () => ws.close(); // Clean up on unmount
  }, []);

  function onMouseDown(tool: ToolType, data: SocketData) {
    isDrawing.current = true;

    switch (tool) {
      case 'pencil':
        shapeRef.current = data;
        shapeRef.current.id = shapeRef.current.id + 'socket';
        setRemoteLines(prev => [...prev, shapeRef.current]);
        break;
      default:
        break;
    }
  }

  function onMouseUp() {
    isDrawing.current = false;
    shapeRef.current = null;
  }

  function onMouseMove(data: SocketData) {
    if (!isDrawing.current || !shapeRef.current) return; // Ensure shapeRef.current is valid

    switch (shapeRef.current.tool) {
      case 'pencil':
        setRemoteLines(prev => {
          if (prev.length === 0) return prev; // Ensure there's something to update
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], points: [...updated[lastIndex].points, data.x, data.y] };
          return updated;
        });
        break;
      default:
        break;
    }
  }

  const sendMessage = (data: SocketData) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  };

  return { sendMessage, remoteLines };
}
