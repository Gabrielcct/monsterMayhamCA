// SET VARIABLES
// new websocket
const url = "ws://localhost:3000";
const wsServer = new WebSocket(url);


// get game board
const gameBoard = document.getElementById("gameBoard");

let currentPlayer = null; // set variable for current player. initially is null
let isGameStarted = false; // checks if game started
let isGameOver = false; // check if game finished

let gamesList = [];
let monsters = []

// EVENTS
// This will handle web socket messages (events)
wsServer.onmessage = (event) => {
    // pasrse JSON to get data
    const data = JSON.parse(event.data);
    // based on message type do different things
    switch(data.type){
        case 'player-joined':
            // when new player joins game alert and update player info
            alert('New Player Joined');
            updatePlayerList(data.games);
            break;
        case 'initGame':
                console.log('Game initialised');
                console.log(data);
                monsters = data.playerMonsters;
                currentPlayer = data.playerName;
                isGameStarted = true;
                updateMonstersDiv(monsters);
                break;
        case 'updateBoard':
                console.log('Board updated'); // log that game board is updated with new data.board
                createBoard(data.board); // update game board is updated with new data.board
                break;
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
 * Function to end turn
 */
/*function endTurn(){
    alert('endTurn');
    // set data to be json with endTurn type and current player set as player
    const data = JSON.stringify({ type: 'endTurn', player: currentPlayer });
    // send data to websocket
    wsServer.send(data);
}*/

/*function placeMonster(){
    alert('placeMonster');
    // ADD some logic for placing monsters on board
    const row = prompt("Enter the row (0-9) to place your monster:");
    const col = prompt("Enter the column (0-9) to place your monster:");
    const monster = prompt("Enter the monster type (vampire, werewolf, ghost):");
    wsServer.send(JSON.stringify({ type: 'placeMonster', row, col, monster, player: currentPlayer }));
}*/

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


/**
 * Function to update player list when new player joins
 * */
function updatePlayerList(games) {
    const playerListElement = document.getElementById('player-list');
    // Clear existing player list HTML
    playerListElement.innerHTML = '';

    // Iterate over the updated games object
    for (const gameName in games) {
        if (games.hasOwnProperty(gameName)) {
            const players = games[gameName].players;
            for (const playerName in players) {
                if (players.hasOwnProperty(playerName)) {
                    const player = players[playerName];
                    // Create a list item element for each player
                    const playerListItem = document.createElement('li');
                    playerListItem.textContent = `${player.name} status: ${player.status}`;
                    playerListItem.classList.add(player.status);
                    playerListElement.appendChild(playerListItem);
                }
            }
        }
    }
}

// MONSTER LOGIC
// monster types selection buttons
function updateMonstersDiv(monsters){
    const monsterPlacement = document.getElementById('monster-placement');
    const availableMonsters = monsters.filter(monster => monster.location == null).length;
    // clear content
    monsterPlacement.innerHTML = '';
    // if there are monsters that can be placed on board
    if(availableMonsters){
        const placeMonsterButton = createElement('button', 'btn btn-primary', 'Place Monster', placeMonster);
        // append place monster button
        monsterPlacement.appendChild(placeMonsterButton);
    }
    // append monster information
    const availableMonstersDiv = createElement('div', 'available-monsters', null, null);
    availableMonstersDiv.innerHTML = ''; // clear content
    const availableMonstersLabel = createElement('span', 'available-monsters-label', 'Available monsters to place: ');
    availableMonstersDiv.appendChild(availableMonstersLabel);
    availableMonstersDiv.appendChild(document.createTextNode(availableMonsters));
    const availableMonstersCount = document.createTextNode(monsters.filter(monster => monster.location == null).length);
}
 
function placeMonster(){
    const monsterPlacement = document.getElementById('monster-placement');
    // clear content
    monsterPlacement.innerHTML = '';
    // append cancel placing monster button
    const cancelPlaceMonsterButton = createElement('button', 'btn btn-secondary', 'Cancel Placing Monster', cancelPlacingMonster);
    monsterPlacement.appendChild(cancelPlaceMonsterButton);
    // append place monster type divs so we can select monster
    const monsterTypesDiv = document.getElementById('monster-types');
    const vampireButton = createElement('button', 'btn btn-vampire', 'Vampire', addVampire);
    monsterTypesDiv.appendChild(vampireButton);
    const warewolfButton = createElement('button', 'btn btn-warewolf', 'Warewolf', addWarewolf);
    monsterTypesDiv.appendChild(warewolfButton);
    const ghostButton = createElement('button', 'btn btn-ghost', 'Ghost', addGhost);
    monsterTypesDiv.appendChild(ghostButton);
    const data = JSON.stringify({ type: 'placing-monster' });
    wsServer.send(data); // send data to websocket
}

function cancelPlacingMonster(){
    const monsterPlacement = document.getElementById('monster-placement');
    // clear content
    monsterPlacement.innerHTML = '';
    // append back place monster button
    const placeMonsterButton = createElement('button', 'btn btn-primary', 'Place Monster', placeMonster);
    monsterPlacement.appendChild(placeMonsterButton);
    // clear monster types buttons
    const monsterTypesDiv = document.getElementById('monster-types');
    monsterTypesDiv.innerHTML = '';
}

function addVampire(){
    const data = JSON.stringify({ type: 'place-vampire', gameName, playerName});
    wsServer.send(data);
}

function addWarewolf(){
    const data = JSON.stringify({ type: 'place-warewolf', gameName, playerName});
    wsServer.send(data);
}

function addGhost(){
    const data = JSON.stringify({ type: 'place-ghost', gameName, playerName});
    wsServer.send(data);
}

function createElement(type, classNames, textContent, onClick){
    const el = document.createElement(type);
    el.className = classNames;
    el.textContent = textContent;
    // if is button set click function
    if(type=='button'){
        el.onclick = onClick;
    }
    return el;
 }

 
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