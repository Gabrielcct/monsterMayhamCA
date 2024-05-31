// Monster constants and functions
const MONSTER_STATUS = {
    alive: 'alive',
    dead: 'dead',
};

const MONSTER_TYPE = {
    vampire: 'vampire',
    warewolf: 'warewolf',
    ghost: 'ghost',
    none: null
};

/**
 * Returns starting monsters
 * Each player starts with 10 monsters
 */
function getStartingMonsters (){
    let monsters = [];
    for(let i = 0; i<10; i++){
        monsters.push( 
            {
                id: i, // id of monster (use 0-1 index)
                status: MONSTER_STATUS.alive, // initially monster is alive
                location: null, // if location is null monster is not placed on board
                type: MONSTER_TYPE.none, // type is defined on placing monster
            }
        );
    }
    return monsters;
}

module.exports = { 
    MONSTER_STATUS, 
    MONSTER_TYPE,
    getStartingMonsters, 
};