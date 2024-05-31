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

let currentPlayer = null; // set variable for current player. initially is null
let isGameStarted = false; // checks if game started
let isGameOver = false; // check if game finished
let playersStats = [];

let gamesList = [];
console.log(gamesList)
// EVENTS
// This will handle web socket messages (events)
wsServer.onmessage = (event) => {
    // pasrse JSON to get data
    const data = JSON.parse(event.data);
    console.log(data)
    console.log(event)
    // based on message type do different things
    switch(data.type){
        case 'initialData':
            gamesList = data.games;
            
            console.log(gamesList)
            break;
        case 'newGameStarted':
            // when new game is started redirect to page
            window.location.href = `/game/${data.gameName}`;
            break;
        case 'joinedGame':
            // when new game is started redirect to page
            window.location.href = `/game/${data.gameName}`;
            break;
        case 'error':
            alert(data.message);
            break; 
        default: break;
    }
}
    // INDEX FUNCTIONALITY

function startNewGame(){
    // prompt user for new game Name
    const gameName = prompt("Enter game name (must be unique):");
    // if game with that name already exists 
    if(gamesList.find(gameState=>gameState.name == gameName)){
        alert('Game with that name name exists, try again'); // alert
        return; // break function
       
    }
    const playerName = prompt("Enter player name (must be unique):");
    // if player name don't exist -- there won't be any players in nsew game so remove player check
    //if(!gamesList.find((gameState)=>{ return gameState.players.find((player)=> player.name == playerName) })){
        const data = JSON.stringify({ type: 'startNewGame', gameName, playerName });
        wsServer.send(data); // send data to websocket
    /*}
    else{
        alert('Player with that name exists, try again')
    }*/
}

function joinGame(gameStateName){
    console.log(gameStateName);
    let gameState = gamesList.find(game=>game.name==gameStateName);
    if(!gameState){
        alert("couldn't find game");
        return;
    }
   
    const playerName = prompt("Enter player name (must be unique):");
    // if player name don't exist
    if(!gameState.players.find((player)=> player.name == playerName)){
        const data = JSON.stringify({ type: 'joinExistingGame', gameState, playerName });
        wsServer.send(data); // send data to websocket
    }
    else{
        alert('Player with that name exists. Player name needs to be unique. Try again');
    }
}
