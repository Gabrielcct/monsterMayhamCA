// Manage one game state

// IMPORT from other js files what is needed for this one
const { createBoard } = require('./board');
const { getNewPlayer, PLAYER_SIDES, PLAYER_STATUS } = require('./player');

/**
 * Creates and empty game state with new game name
 * @param {*} gameName 
 * @returns game state
 */
function getGameState(gameName){
    //keep current game state in object
    return {
        name: gameName, // set name for current game
        board: createBoard(), // Create starting board
        players: [],  // Array to store player objects
        maxPlayers: 4
    };
}
/**
 * Function to create and add new player to game state
 * @param {*} player 
 */
function setGameStatePlayer(gameState, playerName){
    // find free side
    const side = findFreeSide(gameState); 
    // if side is found 
    if (side) { 
        // create new player
        const newPlayer = getNewPlayer(playerName, side);
        // add player to game state
        addPlayerToGameState(gameState, newPlayer);
    } else {
        throw new Error('No available sides for new players.');
    }
}

/**
 * Function to add player to game state 
 */
function addPlayerToGameState(gameState, newPlayer) {
    // check first if that player exist
    if (!gameState.players.find(p => p.name === newPlayer.name)) {
        // if is no add it to game state
        gameState.players.push(newPlayer);
    }
}

/**
 * Find first available player side
 * @returns availableplayer_side
 */
function findFreeSide(gameState){
    let selectedSide = null;
    // go trough all sides in object
    Object.keys(PLAYER_SIDES).forEach((val,index)=>{
        // if we didnt found selected side and side is already assigned
        if ((!gameState.players.find(p => p.side === val) )&& selectedSide == null){
            // assign that side to player
            selectedSide = val;
        }
    });
    return selectedSide;
}

module.exports = { getGameState, setGameStatePlayer };