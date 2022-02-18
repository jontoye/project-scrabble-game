import * as config from './gameConfig.js';
import { view } from './view.js';


export const game = {
    board: [],
    players: [],
    tiles: [],
    whosTurn: null,
    playing: false,
    currentActiveSquares: [],

    init() {
        this.initBoard();
        this.initTiles();
    },

    initBoard() {
        for (let row = 0; row < config.BOARD_HEIGHT; row++) {
            for (let col = 0; col < config.BOARD_WIDTH; col++) {
                this.board.push( {
                    id: `${row}-${col}`,
                    row: row,
                    col: col,
                    type: null, 
                    currentTile: null,
                    isPlayable: false,

                    getRow: function() {
                        return Number(this.id.split('-')[0]);
                    },

                    getCol: function() {
                        return Number(this.id.split('-')[1]);
                    }
                }) ;

            }
        }
    
        // Add square-type value for bonus squares
        for (let type in config.BONUS_SQUARES) {
            config.BONUS_SQUARES[type].forEach(coord => {
                let square = this.board.find(s => {
                    return (s.getRow() === coord[0]) && (s.getCol() === coord[1]);
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
        while (this.transferTile(this.tiles, newPlayer)) {
            this.transferTile(this.tiles, newPlayer);
        }

        
    },

    transferTile(from, to) {
        // Transfer from letterbag to player
        if (from === this.tiles) {
            let player = to;
            if (player.tilesOnRack.length < 7) {
                let randomIndex = Math.floor(Math.random() * this.tiles.length);
                let newTile = this.tiles.splice(randomIndex, 1)[0];
                player.tilesOnRack.push(newTile);
                return true;
            } else {
                return false;
            }
        }
    },

    evaluateWord(word) {
        if (config.VALID_WORDS[word]) {
            console.log('The word just played was: ', word);
        } else {
            console.log('Invalid word. Try again');
        }
    }

}
















