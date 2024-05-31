// Manage all games
// IMPORTS
const { getGameState, setGameStatePlayer } = require('./gameState');

let games = []; // hold all currently played gamse

/**
 * Add gameState to games
 * @param {*} gameState 
 */
function addToGames(gameState){
    games.push(gameState);
}

// returns all current games
function getAllGames(){
    return games;
}

/**
 * Start a new game.
 * This will create new player and add it to new game state object 
 * Game will then pushed to games 
 * @param {*} playerName 
 * @return {*} new GameState that is created
 */
function startNewGame(gameName, playerName){
    // get empty gameState object
    const newGameState = getGameState(gameName);
    // create new player and add it to game state 
    setGameStatePlayer(newGameState, playerName);
    // add it to games
    addToGames(newGameState);
    console.log(newGameState)
    return newGameState;
}

/**
 * Join a current game.
 * This will create new player and add it to current game state object 
 * inside array of games
 * @param {*} gameState 
 * @param {*} playerName 
 */
function joinExistingGame(gameState, playerName){
    if (gameState.players.length < gameState.maxPlayers) {
        setGameStatePlayer(gameState, playerName);
    } else {
        throw new Error('Game is full.');
    }
}

function getGameStateFromGames(gameStateName){
    return games.find(gameState=>gameState.name = gameStateName);
}


module.exports = { 
    startNewGame, 
    joinExistingGame, 
    getAllGames, 
    getGameStateFromGames,
    games, 
};