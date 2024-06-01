// PLAYER constants

// Define which sides of the grid belong to each player and allowed positions
const PLAYER_SIDES = {
    'top': {
        row: [0],
        column: [0,1,2,3,4,5,6,7,8,9],
        isAssigned: false
    },
    'bottom': {
        row: [9],
        column: [0,1,2,3,4,5,6,7,8,9],
        isAssigned: false
    },
    'left': {
        row: [0,1,2,3,4,5,6,7,8,9],
        column: [0],
        isAssigned: false
    },
    'right': {
        row: [0,1,2,3,4,5,6,7,8,9],
        column: [9],
        isAssigned: false
    },
};

const PLAYER_STATUS = {
    "waiting":"waiting",
    "playing": "playing"
};

module.exports = { PLAYER_SIDES, PLAYER_STATUS };