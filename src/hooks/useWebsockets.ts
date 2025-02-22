import { useCallback, useEffect, useRef, useState } from 'react';

// const WS_URL = `ws://localhost:8000/ws/public`;

export interface User {
  activeUsers: string[];
  roomId: string;
  type: string;
  avatar?: string; // if you want to show user avatar
}

export function useWebSocket(WS_URL: string) {
  const [userId, setUserId] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activeUsers, setActiveUsers] = useState<User>({ activeUsers: [], roomId: '', type: '', avatar: '' });
  const [cursors, setCursors] = useState<{ [key: string]: { userId: string; x: number; y: number } }>({});
  const [remoteLines, setRemoteLines] = useState<LineType[]>([]);
  const isDrawing = useRef(false);
  const shapeRef = useRef<any>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ Connected to WebSocket');
    ws.onclose = () => console.log('❌ WebSocket Disconnected');

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data) {
        if (data.type === 'users') {
          if (userId === '') {
            setUserId(data.userId);
          }
          setActiveUsers(data); // Update active users list
        } else {
          const drawingData = data as SocketData;
          if (drawingData['mouseEvent'] == 'move') {
            setCursors(prev => ({ ...prev, [data.userId]: { ...data } }));
          }
          if (drawingData['mouseEvent'] == 'MouseDown') {
            if (drawingData['tool']) {
              onMouseDown(drawingData['tool'], drawingData);
            }
          } else if (drawingData['mouseEvent'] == 'MouseMove') {
            const drawingData = data as SocketData;
            onMouseMove(drawingData);
            setCursors(prev => ({ ...prev, [drawingData.userId]: { x: drawingData.pointer!.x, y: drawingData.pointer!.y, userId: drawingData.userId } }));
          } else {
            onMouseUp();
          }
        }
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
      ws.onmessage = null;
      ws.onopen = null;
      ws.onclose = null;
    }; // Clean up on unmount
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

  const sendMessage = useCallback(
    (data: SocketData) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    },
    [socket]
  );

  return { sendMessage, remoteLines, activeUsers, cursors, setCursors, userId };
}
