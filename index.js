const express = require("express");// use express package
const session = require('express-session'); // for sessions
// body parser middleware 
// Reference: https://www.npmjs.com/package/body-parser
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const WebSocket = require('ws');

// Map to store WebSocket connections for each game
const gameConnections = {};
// IMPORTS
const { startNewGame, joinExistingGame, startCurrentGame, games } = require('./game/gamesManager'); // Update the path if necessary
const { MONSTER_STATUS, MONSTER_TYPE} = require('./game/monsters');
const {
    updateBoardAvailableMovement, 
    addMonsterToBoard,
    updateBoardMonsterClicked,
    updateBoardMonsterMoved
} = require('./game/board');

//const PORT = (3000); //use port 3000
// either use port 3000 or process.argv[2] from command line specify
const PORT = (process.argv[2] || 3000);

// assign app to express - create app
app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// rendering with ejs 
// Reference https://ejs.co/
app.set("view engine", "ejs");

// put in public folder by joining current tirectory with public
app.use(express.static(path.join(__dirname, 'public')));
// set session details
app.use(session({
    secret: 'secret', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// VARIABLES FOR GAME
//let gamesPlayed = 0;
//let playersStats = {}; // { playerName: { wins: 0, losses: 0 } }


// Listen on port and assign server to httpServer
const httpServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// WEBSOCKET
// Create WebSocket server without a http server so we can upgrade existing server to handle it
const wsServer = new WebSocket.Server( { noServer: true } );
// upgrading the server to handle websockets
httpServer.on('upgrade', async (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
    });
});

// SET UP ROUTES
app.get("/", (req, res) => {
    res.render("index.ejs", { games } );
});

app.get("/game/:name/:playerName", (req, res) => {
    req.session.gameName = req.params.name; // save game name to session
    req.session.playerName = req.params.playerName; // save player name to session
    const playerName = req.session.playerName;
    const gameName = req.session.gameName;
    res.render("game.ejs", { games, gameName, playerName, playerMonsters: games[gameName].players[playerName].monsters} );
});

// Route to get game data (including game name)
app.get('/game-data', (req, res) => {
    // Retrieve the game name from the session
    const gameName = req.session.gameName;
    const playerName = req.session.playerName;
   // Send the game name in the response
    res.json({ gameName, playerName, games });
});

let updatedGames; // will hold updated hames object
let playerData; // data we are sending to pplayer
let playersData; // data we are sending to all players in same game
let everyoneData; // data we are sending to everyone

// WEBSOCKET - make a connection
wsServer.on('connection', (ws, req) => {
    const gameName = req.url.split('/').pop(); // Extract game name from the URL
    //console.log(ws)
    console.log(`A user connected to game ${gameName}`);
  
    // SEND INITIAL DATA to index
    const initialData = JSON.stringify({ type: 'initial-data', games });
    ws.send(initialData);
    
    // HANDLE WEB SOCKET MESSAGES
    ws.on('message', (message) => {
        const data = JSON.parse(message); // parse the message json and save as data
        
        // handle different types of messages by switching on type
        switch(data.type){
            case 'start-new-game':
                    updatedGames = startNewGame(data.gameName, data.playerName);
                    playerData = JSON.stringify({ type: 'joined-game', gameName: data.gameName, playerName: data.playerName, games: updatedGames });
                    ws.send(playerData);
                    playersData = JSON.stringify({ type: 'player-joined', gameName: data.gameName, playerName: data.playerName, games: updatedGames });
                    sendToGamePlayers(data.gameName, playersData);
                    everyoneData = JSON.stringify({ type: 'index-player-joined', gameName: data.gameName, playerName: data.playerName, games: updatedGames });
                    broadcastToAllClients(everyoneData, wsServer);
                    break;
            case 'join-game':
                    updatedGames = joinExistingGame(data.gameName, data.playerName);
                    // send that new game started and game name
                    playerData = JSON.stringify({ type: 'joined-game', gameName: data.gameName, playerName: data.playerName, games:updatedGames });
                    ws.send(playerData);
                    playersData = JSON.stringify({ type: 'player-joined', gameName: data.gameName, playerName: data.playerName, games:updatedGames });
                    sendToGamePlayers(data.gameName, playersData);
                    everyoneData = JSON.stringify({ type: 'index-player-joined', gameName: data.gameName, playerName: data.playerName, games: updatedGames });
                    broadcastToAllClients(everyoneData, wsServer);
                    break;
           case 'start-game':
                    updatedGames = startCurrentGame(games, data.gameName, data.playerName);
                    playerData = JSON.stringify({ type: 'current-game-started', gameName: data.gameName, playerName: data.playerName, games:updatedGames });
                    sendToGamePlayers(data.gameName, playerData);
                    everyoneData = JSON.stringify({ type: 'index-current-game-started', gameName: data.gameName, playerName: data.playerName, games: updatedGames });
                    broadcastToAllClients(everyoneData, wsServer);
                    break;
            case 'placing-monster':
                    // update board with available placement positions based on player whos turn it is
                    const updatedGamesWithNewBoard = updateBoardAvailableMovement(games, data.gameName, data.playerName);
                    // add turn logic
                    // return updated board
                    const palcingMonsterData = JSON.stringify({ type: 'updated-board', gameName: data.gameName, playerName: data.playerName, games:updatedGamesWithNewBoard, isAddingMonster:true, isMovingMonster:false});
                    ws.send(palcingMonsterData);
                    break;
            case 'add-monster':
                    const returnedGames = addMonsterToBoard(games, data.gameName, data.playerName, data.row, data.col, data.monster);
                    const addingMonsterData = JSON.stringify({ type: 'updated-board', gameName: data.gameName, playerName: data.playerName, games:returnedGames, isAddingMonster:false, isMovingMonster:false });
                    //ws.send(addingMonsterData);
                    // send to all game players
                    sendToGamePlayers(data.gameName, addingMonsterData);
                    break;
            case 'monster-clicked':
                    const monsterClickedGames = updateBoardMonsterClicked(games, data.gameName, data.playerName, data.row, data.col, data.monster);
                    const monsterClickedData = JSON.stringify({ type: 'updated-board', gameName: data.gameName, playerName: data.playerName, games:monsterClickedGames, isAddingMonster:false, isMovingMonster:true });
                    ws.send(monsterClickedData);
                    break;
            case 'monster-moved':
                    const monsterMovedGames = updateBoardMonsterMoved(games, data.gameName, data.playerName, data.row, data.col);
                    const monsterMovedData = JSON.stringify({ type: 'updated-board', gameName: data.gameName, playerName: data.playerName, games:monsterMovedGames, isAddingMonster:false, isMovingMonster:false });
                    //ws.send(monsterMovedData);
                    // send to all game players
                    sendToGamePlayers(data.gameName, monsterMovedData);
                    break;
            default: return;
        }
    });

    // HANDLE DISCONNECT - When connection closes
    ws.on('close', () => {
        console.log('A user disconnected');
    });

    // Associate the WebSocket connection with the game
    if(gameName){
        if (!gameConnections[gameName]) {
            gameConnections[gameName] = [];
        }
        gameConnections[gameName].push(ws);
    }
    

});


// Function to broadcast data to players within the same game
function sendToGamePlayers(gameName, data) {
    const connections = gameConnections[gameName] || [];
    connections.forEach(client => {
        console.log(client)
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Function to broadcast data to all clients
function broadcastToAllClients(data, server) {
    server.clients.forEach(client => {
        // if they have open connection
        if (client.readyState === WebSocket.OPEN) {
            // send updated player list
            client.send(data);
        }
    });
}




