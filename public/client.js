// SET VARIABLES
// new websocket
const url = "ws://localhost:3000";
const wsServer = new WebSocket(url);
wsServer.onopen = () => {
    console.log('Connected to WebSocket server');
};

wsServer.onerror = (error) => {
    console.log('WebSocket error:', error);
    console.log('WebSocket error:', error.message);
};

wsServer.onclose = () => {
    console.log('WebSocket connection closed');
};

// get game board
const gameBoard = document.getElementById("gameBoard");

let currentPlayer = null; // set variable for current player. initially is null
let isGameStarted = false; // checks if game started
let isGameOver = false; // check if game finished

// EVENTS
// This will handle web socket messages (events)
wsServer.onmessage = (event) => {
    // pasrse JSON to get data
    const data = JSON.parse(event.data);
    // if type sent is next turn 
    if (data.type === 'nextTurn') {
        // and if player is current player
        if (data.player === currentPlayer) {
            // display alert to current player that it is his turn
            alert("It's your turn!");
        }
    }
};

// BUTTON ACTIONS
/**
 * Function to start/reset game
 */
function startGame(){
    alert('start');
    // enter name on start of game
    const player = prompt("Enter your player name:");
    isGameStarted = true; // set game started to true
    // set data to be json with startGame type and set player 
    const data = JSON.stringify({ type: 'startGame', player })
    // send data to websocket
    wsServer.send(data);
}
/**
 * Function to end turn
 */
function endTurn(){
    alert('endTurn');
    // set data to be json with endTurn type and current player set as player
    const data = JSON.stringify({ type: 'endTurn', player: currentPlayer });
    // send data to websocket
    wsServer.send(data);
}

function placeMonster(){
    alert('placeMonster');
    // ADD some logic for placing monsters on board
}