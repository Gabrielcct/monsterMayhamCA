// SET VARIABLES
// new websocket
const url = "ws://localhost:3000";
const wsServer = new WebSocket(url);

let gamesList = {};
// EVENTS
// This will handle web socket messages (events)
wsServer.onmessage = (event) => {
    // pasrse JSON to get data
    const data = JSON.parse(event.data);
    // based on message type do different things
    switch(data.type){
        case 'initial-data':
            gamesList = data.games;
            break;
        case 'joined-game':
            console.log('inside')
            // when player joins game redirect to game page
            window.location.href = `/game/${data.gameName}/${data.playerName}`;
            break;
        default: break;
    }
}

// Start new game
function startNewGame(){
     // check if we have games object
    if(!gamesList){
        return alert("Can't start game");
    }
    // prompt user for new game Name
    const gameName = prompt("Enter game name (must be unique):");
    // if game with that name already exists 
    if(gamesList[gameName]){
        return alert('Game with that name already exists, try again'); 
    }
    // prompt player to enter name
    const playerName = prompt("Enter player name:"); 
    const data = JSON.stringify({ type: 'start-new-game', gameName, playerName });
    wsServer.send(data); // send data to websocket
}

function joinGame(gameName){
    // check if we have games object
    if(!gamesList){
        return alert("Can't join game");
    }
     // if game with that name don't exists 
    if(!gamesList[gameName]){
        return alert("Game with that name don't exists, try again"); 
    }
    // prompt player to enter name
    const playerName = prompt("Enter player name (must be unique):");
    // if player name exist
    if(gamesList[gameName].players && gamesList[gameName].players[playerName]){
        return alert("Player with that name already is in game. Player Name must be unique for game. Try again"); 
    }
    const data = JSON.stringify({ type: 'join-game', gameName, playerName });
    wsServer.send(data); // send data to websocket
}


// HELPERS to TRACK WEB SOCKET SERVER STATUS
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