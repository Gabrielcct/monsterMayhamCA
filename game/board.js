// Manage board
const {MONSTER_TYPE, MONSTER_STATUS, getMonsterById} = require('./monsters');
const {PLAYER_SIDES, PLAYER_STATUS} = require('./player');
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
 * Updates board with values where player can move
 */
function updateBoardAvailableMovement(games, gameName, playerName){
    if(!games[gameName].board){
        throw new Error("no board to update")
    }
    let gameBoard = games[gameName].board;
    if(!games[gameName].players[playerName].side){
        throw new Error("no player side found")
    }
    let playerStartingRows = games[gameName].players[playerName].side.row;
    let playerStartingColumns = games[gameName].players[playerName].side.column;
    let playerId = games[gameName].players[playerName].id;
    for(let i=0; i< gameBoard.length; i++){
        for(let j=0; j < gameBoard[i].length; j++ ){
            //each cell in row/column if is null - is free
            if(gameBoard[i][j]===null){
                // if is free space add where is free placemnt for player
                // first check if row is where player can move
                let rowFound = playerStartingRows.includes(i);
                if(rowFound){
                    // if it is then check column
                    let columnFound = playerStartingColumns.includes(j);
                    // if both are found add player index indicating he can move
                    if(columnFound){
                        games[gameName].board[i][j] ={
                            value: 'click',
                            class: `player-${playerId}`
                        }
                    }
                }   
            }
        }
    }
    return games;
}

function clearMonsterAvailableMovement(games, gameName){
    let gameBoard = games[gameName].board;
    // Clear all previous placement indicators
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] && gameBoard[i][j].value === 'click') {
                gameBoard[i][j] = null;
            }
        }
    }
    return games;
}

function addMonsterToBoard(games, gameName, playerName, row, col, monsterId){
    let gameBoard = games[gameName].board;
    // Clear all previous placement indicators
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] && gameBoard[i][j].value === 'click') {
                gameBoard[i][j] = null;
            }
        }
    }
    if(games[gameName].players[playerName].placedMonster >= games[gameName].players[playerName].availableMonsters){
        return;
    }
    // add monster to board
    let monster = getMonsterById(monsterId);
    let playerId = games[gameName].players[playerName].id;
    games[gameName].board[row][col] ={
        value: monster.id,
        class: `player-${playerId} ${monster.value}`,
        isMovedThisTurn: true,
        location: {
            row: row,
            col: col
        },
        player: playerName
    }

    games[gameName].players[playerName].placedMonsters++;
    games[gameName].players[playerName].availableMonsters--;
    return games;
}

/**
 * Updates board after monster moved -- clicked on
 * @param {*} games 
 * @param {*} gameName 
 * @param {*} playerName 
 * @param {*} row 
 * @param {*} col 
 * @param {*} monster 
 */
function updateBoardMonsterMoved(games, gameName, playerName, row, col){
    let gameBoard = games[gameName].board;
    //remove monster from previous position
    for(let i=0; i< gameBoard.length; i++){
        for(let j=0; j < gameBoard[i].length; j++ ){
            // if is monster we are moving
            if( i == games[gameName].movingMonster.row && j == games[gameName].movingMonster.col){
                // remove it from board
                games[gameName].board[i][j] = null;     
            }
        }
    }
    
    // Clear all previous placement indicators
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] && gameBoard[i][j].value === 'click') {
                gameBoard[i][j] = null;
            }
        }
    }
    // add monster to board on new position
    let monster = getMonsterById(games[gameName].movingMonster.id);
    games[gameName].movingMonster = null; // reset
    let playerId = games[gameName].players[playerName].id;
    games[gameName].board[row][col] ={
        value: monster.id,
        class: `player-${playerId} ${monster.value}`,
        isMovedThisTurn: true,
        location: {
            row: row,
            col: col
        },
        player: playerName
    }
    return games;
}

/**
 * Update board with available movements for monster
 */
function updateBoardMonsterClicked(games, gameName, playerName, row, col, monsterId){
    let gameBoard = games[gameName].board;
    
    // Clear all previous placement indicators
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] && gameBoard[i][j].value === 'click') {
                gameBoard[i][j] = null;
            }
        }
    }
    // Add new movement indicators
    games = monsterAvailableMovement(games, gameName, playerName, row, col);
    // set monster we are moving
    games[gameName].movingMonster = {
        row:row,
        col:col,
        id: monsterId
    };
    return games;
}

function monsterAvailableMovement(games, gameName, playerName, row, col) {
    let gameBoard = games[gameName].board;
    let playerId = games[gameName].players[playerName].id;

    /// Reference :  Generated with AI (chatGPT)
    function isInBounds(r, c) {
        return r >= 0 && r < gameBoard.length && c >= 0 && gameBoard[r] && c < gameBoard[r].length;
    }

    function isCellEmpty(i, j) {
        return gameBoard[i][j] === null;
    }
    
    // Check horizontal and vertical movements
    // Check horizontal movements
    /// Reference :  Generated with AI (chatGPT)
    for (let i = 0; i < gameBoard.length; i++) {
        if (isCellEmpty(i, col)) {
            gameBoard[i][col] = {
                value: 'click',
                class: `player-${playerId}`
            };
        }
    }

    // Check vertical movements
    /// Reference :  Generated with AI (chatGPT)
    for (let j = 0; j < gameBoard[row].length; j++) {
        if (isCellEmpty(row, j)) {
            gameBoard[row][j] = {
                value: 'click',
                class: `player-${playerId}`
            };
        }
    }

    // Check diagonal movements (up to two squares)
    const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    row = parseInt(row); 
    col = parseInt(col); 

    /// Reference :  Generated with AI (chatGPT)
    // check for all directions
    for (let [dr, dc] of directions) {
        // Parse dr as an integer
        dr = parseInt(dr); 
        dc = parseInt(dc); 
       
        let blocked = false; // Flag to track if a movement is blocked by a non-empty or non-friendly cell
        
        // move can be 2 cells diagonally
        for (let step = 1; step <= 2; step++) {
            let newRow = row + dr * step;
            let newCol = col + dc * step;
            if (isInBounds(newRow, newCol)) {
                if (!blocked && isCellEmpty(newRow, newCol)) {
                    gameBoard[newRow][newCol] = {
                        value: 'click',
                        class: `player-${playerId}`
                    };
                } else {
                    // Stop adding movements if blocked
                    blocked = true;
                }
            }
        }
    }
    return games;
}

function onMonsterAttack(games, gameName, playerName, row, col, monster, movingMonster) {
    let gameBoard = games[gameName].board;
    let playerId = games[gameName].players[playerName].id;

    // Clear all previous placement indicators
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] && gameBoard[i][j].value === 'click') {
                gameBoard[i][j] = null;
            }
        }
    }

    // Check if the target cell is within attack range
    // Reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
    const dRow = Math.abs(row - movingMonster.row);
    const dCol = Math.abs(col - movingMonster.col);

    if ((dRow === 0 || dCol === 0) || (dRow <= 2 && dCol <= 2 && dRow === dCol)) {
        const targetCell = gameBoard[row][col];
        if (targetCell && targetCell.value) {
            // reference :https://stackoverflow.com/questions/4659492/using-javascripts-parseint-at-end-of-string
            const targetMonsterOwner = parseInt(targetCell.class.match(/player-(\d+)/)[1], 10);
            //const targetMonsterType = targetCell.class.split(' ')[1];
            const targetMonsterType = monster;
            if (targetMonsterOwner !== playerId) {
                const movingMonsterType = movingMonster.monster;

                // Resolve the attack based on monster types
                let removeTargetMonster = false;
                let removeMovingMonster = false;
                /**
                 * Attack resolve logic
                 * If there’s a vampire and a werewolf, the werewolf is removed
                 * If there’s a werewolf and a ghost, the ghost is removed
                 * If there’s a ghost and a vampire, the vampire is removed
                 * If there’s two of the same kind of monster, both are removed
                 */
                if (movingMonsterType === 'v') {
                    switch (targetMonsterType) {
                        case 'w':
                            removeTargetMonster = true;
                            break;
                        case 'g':
                            removeMovingMonster = true;
                            break;
                        case 'v':
                            removeTargetMonster = true;
                            removeMovingMonster = true;
                            break;
                        default:
                            break;
                    }
                } else if (movingMonsterType === 'g') {
                    switch (targetMonsterType) {
                        case 'w':
                            removeMovingMonster = true;
                            break;
                        case 'g':
                            removeTargetMonster = true;
                            removeMovingMonster = true;
                            break;
                        case 'v':
                            removeTargetMonster = true;
                            break;
                        default:
                            break;
                    }
                } else if (movingMonsterType === 'w') {
                    switch (targetMonsterType) {
                        case 'w':
                            removeTargetMonster = true;
                            removeMovingMonster = true;
                            break;
                        case 'g':
                            removeTargetMonster = true;
                            break;
                        case 'v':
                            removeMovingMonster = true;
                            break;
                        default:
                            break;
                    }
                }

                if (removeTargetMonster) {
                    gameBoard[row][col] = null;
                }

                if (removeMovingMonster) {
                    gameBoard[movingMonster.row][movingMonster.col] = null;
                } else {
                    // Move the attacking monster to the target cell
                    gameBoard[row][col] = {
                        value: movingMonster.monster,
                        class: `player-${playerId} ${movingMonster.monster}`,
                        isMovedThisTurn: true,
                        location: {
                            row: row,
                            col: col
                        }
                    };

                    // Clear the original cell
                    gameBoard[movingMonster.row][movingMonster.col] = null;
                }

                // Update the game state
                games[gameName].board = gameBoard;

                console.log(`Monster ${movingMonster.monster} attacked monster at (${row}, ${col})`);
                console.log('Result is removeMovingMonster: ' + removeMovingMonster);
            }
        }
    } else {
        console.log('Invalid attack range');
    }

    return games;
}

/**
 * Remove all player figures after he left game
 */
function updateBoardAfterPlayerLeft(games, gameName, playerName){
    let gameBoard = games[gameName].board;
    let playerClass = `player-${games[gameName].players[playerName].id}`;

    // Iterate through the board and remove all cells related to the player
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] && gameBoard[i][j].class && gameBoard[i][j].class.includes(playerClass)) {
                gameBoard[i][j] = null;
            }
        }
    }
    // Update the game state
    games[gameName].board = gameBoard;
    return games;
}

// Reference https://www.sitepoint.com/understanding-module-exports-exports-node-js/
module.exports = { 
    createBoard, 
    updateBoardAvailableMovement,
    clearMonsterAvailableMovement, 
    addMonsterToBoard ,
    updateBoardMonsterClicked,
    updateBoardMonsterMoved,
    updateBoardAfterPlayerLeft,
    onMonsterAttack
};
