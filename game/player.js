// Manage player

// Define which sides of the grid belong to each player and allowed positions
const PLAYER_SIDES = {
    'top': {
        row: 0,
        column: [0,1,2,3,4,5,6,7,8,9]
    },
    'bottom': {
        row: 9,
        column: [0,1,2,3,4,5,6,7,8,9]
    },
    'left': {
        row: [0,1,2,3,4,5,6,7,8,9],
        column: 0
    },
    'right': {
        row: [0,1,2,3,4,5,6,7,8,9],
        column: 9
    },
};

const PLAYER_STATUS = {
    "waiting":"waiting",
    "playing": "playing"
};


function getNewPlayer(playerName, side){
    return {
        name: playerName,
        side: side, // Assign player to a side of the grid
        monstersCount: 0, // Initialize monsters count for the player
        status: PLAYER_STATUS.waiting // set initial status as waiting
    }
}

module.exports = { getNewPlayer, PLAYER_SIDES, PLAYER_STATUS };