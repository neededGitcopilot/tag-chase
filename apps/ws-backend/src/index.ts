import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

type Role = "tagger" | "chaser";
type RoomState = "waiting" | "ready" | "countdown" | "playing" | "finished" | "error";

interface Player {
  id: string;
  username: string;
  x?: number;
  y?: number;
  ws?: WebSocket;
  role?: Role;
}
interface Room {
  id: string;
  player: Player[];
  state: RoomState;
  round: number;
  totalRound: number;
  countdownTimer?: NodeJS.Timeout;
}

const wss = new WebSocketServer({ port: 8080 });

//for user creating room
const rooms: Room[] = [];

// this function send msg all playere
const broadcastMsg = (room: Room, data: object) => {
  room.player.forEach((player) => player.ws?.send(JSON.stringify(data)));
};

const startCountdown = (room: Room) => {
  let countdown = 3;
  room.state = "countdown";
  setInterval(() => {
    if(countdown > 0 ) {
      broadcastMsg(room, {
        type: "countdown",
        countdown: `${countdown} seconds`,
      });
    }
    countdown--;
    if(countdown === 0) {
      room.state = "playing";
      broadcastMsg(room, {
        type: "game_started",
      });
    }
  },1000)
}

wss.on("connection", (ws) => {
  const playerId = uuidv4();
  ws.on("message", (message: Buffer) => {
    try {
      const msg = JSON.parse(message.toString()) as {
        type: string;
        roomId: string;
        payload: {
          username: string;
          x?: number;
          y?: number;
        };
      };
      // ----- on join player this message get -------
      // type: join
      // roomId
      // payload { username, x , y}

      if (msg.type === "join") {
        let room =
          msg.roomId && rooms.find((r) => r.id === msg.roomId);
console.log("room", room);
        if (!room) {
          room = { id: msg.roomId, player: [], state: "waiting", round: 1, totalRound: 10 };
          rooms.push(room);
        }

        // check room already has 2 player or not
        if (room && room?.player?.length >= 2) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Room is full ",
            })
          );
          return;
        }

        // prevent from similar username ( in future this is replace with unique userId )
        const alreadyExist = room?.player.find(
          (p) => p.username === msg.payload.username
        );
        if (alreadyExist) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "username already exist ",
            })
          );
        }
        //add user
        //room is here reference so there is technically pushing player in main rooms section
        room?.player.push({ 
          id: playerId,
          username: msg.payload.username,
          // we can't set role here because we don't know which player is tagger and which is chaser
          // role: Math.random() < 0.5 ? "tagger" : "chaser",
          ws: ws as WebSocket,
          x: msg.payload.x || 0,
          y: msg.payload.y || 0,
        });
        ws.send(
          JSON.stringify({
            type: "joined",
            roomId: msg.roomId,
            player: room.player.map((p) => p.username),
          })
        );
        if (room && room?.player?.length === 2 && room.state === "waiting") {
          room.state = "ready";

          // set random role for each player
          room.player.forEach((p) => {
            p.role = Math.random() < 0.5 ? "tagger" : "chaser";
          });
          broadcastMsg(room, {
            type: "game_ready",
            payload: {
              player: room.player.map((p) => p.username),
            }
          });
          startCountdown(room);
        }
      }

      // on move payload recive
      //   {
      //     type: "move",
      //     roomId: "green"
      //     payload: {
      //         x: 0,
      //         y:0,
      //     }
      //   }
      if (msg.type === "move" && rooms.find(room => room.id === msg.roomId)?.state === "playing") {
        const room = rooms.find(room => room.id === msg.roomId)
        if(!room) {
          return;
        }
        room.player.forEach((p) => {
          if(p.id === playerId) {
            p.x = msg.payload.x || 0;
            p.y = msg.payload.y || 0;
          }
        })
        broadcastMsg(room, {
          type: 'coordinate',
          payload: room.player.map((p) => ({
            id: p.id,
            username: p.username,
            x: p.x,
            y: p.y,
          }))
        })
        if(rooms.find(room => room.id === msg.roomId)?.player.every(p => p.x === rooms.find(room => room.id === msg.roomId)?.player[0]?.x && p.y === rooms.find(room => room.id === msg.roomId)?.player[0]?.y)) {
          rooms.find(room => room.id === msg.roomId)!.state = "finished";
          broadcastMsg(rooms.find(room => room.id === msg.roomId)!, {
            type: "game_finished",
          });
          return;
        }
      }
    } catch (error) {
      console.error("Invalid message:", error);
    }
    ws.on("close", () => {
      rooms.forEach((r) => {
        console.log(r);
        return (r.player = r.player.filter((p) => p.ws !== ws));
      });
      console.log(rooms);
    });
  })
});
