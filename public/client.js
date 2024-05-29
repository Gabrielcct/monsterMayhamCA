// SET VARIABLES
// new websocket
const url = "ws://localhost:3000";
const wsServer = new WebSocket(url);

// TRACK WEB SOCKET SERVER 
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
    // based on message type do different things
    switch(data.type){
        case 'updateBoard':
        case 'startGame':
                // if type is either upddateBoard or start game 
                // send new board to createBoard method and update it
                createBoard(data.board);
                // if is start game set current player
                if(data.type === 'startGame') {
                    currentPlayer = data.player;
                }
                break;   
        case 'nextTurn':
            // if type sent is next turn and if player is current player
            if (data.player === currentPlayer) {
                // display alert to current player that it is his turn
                alert("It's your turn!");
            }
            break;
        default: return;
    }
};

// BUTTON ACTIONS
/**
 * Function to start/reset game.
 * Will set player with player name on start
 */
function startGame(){
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
    const row = prompt("Enter the row (0-9) to place your monster:");
    const col = prompt("Enter the column (0-9) to place your monster:");
    const monster = prompt("Enter the monster type (vampire, werewolf, ghost):");
    wsServer.send(JSON.stringify({ type: 'placeMonster', row, col, monster, player: currentPlayer }));
}

// ADD CLICK EVENT LISENER TO GAME BOARD
gameBoard.addEventListener('click', (event) => {
    // if cell is clicked
    if (event.target.classList.contains('cell')) {
        const row = event.target.dataset.row; // get row clicked
        const col = event.target.dataset.col; // get column clicked
        // prompt user to enter monster type
        const monster = prompt("Enter the monster type (vampire, werewolf, ghost):");
        // set action as placeMonster and send all values
        const data = JSON.stringify({ type: 'placeMonster', row, col, monster, player: currentPlayer });
        wsServer.send(data); // send data to websocket
    }
});

/**
 * Create a new board based on board on server
 * Used to update board on front end when there are changes
 * @param {*} board 
 */
function createBoard(board) {
    // remove innerHtml of board to remove current board
    gameBoard.innerHTML = '';
    // set new values in for loop
    board.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.row = rowIndex;
            cellDiv.dataset.col = colIndex;
            cellDiv.innerText = cell ? cell.type : '';
            rowDiv.appendChild(cellDiv);
        });
        gameBoard.appendChild(rowDiv);
    });
}