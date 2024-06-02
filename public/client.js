fetch('/game-data')
    .then(response => response.json())
    .then(data => {
        // set variables get from server
        const gameName = data.gameName;
        const playerName = data.playerName;
        const playerClass= data.playerClass;
        let games = data.games;
        // new websocket -- for game
        const url = `ws://localhost:3000/game/${gameName}`;
        const wsServer = new WebSocket(url);
        // get game board
        const gameBoard = document.getElementById("gameBoard");
        // SET variables
        let isMovingMonster = false;
        let isAddingMonster = false;
        let isPreventAddingMonsters = false;
        let movingMonster = null;
        let isGameOver = false; // check if game finished

        //  update the player list
        const playerListHTML1 = updatePlayerList(games, gameName);
        document.getElementById('player-list').innerHTML = `<ul>${playerListHTML1}</ul>`;
        /** ********************************************   WEBSOCKET MESSAGES  ******************************************** **/
        // EVENTS
        // This will handle web socket messages (events)
        wsServer.onmessage = (event) => {
            // pasrse JSON to get data
            const data = JSON.parse(event.data);
            // based on message type do different things
            switch(data.type){
                case 'player-joined':
                    games = data.games; 
                    // when new player joins game, update the player list
                    const playerListHTML1 = updatePlayerList(data.games, data.gameName);
                    document.getElementById('player-list').innerHTML = `<ul>${playerListHTML1}</ul>`;
                    break;
                case 'current-game-started':
                    games = data.games; 
                    displayGameArea();
                    if (data.games[data.gameName] && data.games[data.gameName].players[playerName]) {
                        const monsters = data.games[data.gameName].players[playerName].monsters;
                        if (monsters) { 
                            updateMonstersDiv(monsters);
                        }
                    }
                    const playerListHTML2 = updatePlayerList(data.games, data.gameName);
                    document.getElementById('player-list').innerHTML = `<ul>${playerListHTML2}</ul>`;
                    break;
                case 'updated-board':
                    isAddingMonster = data.isAddingMonster;
                    isMovingMonster = data.isMovingMonster;
                    games = data.games; 
                    createBoard(data.games[data.gameName].board); // update game board is updated with new data.board
                    // update player list
                    const playerListHTML4 = updatePlayerList(data.games, data.gameName);
                    document.getElementById('player-list').innerHTML = `<ul>${playerListHTML4}</ul>`;
                    if(data.movingMonster !== undefined){
                        movingMonster = data.movingMonster;
                    }
                    break;
                case 'new-monster-added':
                    // if monster was added reset it
                    updatePlaceMonsterView();
                    // prevent adding new monsters this turn
                    isPreventAddingMonsters = true;
                    break;
                case 'new-monster-added-cancelled':
                    // if monster was added reset it
                    updatePlaceMonsterView();
                    break;
                case 'turn':
                    games = data.games; 
                    createBoard(data.games[data.gameName].board); // update game board is updated with new data.board
                    const playerListHTML3 = updatePlayerList(data.games, data.gameName);
                    document.getElementById('player-list').innerHTML = `<ul>${playerListHTML3}</ul>`;
                    break;
                case 'player-surrender':
                    alert('Player has left the game!');
                    games = data.games; 
                    createBoard(data.games[data.gameName].board); // update game board is updated with new data.board   
                    // update player list
                    const playerListHTML5 = updatePlayerList(data.games, data.gameName);
                    document.getElementById('player-list').innerHTML = `<ul>${playerListHTML5}</ul>`;
                    break;
                case 'game-over':
                        alert('Game over');

                        games = data.games; 
                        console.log(playerName)
                        console.log(games[data.gameName].players)
                        if (games[data.gameName] && games[data.gameName].players && games[data.gameName].players.hasOwnProperty(playerName)) {
                            alert('Congratulations! You won!');
                            // Send data to the WebSocket server to update user details
                            const data = JSON.stringify({ type: 'player-won', gameName, playerName });
                            wsServer.send(data); 
                            //redirect to index --- ASSISTED by AI (chatgpt)
                            window.location.href = '/index?playerName=' + encodeURIComponent(playerName); // Pass playerName as query parameter
                        }else{
                            alert('Unfortunately you lose');
                            // Send data to the WebSocket server to update user details
                            const data = JSON.stringify({ type: 'player-lost', gameName, playerName });
                            wsServer.send(data); 
                             //redirect to index --- ASSISTED by AI (chatgpt)
                             window.location.href = '/index?playerName=' + encodeURIComponent(playerName); // Pass playerName as query parameter
                        }
                    break;
                default: break;
            }
        };

        /** ********************************************   ACTION BUTTONS   ******************************************** **/
        /**
         * Function that will start the game. 
         * Game can start when at least two players join
         * No other players can join after game started
         * Gaming area is revealed after game starts
         * @param {*} gameName -- current game name 
         * @param {*} playerName -- current player name
        */
        window.startGame = function (gameName, playerName){
            if (Object.keys(games[gameName].players).length < 2) {
                alert('You need a minimum of two players to start the game');
                return;
            }
            const data = JSON.stringify({ type: 'start-game', gameName, playerName });
            wsServer.send(data);
        }

        /**
         * Function to end the turn. Only player who is playing can end turn.
         * If there are still moving pieces turn can't end
         * @param {*} gameName -- current game name 
         * @param {*} playerName - current player name
         */
        window.endTurn = function (gameName, playerName) {
            // Check if it's the current player's turn
            if (games[gameName].players[playerName].status == 'waiting') {
                alert("It's not your turn!");
                return; // Exit the function if it's not the current player's turn
            }
            // player needs to finish his movement first
            if(isAddingMonster || isMovingMonster){
                alert('First cancel or finish your movement');
                return;
            }
            // allow adding monsters for next turn
            isPreventAddingMonsters = false;
            // Send a message to the server to indicate that the current player's turn has ended
            const data = JSON.stringify({ type: 'end-turn', gameName, playerName });
            wsServer.send(data); // Send data to the WebSocket server
        };

        /**
         * Function to surrender the game
         * @param {*} gameName -- current game name 
         * @param {*} playerName - current player name
         */
        window.surrender = function (gameName,playerName){
            if (games[gameName].players[playerName].status == 'waiting') {
                alert("It's not your turn!");
                return; // Exit the function if it's not the current player's turn
            }
            // ask to confirm surrender
            //Reference: https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
            const isSurrender = confirm("Are you sure you want to surrender? Game will end and you will lose.");
            // if no return
            if(!isSurrender){
                return;
            }
            // else procede with end game 
            const data = JSON.stringify({ type: 'surrender', gameName, playerName });
            wsServer.send(data); // Send data to the WebSocket server
        }

        /** ********************************************  CLICK EVENT LISTENER   ******************************************** **/
        // ADD CLICK EVENT LISENER TO GAME BOARD
        /**
         * Will attach event listener to the board and listen for click events
         */
        gameBoard.addEventListener('click', (event) => {
            // Check if it's the current player's turn
            if (games[gameName].players[playerName].status == 'waiting') {
                alert("It's not your turn!");
                return; // Exit the function if it's not the current player's turn
            }
            // if cell is clicked
            if (event.target.classList.contains('cell')) {
                const row = event.target.dataset.row; // get row clicked
                const col = event.target.dataset.col; // get column clicked
                // Check the value of the cell
                const cellValue = event.target.innerText;
                // if clicked cell has value click
                if (cellValue === 'click') {
                    // if player is adding monsters
                    if(isAddingMonster){
                        // prompt user to enter monster type
                        const monster = prompt("Enter 'v' for vampire, 'w' for werewolf, 'g' for ghost, or 'c' to cancel:");
                        // if monster is not added correctly
                        if (monster === 'c' || !['v', 'w', 'g'].includes(monster)) {
                            alert('Placement canceled');
                            cancelPlacingMonster();
                            return;
                        } else {
                            // if we are adding a monster and clicked on empty cell
                            // set action as placeMonster and send all values
                            const data = JSON.stringify({ type: 'add-monster',gameName, playerName, row, col, monster });
                            wsServer.send(data); // send data to websocket
                        }
                    }
                    // if we are moving existing monster and clicked on empty cell
                    if(isMovingMonster){
                        // set action as moving and send all values
                        const data = JSON.stringify({ type: 'monster-moved', gameName, playerName, row, col });
                        wsServer.send(data); // send data to websocket
                    }

                } else if (['v', 'w', 'g'].includes(cellValue)) {
                   // else if player clicked on cell with monster on 
                    
                    // allow clicking only on player monster unless we are attacking
                    if(!isMovingMonster && event.target.dataset.player != playerName){
                        alert('You can move only your monsters');
                        return;
                    }
                    // check if monster moved this turn before allowing selecting it
                    if(!isMovingMonster && event.target.dataset.isMovedThisTurn == "true"){
                        alert('Monster already moved this turn!');
                        return;
                    }

                    // if we are already moving monster so it is attack on enemy monster
                    // and is enemy monster
                    if(isMovingMonster && event.target.dataset.player != playerName){
                        const data = JSON.stringify({ type: 'monster-attacked', gameName, playerName, row, col, monster: cellValue, movingMonster });
                        wsServer.send(data); // send data to websocket    
                    }else{
                        // else is first click on monster on board so we are preparing to move it(selecting)
                        // set we are moving monster
                        isMovingMonster = true;
                        // Send the current monster type to the server
                        const data = JSON.stringify({ type: 'monster-clicked', gameName, playerName, row, col, monster: cellValue });
                        wsServer.send(data); // send data to websocket
                    }
                }
            }
        });

        /** ********************************************  UPDATE BOARD   ******************************************** **/
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
                        if(cell.player){
                            cellDiv.dataset.player = cell.player;
                        }
                        if(cell.isMovedThisTurn != undefined){
                            cellDiv.dataset.isMovedThisTurn = cell.isMovedThisTurn;
                        }
                        cellDiv.innerText = cell.value;
                        cellDiv.className += ` ${cell.class}`;
                    }
                    rowDiv.appendChild(cellDiv);
                });
                gameBoard.appendChild(rowDiv);
            });
        }

        /** ******************************************** PLAYER LIST  ******************************************** **/
        /**
         * Function to update player list when new player joins
         * */
        function updatePlayerList(games, gameName) {
            let playerListHTML = '';
            const players = games[gameName].players;
            for (let playerName in players) {
                let player = players[playerName];
                playerListHTML += `
                    <li class="${player.status}">Player name : <strong>${player.name}</strong> 
                        <span class="status">Status: <span class="uppercase"><strong>${player.status}</strong></span></span> 
                        <span class="available-monsters">Monsters to place: <strong>${player.availableMonsters}</strong></span>
                        <span class='m-l-25 player-color player-${player.id}'></span>
                    </li>`;
            }
            updateWhoIsPlayingView(games, gameName);
            return playerListHTML;
        }

        function updateWhoIsPlayingView(games, gameName){
            let isMyTurnDiv = document.getElementById('is-my-turn');
            if(!isMyTurnDiv){
                return;
            }
            isMyTurnDiv.innerHTML = '';
            if(games[gameName].players[playerName].status == 'waiting'){
                isMyTurnDiv.innerHTML = ` WAITING PLAYERS ... `; 
                if(isMyTurnDiv.classList.contains('green')){
                    isMyTurnDiv.classList.remove('green');
                }
                isMyTurnDiv.classList.add('red');
            }else{
                isMyTurnDiv.innerHTML = ` MY TURN `; 
                if(isMyTurnDiv.classList.contains('red')){
                    isMyTurnDiv.classList.remove('red');
                }
                isMyTurnDiv.classList.add('green');
            }
        }
       


        /** ******************************************** PLACING MONSTER  ******************************************** **/
        /**
         * Updates front end with monster
         * @param {*} monsters 
         */
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
            /*const monsterInfoDiv = document.getElementById('monsters-info');
            
            const availableMonstersLabel = createElement('span', 'available-monsters-label', 'Available monsters to place: ');
            availableMonstersDiv.appendChild(availableMonstersLabel);
            availableMonstersDiv.appendChild(document.createTextNode(availableMonsters));
            monsterInfoDiv.appendChild(availableMonstersDiv)*/
        }
        /**
         * On place monster clicked
        */
        function placeMonster(){
            if (games[gameName].players[playerName].status == 'waiting') {
                alert("It's not your turn!");
                return; // Exit the function if it's not the current player's turn
            }
            if(isPreventAddingMonsters){
                alert("Only one monster can be added per turn!");
                return; // Exit the function if it's not the current player's turn
            }
            isAddingMonster = true;
            const monsterPlacement = document.getElementById('monster-placement');
            // clear content
            monsterPlacement.innerHTML = '';
            // append cancel placing monster button
            const cancelPlaceMonsterButton = createElement('button', 'btn btn-secondary', 'Cancel Placing Monster', cancelPlacingMonster);
            monsterPlacement.appendChild(cancelPlaceMonsterButton);
            const data = JSON.stringify({ type: 'placing-monster', gameName, playerName });
            wsServer.send(data); // send data to websocket

        }
        /**
        * On cacnel placing monster 
        */
        function cancelPlacingMonster(){
            isAddingMonster = false;
            updatePlaceMonsterView();
            const data = JSON.stringify({ type: 'cancel-placing-monster', gameName, playerName });
            wsServer.send(data); // send data to websocket
        }

        /**
         * Updates view
         */
        function updatePlaceMonsterView(){
            isAddingMonster = false;
            const monsterPlacement = document.getElementById('monster-placement');
            // clear content
            monsterPlacement.innerHTML = '';
            // append back place monster button
            const placeMonsterButton = createElement('button', 'btn btn-primary', 'Place Monster', placeMonster);
            monsterPlacement.appendChild(placeMonsterButton);
        }

        /** ********************************************  DISPLAY GAME AREA  ******************************************** **/
        /**
         * After clicking start remove display none from gaming area
         */
        function displayGameArea(){
            const startGameButtonDiv = document.getElementById('start-game-button');
            startGameButtonDiv.innerHTML = '';
            const gameArea = document.getElementById('game-area');
            gameArea.classList.remove('display-none');
        }

        /** ******************************************** HELPERS FOR VIEW ******************************************** **/
        /**
         * Create element. If is button add function onclick.
         * Return created element
        */
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

        /** ******************************************** TRACK WEB SOCKET SERVER ******************************************** **/
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

 