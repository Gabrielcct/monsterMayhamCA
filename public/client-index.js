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
            updateGamesList(gamesList);
            break;
        case 'joined-game':
            console.log('inside')
            // when player joins game redirect to game page
            window.location.href = `/game/${data.gameName}/${data.playerName}`;
            break;
        case 'index-player-joined':
            // when player joins the game update game list
            updateGamesList(data.games, data.playersHistory);
            break;
        case 'index-current-game-started':
            // when any of the games started update game list
            updateGamesList(data.games, data.playersHistory);
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
    if(!gameName){
        alert("Game name can't be empty. Try again"); 
        return;
    }
    // prompt player to enter name
   /* const playerName = prompt("Enter player name:"); 
    if(!playerName){
        alert("Player name can't be empty. Try again"); 
        return;
    }*/
    const data = JSON.stringify({ type: 'start-new-game', gameName, playerName });
    wsServer.send(data); // send data to websocket
}

function joinGame(gameName, games){
    // prompt player to enter name
   // const playerName = prompt("Enter player name (must be unique):");
    // if player name exist
    if(games[gameName].players && games[gameName].players[playerName]){
         alert("Player with that name already is in game. Player Name must be unique for game. Try again"); 
         return
    }
    /*if(!playerName){
        alert("Player name can't be empty. Try again"); 
        return;
    }*/
    const data = JSON.stringify({ type: 'join-game', gameName, playerName });
    wsServer.send(data); // send data to websocket
}

function updateGamesList(games) {
    const playedGamesContainer = document.getElementById('played-games');
    playedGamesContainer.innerHTML = ''; // Clear the current list

    if (games && Object.keys(games).length > 0) {
        for (let gameName in games) {
            let game = games[gameName];
            const li = document.createElement('li');
            li.className = 'pl-list'
            const playersList = Object.keys(game.players).join(', ');

            li.innerHTML = `
                <div class="games-display">
                    <div class="games-display-row top">
                        <strong>Game Name:</strong> ${gameName}  <span class="players"> Players: ${game.currentPlayers} / ${game.maxPlayers}</span>
                        <div class="status">Is game in progress: ${game.isGameStarted}</div>
                    </div>
                    <div class="games-display-row bottom">
                        <div class=list-players>Players:
                            <ul class="inside-list">
                                ${playersList}
                            </ul>
                        </div>
                    </div>
                </div>`;

            if (game.currentPlayers < 4 && !game.isGameStarted) {
                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join Game';
                joinButton.classList.add('btn', 'btn-primary');
                joinButton.onclick = () => joinGame(gameName, games);
                li.appendChild(joinButton);
            } else {
                const fullGameSpan = document.createElement('span');
                fullGameSpan.textContent = 'Game is full or in progress';
                fullGameSpan.classList.add('full-game');
                li.appendChild(fullGameSpan);
            }
            

            playedGamesContainer.appendChild(li);
        }
    } else {
        playedGamesContainer.innerHTML = '<h2> No games currently in progress</h2>';
    }
    if(playersHistory && playersHistory[playerName] && playerName){
        updatePlayerHistoryView(playerName,playersHistory)
    }
}

/**
 * Update values in player history 
 */
function updatePlayerHistoryView(playerName,playersHistory){
    if(Object.keys(playersHistory).length > 0 && playerName){
        const playerHistoryDiv = document.getElementById('player-history');
        playerHistoryDiv.innerHTML = '';
        playerHistoryDiv.innerHTML = `
            <h2 class="welcome">Welcome ${playerName}</h2>
            <div class="player-history">
                <div class=" wins">Games played: <span> ${playersHistory[playerName].gamesPlayed}</span></div>
                <div class=" wins">Wins: <span> ${playersHistory[playerName].wins}</span></div>
                <div class=" wins">loses: <span> ${playersHistory[playerName].loses}</span></div>
            </div>
        `;
    }
    
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
