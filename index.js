const express = require("express");// use express package
// body parser middleware 
// Reference: https://www.npmjs.com/package/body-parser
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const WebSocket = require('ws');

// IMPORTS
const { gameState, initializePlayer } = require('./game/gameState');
const { broadcastToAllClients } = require('./game/utility');

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

// VARIABLES FOR GAME
let gamesPlayed = 0;
let playersStats = {}; // { playerName: { wins: 0, losses: 0 } }


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

// FUNCTIONS
function initializePlayerStats(player) {
    // check first if that player no exist before resetting
    if (!playersStats[player]) {
        playersStats[player] = {
            gamesWon: 0, // Initialize games won for the player
            gamesLost: 0, // Initialize games lost for the player
        };
    }
}


// SET UP ROUTES
app.get("/", (req, res) => {
    res.render("index.ejs", { board: gameState.board, gamesPlayed, playersStats} );
});

// WEBSOCKET CONNECTIONS
// make a connection
wsServer.on('connection', (ws) => {
    // On first connection
    // log that user connected
    console.log('A user connected');
    
    // SEND INITIAL DATA
    // set initial data as json, type of message is init, and send gameBoard, number of games played and player statistic
   // const initData = JSON.stringify({ type: 'init', board: gameState.board, gamesPlayed, playersStats });
    //ws.send(initData); // send init data

    // HANDLE MESSAGES
    ws.on('message', (message) => {
        // log message that was received
        console.log('Received:', message);
        // pars the message json and save as data
        const data = JSON.parse(message);
        // handle different types of messages
        switch(data.type){
            case 'startGame':
                    console.log('start game'); // log that we are at start game
                    // update game state with player
                    //gameState.players.push(data.player);   
                     // Assign player to a side of the grid
                    console.log(data.player)
                    //gameState.players[data.player] = PLAYER_SIDES[data.player];
                    // Initialize monsters count for the player
                    //gameState.monstersCount[data.player] = 0; 
                    // Initialize player 
                    initializePlayer(data.player);
                    // init player stats
                    initializePlayerStats(data.player);
                    // send start data as json
                    //const startData = JSON.stringify({ type: 'startGame', player: data.player, board: gameState.board });
                    //ws.send(startData);

                    // Broadcast the updated player list to all clients
                    const playerListData = JSON.stringify({ type: 'updatePlayerList', players: gameState.players });
                    broadcastToAllClients(playerListData);
                    break;
            case 'placeMonster': 
                    console.log('place monster'); // log that we are at placing monster
                    const player = data.player; // set player
                    const monsterType = data.monster; // set monsterType
                    // Validate player action to ensure they are placing the monster on their own edge
                    if (gameState.players[player] === PLAYER_SIDES[player]) {
                        // Update the board if the action is valid
                        gameState.board[data.row][data.col] = { type: monsterType, player: player };
                        gameState.monstersCount[player]++; // Increment the monsters count for the player
                        // Check if the player has placed all their monsters
                        if (gameState.monstersCount[player] >= 10) {
                            // Determine the next player
                            const nextPlayer = getPlayerWithFewestMonsters();
                            // Notify the next player that it's their turn
                            wsServer.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN && gameState.players[nextPlayer] === PLAYER_SIDES[nextPlayer]) {
                                    client.send(JSON.stringify({ type: 'nextTurn' }));
                                }
                            });
                        }else {
                            // If there are remaining monsters to place, notify the current player to continue their turn
                            wsServer.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN && gameState.players[data.player] === PLAYER_SIDES[data.player]) {
                                    client.send(JSON.stringify({ type: 'nextMonster' }));
                                }
                            });
                        }
                        // Broadcast the updated board to all clients
                        const updatedBoard = JSON.stringify({ type: 'updateBoard', board: gameState.board });
                        broadcastToAllClients(updatedBoard);
                    }
                    
                    
                    break;
            case 'endTurn': 
                    console.log('end turn');
                    // Determine the player with the fewest monsters and notify them to take their turn
                    const nextPlayer = getPlayerWithFewestMonsters();
                    wsServer.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN && gameState.players[nextPlayer] === PLAYER_SIDES[nextPlayer]) {
                            client.send(JSON.stringify({ type: 'nextTurn', player: nextPlayer }));
                        }
                    });
                    break;
            default: return;
        }
    });


    // HANDLE DISCONNECT
    // When connection closes
    ws.on('close', () => {
        // log that user disconnected
        console.log('A user disconnected');
    });

});

function getPlayerWithFewestMonsters() {
    let minCount = Infinity;
    let playersWithMinCount = [];

    // Find the player(s) with the fewest monsters
    for (const player in gameState.monstersCount) {
        if (gameState.monstersCount[player] < minCount) {
            minCount = gameState.monstersCount[player];
            playersWithMinCount = [player];
        } else if (gameState.monstersCount[player] === minCount) {
            playersWithMinCount.push(player);
        }
    }

    // If there's a tie, randomly select one of the players
    if (playersWithMinCount.length > 1) {
        const randomIndex = Math.floor(Math.random() * playersWithMinCount.length);
        return playersWithMinCount[randomIndex];
    } else {
        return playersWithMinCount[0];
    }
}





