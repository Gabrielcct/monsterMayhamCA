const express = require("express");// use express package
// body parser middleware 
// Reference: https://www.npmjs.com/package/body-parser
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const WebSocket = require('ws');

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
let playersStats = {};
let board = createBoard();


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
/**
 * Function to create board
 * Added to function as it sets data to null so it can be used as reset
 */
function createBoard(){
    const startingBoard = [];
    // generate 10x10 board
    for (let i = 0; i < 10; i++) {
        const row = []; // create row
        for (let j = 0; j < 10; j++) {
            row.push(null); // push null for every column
        }
        // add rows to startingBoard array
        startingBoard.push(row);
    }
    return startingBoard;
}


/**
 * Function to set initial player stats 
 */
function initializePlayer(player) {
    // check first if that player no exist before reseting
    if (!playersStats[player]) {
        playersStats[player] = {
            gamesWon: 0,
            gamesLost: 0
        };
    }
}

// SET UP ROUTES
app.get("/", (req, res) => {
    res.render("index.ejs", { board, gamesPlayed, playersStats} );
});

// WEBSOCKET CONNECTIONS
// make a connection
wsServer.on('connection', (ws) => {
    // On first connection
    // log that user connected
    console.log('A user connected');

    // SEND INITIAL DATA
    // set initial data as json, type of message is init, and send gameBoard, number of games played and player statistic
    const initData = JSON.stringify({ type: 'init', board, gamesPlayed, playersStats })
    ws.send(initData); // send init data

    // HANDLE MESSAGES
    ws.on('message', (message) => {
        // messages logic
    });


    // HANDLE DISCONNECT
    // When connection closes
    ws.on('close', () => {
        // log that user disconnected
        console.log('A user disconnected');
    });
});


