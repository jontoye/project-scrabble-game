import { Event } from "./Event.js";

export class Game {
    
    constructor(config) {
        this.board = new Board(config.BOARD_HEIGHT, config.BOARD_WIDTH, config.BOARD_BONUS_SQUARES);
        this.letterBag = new LetterBag(config.LETTER_BAG);
        this.players = [];
        this.whosTurn = null;
        this.playing = false;
        this.validWords = config.VALID_WORDS;
        this.playedWords = [];
        this.activeTile = { id: null, location: null};

        // this.addPlayerEvent = new Event();
        // this.updateSquareEvent = new Event();
        // this.updateRackEvent = new Event();
    }

    start() {
        this.whosTurn = 0;
        this.player = true;
    }

    passTurn() {
        this.nextPlayer();
    }

    addPlayer(name) {
        if (this.players.length < 4) {
            const player = new Player(name);

            // Initialize tile rack
            for (let i = 0; i < 7 ; i++) {
                player.addNewTile(this.letterBag.getRandomTile());
            }

            this.players.push(player);

            return true;
        } else {
            console.error("Can't have more than 4 players");
            return false;
        }
    }

    setActiveTile(tile) {
        this.activeTile = tile;
    }

    getActiveTile() {
        return this.activeTile;
    }

    // set whosTurn to next active player
    nextPlayer() {
        this.whosTurn = (this.whosTurn + 1) % this.players.length; 
        if (!this.getCurrentPlayer().isPlaying) {
            this.nextPlayer();
        }
    }

    forfeitPlayer(id) {
        this.players[id].isPlaying = false;
    }

    getCurrentPlayer() {
        return this.players[this.whosTurn];
    }

    getCurrentPlayerRack() {
        return this.getCurrentPlayer().tilesOnRack;
    }

}


class Player {
    constructor(name, avatar) {
        this.name = name;
        this.avatar = '';
        this.score = 0;
        this.tilesOnRack = [];
        this.tilesOnBoard = [];
        this.bestWord = { word: '', points: '' };
        this.isPlaying = true;
    }

    addNewTile(tileObj) {
        if (this.tilesOnRack.length < 7) {
            tileObj.location = 'rack';
            this.tilesOnRack.push(tileObj);
            return true;
        } else {
            console.error('Player rack full');
        }
    }

    removeTile(tileObj) {
        if (tileObj) {
            let i = this.tilesOnRack.findIndex(tile => tile === tileObj);
            this.tilesOnRack.splice(i, 1);
        } else {
            console.error('no tile object provided');
        }
    }
}


class Board {
    constructor(height, width, bonusSquares) {
        this.squares = [];
        this.currentPlayedSquares = [];
        this.currentAdjacentSquares = [112];

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                this.squares.push( {
                    id: row * 15 + col,
                    row: row,
                    col: col,
                    type: null, 
                    currentTile: null,
                }) ;
            }
        }
    
        // Add square-type value for bonus squares
        for (let type in bonusSquares) {
            bonusSquares[type].forEach(coord => {
                let square = this.squares.find(s => {
                    return (s.row === coord[0]) && (s.col === coord[1]);
                });
                square.type = type;
            });
        }

    }

    updateAdjacentSquares() {
        this.currentPlayedSquares.forEach(boardID => {

            // remove where tiles have been placed
            if (this.currentAdjacentSquares.includes(boardID)) {
                this.currentAdjacentSquares.splice(this.currentAdjacentSquares.findIndex(i => i === boardID), 1);
            }

            let toRight = (boardID + 1) % 15 === 0 ? boardID : boardID + 1;
            let toLeft = (boardID - 1) % 15 === 14 ? boardID : boardID -1;
            let toTop = (boardID - 15) < 0 ? boardID : boardID - 15;
            let toBot = (boardID + 15) > 224 ? boardID : boardID + 15;

            [toRight, toLeft, toTop, toBot].forEach(id => {
                if (this.squares[id].currentTile === null) {
                    this.currentAdjacentSquares.push(id);
                }
            })
        })
    }


    getAdjacentHorizontalLetters(boardID) {
        let adjacent = { letters: [], loc: [] };

        // traverse to the left until empty square 
        if (boardID % 15 !== 0) {   // no need to go left if already at 1st col
            while (this.squares[boardID - 1].currentTile) {
                boardID--;
                if (boardID % 15 === 0) { break; }      // reached 1st col
            }          
        }

        // traverse right, collecting letters
        while (this.squares[boardID].currentTile) {
            adjacent.letters.push(this.squares[boardID].currentTile);
            adjacent.loc.push(boardID);
            boardID++;
            if (boardID % 15 === 0) { break; }  // reached last col
        }

        return adjacent.letters.length > 1 ? adjacent : null;
    }

    getAdjacentVerticalLetters(boardID) {
        let adjacent = { letters: [], loc: [] };

        // traverse up until empty square
        if (boardID > 14) {     // no need to go up if already at first row
            while (this.squares[boardID - 15].currentTile) {
                boardID -= 15;
                if (boardID < 0) { break; }     // reached 1st row
            }
        }

        // traverse down, collecting letters
        while (this.squares[boardID].currentTile) {
            adjacent.letters.push(this.squares[boardID].currentTile);
            adjacent.loc.push(boardID);
            boardID += 15;
            if (boardID > 224) { break; }    // reached end of board
        }

        return adjacent.letters.length > 1 ? adjacent : null;
    }

    addPlayedSquare(boardID) {
        this.currentPlayedSquares.push(boardID);
        this.currentPlayedSquares.sort((a, b) => a - b);
    }

    removePlayedSquare(boardID) {
        boardID = Number(boardID);
        this.currentPlayedSquares.splice(this.currentPlayedSquares.indexOf(boardID), 1);
    }

    hasTileOnSquare(boardID) {
        return !!this.squares[boardID].currentTile; 
    }

    getSquareLetter(boardID) {
        return this.squares[boardID].currentTile;
    }

    setSquareLetter(boardID, letter){
        this.squares[boardID].currentTile = letter;
    }
}


class LetterBag {
    constructor(tileConfig) {   
        this.tiles = [];

        let tileID = 0;
        for (let letter in tileConfig) {
            for (let i = 0 ; i < tileConfig[letter].count; i++) {
                this.tiles.push({
                    id: 't-' + tileID,
                    letter: letter == 'blank' ? '' : letter,
                    points: tileConfig[letter].points,
                    location: null,
                });
                tileID++;
            }
        }
    }

    isEmpty() {
        return this.tiles.length === 0;
    }

    getRandomTile() {
        if (!this.isEmpty()) {
            let randomIndex = Math.floor(Math.random() * this.tiles.length);
            let newTile = this.tiles.splice(randomIndex, 1)[0];
            return newTile;        
        }
        return false;
        console.info('Letter bag is empty')
    }
}