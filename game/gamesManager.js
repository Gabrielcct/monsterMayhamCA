// Manage all games
// IMPORTS
const {PLAYER_SIDES, PLAYER_STATUS} = require('./player');
const {getStartingMonsters } = require('./monsters');
const {createBoard} = require('./board');

let games = {}; // hold all currently played gamse

/**
 * Start a new game.
 * This will create new player and add it to new game state object 
 * Game will then pushed to games 
 * @param {*} playerName 
 * @return {*} new GameState that is created
 */
function startNewGame(gameName, playerName){
    if(games[gameName]){
        throw new Error('Game exists.');
    }
    // add under games by game name
    games[gameName] = {
        name: gameName, // set name for current game
        board: createBoard(), // Create starting board
        players:{
            [playerName]: {
                id: 1,
                name: playerName,
                placedMonsters: 0, // monsters polaced on board
                availableMonsters: 10, // available monsters to place
                monsters: getStartingMonsters(), // array of monsters
                status: PLAYER_STATUS.waiting, // set initial status as waiting
                side: getPlayerSide(1), // Assign player to a side of the grid - first player to top side
                turn: 1 // set as first turn
            },
        }, 
        maxPlayers: 4,
        currentPlayers: 1,
        isGameStarted: false,
        movingMonster: null
    }
    return games;
}

/**
 * Join a current game.
 * This will create new player and add it to current game state object 
 * inside array of games
 * @param {*} gameName 
 * @param {*} playerName 
 */
function joinExistingGame(gameName, playerName){
    if (!games[gameName]) {
        throw new Error('Game dont exists.');
    }

    if(games[gameName].currentPlayers == 4){
        throw new Error('Game is full.');
    }
    if(!games[gameName].players){
        throw new Error('No players.');
    }
    if(games[gameName].players[playerName]){
        throw new Error('Player already exists.');
    }
    // get player number (1-4) so we can assign side
    const playerNumber = games[gameName].currentPlayers + 1;
    // add player 
    games[gameName].players[playerName] = {
        id: playerNumber,
        name: playerName,
        placedMonsters: 0, // monsters polaced on board
        availableMonsters: 10, // available monsters to place
        monsters: getStartingMonsters(), // array of monsters
        status: PLAYER_STATUS.waiting, // set initial status as waiting
        side: getPlayerSide(playerNumber) // Assign player to a side of the grid - first player to top side
    };
    // update current players
    games[gameName].currentPlayers++;
    return games;
}

/**
 * returns player side depending on player number
 * @returns available player_side
 */
function getPlayerSide(playerNumber){
    if(playerNumber === undefined || playerNumber == null){
        throw new Error('Player number is wrong.'); 
    }
    switch(playerNumber){
        case 1: return PLAYER_SIDES.top;
        case 2: return PLAYER_SIDES.bottom;
        case 3: return PLAYER_SIDES.left;
        case 4: return PLAYER_SIDES.right; 
        default: throw new Error('Player number is wrong.');  
    }
}

function startCurrentGame(games, gameName, playerName){
    games[gameName].isGameStarted = true;
    return games;
}

module.exports = { 
    startNewGame, 
    joinExistingGame, 
    startCurrentGame,
    games
};