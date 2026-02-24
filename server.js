// Simple WebSocket multiplayer server
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

let players = {};

server.on("connection", (socket) => {
  const id = Math.random().toString(36).substr(2, 9);
  players[id] = { x: 1000, y: 1000 };

  socket.send(JSON.stringify({ type: "init", id, players }));

  socket.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "move") {
      players[id] = { x: data.x, y: data.y };

      // Broadcast to all players
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "update", id, x: data.x, y: data.y }));
        }
      });
    }
  });

  socket.on("close", () => {
    delete players[id];
    server.clients.forEach((client) => {
      client.send(JSON.stringify({ type: "remove", id }));
    });
  });
});

console.log("Multiplayer server running on ws://localhost:8080");
