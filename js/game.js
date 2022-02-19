import * as config from './gameConfig.js';
import { view } from './view.js';


export const game = {
    board: [],
    players: [],
    tiles: [],
    whosTurn: null,
    playing: false,
    currentActiveSquares: [],
    currentAdjacentSquares: [112],  // center square

    init() {
        this.initBoard();
        this.initTiles();
    },

    initBoard() {
        for (let row = 0; row < config.BOARD_HEIGHT; row++) {
            for (let col = 0; col < config.BOARD_WIDTH; col++) {
                this.board.push( {
                    // id: `${row}-${col}`,
                    id: row * 15 + col,
                    row: row,
                    col: col,
                    type: null, 
                    currentTile: null,
                    isPlayable: false,

                    // getRow: function() {
                    //     return Number(this.id.split('-')[0]);
                    // },

                    // getCol: function() {
                    //     return Number(this.id.split('-')[1]);
                    // }
                }) ;

            }
        }
    
        // Add square-type value for bonus squares
        for (let type in config.BONUS_SQUARES) {
            config.BONUS_SQUARES[type].forEach(coord => {
                let square = this.board.find(s => {
                    return (s.row === coord[0]) && (s.col === coord[1]);
                });
                square.type = type;
            });
        }
       
    },

    // Initialize letter tile objects, each tile has a unique ID
    initTiles() {
        let tileID = 0;
        for (let letter in config.LETTER_BAG) {
            for (let i = 0 ; i < config.LETTER_BAG[letter].count; i++) {
                this.tiles.push({
                    id: 't-' + tileID,
                    letter: letter == 'blank' ? '' : letter,
                    points: config.LETTER_BAG[letter].points
                });
                tileID++;
            }
        }
    }, 

    // Add a new player to this game object
    addPlayer(name) {
        this.players.push({
            name: name, 
            score: 0, 
            tilesOnRack: [], 
            tilesOnBoard: []
        });

        let newPlayer = this.players[this.players.length - 1];

        // Fill players rack with tiles
        for (let i = 0; i < 7; i++) {
            this.getTileFromBag(newPlayer);
        }

        
    },

    // Inserts new tile from letter bag into players tile rack
    getTileFromBag(player) {
        
        let randomIndex = Math.floor(Math.random() * this.tiles.length);
        let newTile = this.tiles.splice(randomIndex, 1)[0];
        player.tilesOnRack.push(newTile);
    
    },
    

    transferTile(tileInTransit) {
        // console.log(tileInTransit);
        let start = tileInTransit.startLocation;
        let destination = tileInTransit.endLocation;
        let playerRack = this.whosTurn.tilesOnRack;
        let playerBoard = this.whosTurn.tilesOnBoard;
  

        // Tile picked up from board
        if (start !== 'player-rack') {
            this.board[start].currentTile = null;
            this.currentActiveSquares.splice(this.currentActiveSquares.indexOf(start), 1);

            // Placed on rack
            if (destination === 'player-rack') {
                playerRack.push(playerBoard.splice(playerBoard.findIndex(tile => tile.id === tileInTransit.id), 1)[0]);
            }
        } 

        // Tile placed on board
        if (destination !== 'player-rack') {
            this.board[destination.id].currentTile = tileInTransit.letter;
            this.currentActiveSquares.push(destination.id);

            // From rack
            if (start === 'player-rack') {
                playerBoard.push(playerRack.splice(playerRack.findIndex(tile => tile.id === tileInTransit.id), 1)[0]);
            }
        }

        // sort active squares in order to determine if valid tile placement
        this.currentActiveSquares.sort((a, b) => a - b);


    },

    // returns true if word is valid, false otherwise
    evaluateWord(word) {
        if (config.VALID_WORDS[word]) {
            console.log('The word just played was: ', word);
            return true;
        } else {
            console.log('Invalid word. Try again');
            return false;
        }
    },

    updateAdjacentSquares(playedLocations) {

        playedLocations.forEach(boardID => {
            let toRight = boardID + 1;
            let toLeft = boardID -1;
            let toTop = boardID - 15;
            let toBot = boardID +15;

            [toRight, toLeft, toTop, toBot].forEach(id => {
                if (this.board[id].currentTile === null) {
                    this.currentAdjacentSquares.push(id);
                }
            })

        })

    },

    nextPlayer() {
        this.whosTurn = this.players.indexOf(this.whosTurn) + 1 % (this.players.length);
    },











    // TODO: just for testing

    showCurrentAdjacentTiles() {
        this.currentAdjacentSquares.forEach(id => {
            document.getElementById(id).style.backgroundColor = 'black';
        });
    }

}
















