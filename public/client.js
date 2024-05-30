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
let playersStats = [];
// EVENTS
// This will handle web socket messages (events)
wsServer.onmessage = (event) => {
    // pasrse JSON to get data
    const data = JSON.parse(event.data);
    // based on message type do different things
    switch(data.type){
        case 'updateBoard':
                console.log('Board updated'); // log that game board is updated with new data.board
                createBoard(data.board); // update game board is updated with new data.board
                break;
       /* case 'startGame':
                console.log('Game started');  // log that game started
                currentPlayer = data.player || clientPlayer; // if is start game set current player
                createBoard(data.board); // update board
                isGameStarted = true;
                // Display a message indicating whose turn it is
                displayMessage(`It's ${currentPlayer}'s turn`);
                break;*/
        case 'nextTurn':
                console.log(`It's ${data.player}'s turn`);
                // Display a message indicating whose turn it is
                displayMessage(`It's ${data.player}'s turn`);
                break;
        case 'nextMonster':
                console.log(`Place your next monster`);
                // Display a message prompting the player to place their next monster
                displayMessage(`Place your next monster`);
                break;
        case 'updatePlayerList':
                playersStats = data.players;
                updatePlayerList(playersStats);
                
                break;
        default: break;
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
    console.log(player)
    // set data to be json with startGame type and set player 
    const data = JSON.stringify({ type: 'startGame', player });
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

/**
 * Function to display message which player is playing
 * @param {*} message -- message to be displayed
 */
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    // Assuming you have a message container with id "message-container"
    document.getElementById('message-container').appendChild(messageElement);
}


// Function to update player list
function updatePlayerList(players) {
    const playerListElement = document.getElementById('player-list').getElementsByTagName('ul')[0];
    // Clear existing player list HTML
    playerListElement.innerHTML = '';
    // Create new HTML elements for each player
    // Reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    players.forEach(player => {
        debugger
        const playerItem = document.createElement('li');
        playerItem.textContent = player.name;
        playerItem.classList.add(player.status);
        playerListElement.appendChild(playerItem);
    });
}
