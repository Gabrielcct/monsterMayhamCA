// new websocket
const url = "ws://localhost:3000";
const wsServer = new WebSocket(url);

// get game board
const gameBoard = document.getElementById("gameBoard");