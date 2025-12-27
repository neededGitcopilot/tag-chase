import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });
const rooms: Record<number, Set<WebSocket>> = {};
const players: [{
  username: string,
  x: number,
  y: number
  start_timer: number
}] = [];

function broadcastToRoom(
  roomId: number,
  data: {
    message: string;
    type: string;
  },
  exceptSocket: WebSocket | null = null
) {
  const room = rooms[roomId];
  if (!room) return;

  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exceptSocket) {
      client.send(JSON.stringify(data));
    }
  });
}
wss.on("connection", (ws) => {
  const userId = uuidv4();
  let roomId = null;
  let username = null;
  ws.on("message", (message: Buffer) => {
    try {
      const msg = JSON.parse(message.toString()) as {
        username: string;
        room: number;
        type: string;
      };

      if ((msg.type === "join")) {
        roomId = msg.room;
        username = msg.username;
        if (!rooms[roomId]) rooms[roomId] = new Set();
        rooms[roomId]?.add(ws)
        broadcastToRoom(roomId, {
          type: 'notification',
          message: `${username} joined the room.`,
        }, ws);
      }
      if ((msg.type === "join")) {
        roomId = msg.room;
        username = msg.username;
        
        if (!rooms[roomId]) rooms[roomId] = new Set();
        rooms[roomId]?.add(ws)
        broadcastToRoom(roomId, {
          type: 'notification',
          message: `${username} joined the room.`,
        }, ws);
      }
      if ((msg.type === "move")) {
        roomId = msg.room;
        username = msg.username;
        if (!rooms[roomId]) rooms[roomId] = new Set();
        rooms[roomId]?.add(ws)
        broadcastToRoom(roomId, {
          type: 'notification',
          message: `${username} joined the room.`,
        }, ws);
      }
    } catch (error) {}
  });
});
