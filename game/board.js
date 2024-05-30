// Manage board

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

// Reference https://www.sitepoint.com/understanding-module-exports-exports-node-js/
module.exports = { createBoard };
