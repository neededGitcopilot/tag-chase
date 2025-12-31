import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

interface Player {
  username: string;
  x?: number;
  y?: number;
  ws?: WebSocket;
}
interface RoomType {
  player: Player[];
  roomId: string;
}

const wss = new WebSocketServer({ port: 8080 });

//for user creating room
const rooms: RoomType[] = [];

// this function send msg all playere
const broadcastMsg = (room: RoomType, data: object) => {
  room.player.forEach((player) => player.ws?.send(JSON.stringify(data)));
};

wss.on("connection", (ws) => {
  const userId = uuidv4();
  const round = 1;
  const role = ["tagger", "chaser"];
  const totalRound = 10;
  const countdown = 3;
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
        let currentRoom =
          msg.roomId && rooms.find((r) => r.roomId === msg.roomId);

        if (!currentRoom) {
          currentRoom = { roomId: msg.roomId, player: [] };
          rooms.push(currentRoom);
        }

        // check room already has 2 player or not
        if (currentRoom && currentRoom?.player?.length >= 2) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Room is full ",
            })
          );
          return;
        }

        // prevent from similar username ( in future this is replace with unique userId )
        const alreadyExist = currentRoom?.player.find(
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
        currentRoom?.player.push({
          username: msg.payload.username,
          ws,
        });
        ws.send(
          JSON.stringify({
            type: "joined",
            roomId: msg.roomId,
            player: currentRoom.player.map((p) => p.username),
          })
        );
        if (currentRoom && currentRoom?.player?.length === 2) {
          broadcastMsg(currentRoom, {
            type: "game_ready",
            start_in: `${countdown} seconds`,
            payload: {
              playerId: userId,
              role: role[Math.random() * role.length] as string,
              opponent: {
                // in future there is more than 2 player so providing in array of username
                username: currentRoom?.player.filter(
                  (p) => p.username !== msg.payload.username
                ),
              },
              round: round,
              totalRound: totalRound,
            },
          });
        }
      }
      // on move payload recive
      //   {
      //     type: "move"
      //     payload: {
      //         x: 0,
      //         y:0,
      //     }
      //   }
      if (msg.type === "move") {
        ws.send;
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
