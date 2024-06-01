fetch('/game-data')
    .then(response => response.json())
    .then(data => {
        const gameName = data.gameName;
        const player = data.playerName;
        const games = data.games;
          // new websocket
        const url = `ws://localhost:3000/game/${gameName}`;
        console.log(url)
        const wsServer = new WebSocket(url);

        // SET VARIABLES
    
        // get game board
        const gameBoard = document.getElementById("gameBoard");
        let currentPlayer = player; // set variable for current player. initially is null
        let currentGameName = gameName;
        let curentGames = games;
        let isGameStarted = false; // checks if game started
        let isGameOver = false; // check if game finished
        let monsters = [];
        let isMovingMonster = false;
        let isAddingMonster = false;
        let movingmonster = null;

        // EVENTS
        // This will handle web socket messages (events)
        wsServer.onmessage = (event) => {
            
            // pasrse JSON to get data
            const data = JSON.parse(event.data);
            console.log(data)
            // based on message type do different things
            switch(data.type){
                case 'player-joined':
                    // when new player joins game, update the player list
                    const playerListHTML = updatePlayerList(data.games, data.gameName);
                    console.log('player-joined')
                    document.getElementById('player-list').innerHTML = `<ul>${playerListHTML}</ul>`;
                    break;
                case 'current-game-started':
                        console.log('Game initialised');
                        console.log(data);
                        updateLocalVariables(data.games, data.playerName,data.gameName);
                        isGameStarted = true;
                        displayGameArea();
                        if (data.games[data.gameName] && data.games[data.gameName].players[data.playerName]) {
                            const monsters = data.games[data.gameName].players[data.playerName].monsters;
                            if (monsters) { 
                                updateMonstersDiv(monsters);
                            }
                        }
                        break;
                case 'updated-board':
                        console.log('Board updated'); // log that game board is updated with new data.board
                        console.log(data.games[data.gameName].board);
                        isAddingMonster = data.isAddingMonster;
                        isMovingMonster = data.isMovingMonster;
                        updateLocalVariables(data.games, data.playerName,data.gameName);
                        createBoard(data.games[data.gameName].board); // update game board is updated with new data.board
                        break;
                
                        
                /*        
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
                */
                default: break;
            }
        };

        // START GAME
        window.startGame = function (gameName, playerName){
            const data = JSON.stringify({ type: 'start-game', gameName, playerName });
            wsServer.send(data);
        }
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
                // Check the value of the cell
                const cellValue = event.target.innerText;
                console.log(cellValue)
                if (cellValue === 'click') {
                    if(isAddingMonster){
                        // prompt user to enter monster type
                        const monster = prompt("Enter 'v' for vampire, 'w' for werewolf, 'g' for ghost, or 'c' to cancel:");
                        if (monster === 'c' || !['v', 'w', 'g'].includes(monster)) {
                            alert('Placement canceled');
                        } else {
                            // if we are adding a monster and clicked on empty cell
                            // set action as placeMonster and send all values
                            const data = JSON.stringify({ type: 'add-monster', gameName: currentGameName, playerName: currentPlayer, row, col, monster });
                            wsServer.send(data); // send data to websocket
                        }
                    }
                    // if we are moving existing onster and clicked on empty cell
                    if(isMovingMonster){
                        // set action as moving and send all values
                        const data = JSON.stringify({ type: 'monster-moved', gameName: currentGameName, playerName: currentPlayer, row, col });
                        wsServer.send(data); // send data to websocket
                    }
                } else if (['v', 'w', 'c'].includes(cellValue)) {
                    isMovingMonster = true;
                    // Send the current monster type to the server
                    const data = JSON.stringify({ type: 'monster-clicked', gameName: currentGameName, playerName: currentPlayer, row, col, monster: cellValue });
                    wsServer.send(data); // send data to websocket
                }
            }
        });

        /**
         * Create a new board based on board on server
         * Used to update board on front end when there are changes
         * @param {*} board 
         */
        function createBoard(board) {
            const gameBoard = document.getElementById('gameBoard');
            // remove innerHTML of board to remove current board
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
                    // Handle different cell types
                    if (cell === null) {
                        cellDiv.innerText = '';
                    } else {
                        cellDiv.innerText = cell.value;
                        cellDiv.className += ` ${cell.class}`;
                    }
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
        function updatePlayerList(games, gameName) {
            let playerListHTML = '';
            const players = games[gameName].players;

            for (let playerName in players) {
                let player = players[playerName];
                playerListHTML += `<li class="${player.status}">${player.name} status: ${player.status}</li>`;
            }

            return playerListHTML;
        }


        // view LOGIC
        function displayGameArea(){
            const startGameButtonDiv = document.getElementById('start-game-button');
            startGameButtonDiv.innerHTML = '';
            const gameArea = document.getElementById('game-area');
            gameArea.classList.remove('display-none');
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
        }
        
        function placeMonster(){
            isAddingMonster = true;
            const monsterPlacement = document.getElementById('monster-placement');
            // clear content
            monsterPlacement.innerHTML = '';
            // append cancel placing monster button
            const cancelPlaceMonsterButton = createElement('button', 'btn btn-secondary', 'Cancel Placing Monster', cancelPlacingMonster);
            monsterPlacement.appendChild(cancelPlaceMonsterButton);
            // append place monster type divs so we can select monster
            /*const monsterTypesDiv = document.getElementById('monster-types');
            const vampireButton = createElement('button', 'btn btn-vampire', 'Vampire', addVampire);
            monsterTypesDiv.appendChild(vampireButton);
            const warewolfButton = createElement('button', 'btn btn-warewolf', 'Warewolf', addWarewolf);
            monsterTypesDiv.appendChild(warewolfButton);
            const ghostButton = createElement('button', 'btn btn-ghost', 'Ghost', addGhost);
            monsterTypesDiv.appendChild(ghostButton);*/
            const data = JSON.stringify({ type: 'placing-monster', gameName: currentGameName, playerName: currentPlayer });
            wsServer.send(data); // send data to websocket

        }

        function cancelPlacingMonster(){
            isAddingMonster = false;
            const monsterPlacement = document.getElementById('monster-placement');
            // clear content
            monsterPlacement.innerHTML = '';
            // append back place monster button
            const placeMonsterButton = createElement('button', 'btn btn-primary', 'Place Monster', placeMonster);
            monsterPlacement.appendChild(placeMonsterButton);
            // clear monster types buttons
            /*const monsterTypesDiv = document.getElementById('monster-types');
            monsterTypesDiv.innerHTML = '';*/
        }

        /*function addVampire(){
            const data = JSON.stringify({ type: 'place-vampire', gameName: currentGameName, playerName: currentPlayer });
            wsServer.send(data);
        }

        function addWarewolf(){
            const data = JSON.stringify({ type: 'place-warewolf', gameName: currentGameName, playerName: currentPlayer });
            wsServer.send(data);
        }

        function addGhost(){
            const data = JSON.stringify({ type: 'place-ghost',  gameName: currentGameName, playerName: currentPlayer });
            wsServer.send(data);
        }*/

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


        function updateLocalVariables(dataGames, dataPlayerName, dataGameName){
            curentGames = dataGames;
            currentPlayer = dataPlayerName;
            currentGameName = dataGameName;
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
    })
.catch(error => {
    console.error('Error fetching game data:', error);
});

 