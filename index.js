const express = require("express");// use express package
// body parser middleware 
// Reference: https://www.npmjs.com/package/body-parser
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const WebSocket = require('ws');

//const PORT = (3000); //use port 3000
// either use port 3000 or process.argv[2] from command line specify
const PORT = (process.argv[2] || 3000);

// assign app to express - create app
app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// rendering with ejs 
// Reference https://ejs.co/
app.set("view engine", "ejs");

// put in public folder by joining current tirectory with public
app.use(express.static(path.join(__dirname, 'public')));

// generate 10x10 board
const startingBoard = [];

for (let i = 0; i < 10; i++) {
    const row = []; // create row
    for (let j = 0; j < 10; j++) {
        row.push(null); // push null for every column
    }
    // add rows to startingBoard array
    startingBoard.push(row);
}

app.get("/", (req, res) => {
    res.render("index.ejs", { board: startingBoard} );
});

// Listen on port 3000
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});