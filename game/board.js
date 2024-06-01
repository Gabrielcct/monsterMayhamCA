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

    function isInBounds(r, c) {
        return r >= 0 && r < gameBoard.length && c >= 0 && gameBoard[r] && c < gameBoard[r].length;
    }

    function isCellEmpty(i, j) {
        return gameBoard[i][j] === null;
    }
    
    // Check horizontal and vertical movements
    // Check horizontal movements
    for (let i = 0; i < gameBoard.length; i++) {
        if (isCellEmpty(i, col)) {
            gameBoard[i][col] = {
                value: 'click',
                class: `player-${playerId}`
            };
        }
    }

    // Check vertical movements
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

/**
 * Check if there are unmoved monsters
 */
function hasUnmovedMonsters(games, gameName, playerName) {
    const board = games[gameName].board;
    const player = games[gameName].players[playerName];
    const playerId = player.id;

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col];
            if (cell && cell.value && cell.class.includes(`player-${playerId}`) && !cell.isMovedThisTurn) {
                // Found an unmoved monster belonging to the player
                return true;
            }
        }
    }

    // No unmoved monsters found for the player
    return false;
}



// Reference https://www.sitepoint.com/understanding-module-exports-exports-node-js/
module.exports = { 
    createBoard, 
    updateBoardAvailableMovement,
    clearMonsterAvailableMovement, 
    addMonsterToBoard ,
    updateBoardMonsterClicked,
    updateBoardMonsterMoved,
    hasUnmovedMonsters
};
