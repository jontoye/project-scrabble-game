import * as config from './gameConfig.js';
import { view } from './view.js';

export const game = {
    board: [],
    players: [],
    tiles: [],
    currentPlayedSquares: [],
    currentAdjacentSquares: [112],  // center square
    whosTurn: null,
    playing: false,

    init() {
        this.initBoard();
        this.initTiles();
    },

    initBoard() {
        for (let row = 0; row < config.BOARD_HEIGHT; row++) {
            for (let col = 0; col < config.BOARD_WIDTH; col++) {
                this.board.push( {
                    id: row * 15 + col,
                    row: row,
                    col: col,
                    type: null, 
                    currentTile: null,
                    isPlayable: false,
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

    // Inserts new tile from letter bag into players tile rack, returns tile object
    getTileFromBag(player) {
        let randomIndex = Math.floor(Math.random() * this.tiles.length);
        let newTile = this.tiles.splice(randomIndex, 1)[0];
        player.tilesOnRack.push(newTile);
        return newTile;
    },
    

    transferTile(tileInTransit) {
        let start = tileInTransit.startLocation;
        let destination = tileInTransit.endLocation;
        let playerRack = this.players[this.whosTurn].tilesOnRack;
        let playerBoard = this.players[this.whosTurn].tilesOnBoard;
  
        // Tile picked up from board
        if (start !== 'player-rack') {
            this.board[Number(start)].currentTile = null;
            this.removePlayedSquare(Number(start));

            // Placed on rack
            if (destination === 'player-rack') {
                playerRack.push(playerBoard.splice(playerBoard.findIndex(tile => tile.id === tileInTransit.id), 1)[0]);
            }
        } 

        // Tile placed on board
        if (destination !== 'player-rack') {
            this.board[destination.id].currentTile = tileInTransit.letter;
            this.addPlayedSquare(destination.id);

            // From rack
            if (start === 'player-rack') {
                playerBoard.push(playerRack.splice(playerRack.findIndex(tile => tile.id === tileInTransit.id), 1)[0]);
            }
        }
    },

    isValidWord(wordObj) {
        return config.VALID_WORDS[wordObj.letters.join('')];
    },

    scoreWord(wordObj) {
        const { letters: lettersToScore , loc: boardIDs } = wordObj;
        let points = 0;
        let wordMultiplier = 1;

        lettersToScore.forEach((letter, i) => {
            let currentID = boardIDs[i];
            let letterMultiplier = 1;

            // If player placed a tile on a bonus square, use multipliers
            if (game.currentPlayedSquares.includes(currentID)) {

                // set multiplier values
                if (game.board[currentID].type === 'dl') {
                    letterMultiplier = 2;
                } else if (game.board[currentID].type === 'dw') {
                    wordMultiplier = 2;
                } else if (game.board[currentID].type === 'tl') {
                    letterMultiplier = 3;
                } else if (game.board[currentID].type === 'tw') {
                    wordMultiplier = 3;
                } 
            }
            points += (config.LETTER_BAG[letter].points) * (letterMultiplier);
        });
        points *= wordMultiplier;
        return points;
    },

    updateAdjacentSquares() {
        this.currentPlayedSquares.forEach(boardID => {

            // remove where tiles have been placed
            if (this.currentAdjacentSquares.includes(boardID)) {
                this.currentAdjacentSquares.splice(this.currentAdjacentSquares.findIndex(i => i === boardID), 1);
            }

            let toRight = boardID + 1;
            let toLeft = boardID -1;
            let toTop = boardID - 15;
            let toBot = boardID +15;

            [toRight, toLeft, toTop, toBot].forEach(id => {
                if (id > 224 || id < 0) { return; }
                if (this.board[id].currentTile === null) {
                    this.currentAdjacentSquares.push(id);
                }
            })

        })

    },

    getAdjacentHorizontalLetters(boardID) {
        let adjacent = { letters: [], loc: [] };

        // traverse to the left until empty square 
        while (this.board[boardID - 1].currentTile) {
            boardID--;
            if (boardID < 0) { break; }
        }

        // traverse right, collecting letters
        while (this.board[boardID].currentTile) {
            adjacent.letters.push(this.board[boardID].currentTile);
            adjacent.loc.push(boardID);
            boardID++;
            if (boardID > 224) { break; }
        }

        return adjacent.letters.length > 1 ? adjacent : null;
    },

    getAdjacentVerticalLetters(boardID) {
        let adjacent = { letters: [], loc: [] };

        // traverse up until empty square
        while (this.board[boardID - 15].currentTile) {
            boardID -= 15;
            if (boardID < 0) { break; }
        }

        // traverse down, collecting letters
        while (this.board[boardID].currentTile) {
            adjacent.letters.push(this.board[boardID].currentTile);
            adjacent.loc.push(boardID);
            boardID += 15;
            if (boardID > 224) { break; }
        }

        return adjacent.letters.length > 1 ? adjacent : null;
    },

    addPlayedSquare(boardID) {
        this.currentPlayedSquares.push(boardID);
        this.currentPlayedSquares.sort((a, b) => a - b);
    },

    removePlayedSquare(boardID) {
        this.currentPlayedSquares.splice(this.currentPlayedSquares.indexOf(boardID), 1);
    },

    hasTileOnSquare(boardID) {
        return !!this.board[boardID].currentTile; 
    },

    nextPlayer() {
        this.whosTurn = (this.whosTurn + 1) % this.players.length;
    },





    // TODO: remove (just for testing)

    showCurrentAdjacentTiles() {
        this.currentAdjacentSquares.forEach(id => {
            document.getElementById(id).style.backgroundColor = 'black';
        });
    }

}
















