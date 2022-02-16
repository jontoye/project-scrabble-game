import { bonusSquares } from './gameConfig.js';
import { letterBag } from './gameConfig.js';
import { view } from './view.js';

const BOARD_HEIGHT = 15;
const BOARD_WIDTH = 15;

export const game = {
    board: [],
    players: [],
    tiles: [],
    whosTurn: null,
    playing: false,
    validWords: [],

    init() {
        this.initBoard();
        this.initTiles();
    },
    

    initBoard() {
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                this.board.push( {
                    row: row, 
                    col: col, 
                    type: null, 
                    currentTile: null
                }) ;
            }
        }
    
        // Add square-type value for bonus squares
        for (let type in bonusSquares) {
            bonusSquares[type].forEach(coord => {
                let square = this.board.find(s => {
                    return s.row === coord[0] && s.col === coord[1];
                });
                square.type = type;
            });
        }
    },

    // Initialize letter tile objects, each tile has a unique ID
    initTiles() {
        let tileID = 0;
        for (let letter in letterBag) {
            for (let i = 0 ; i < letterBag[letter].count; i++) {
                this.tiles.push({
                    id: tileID,
                    letter: letter == 'blank' ? '' : letter,
                    points: letterBag[letter].points
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
        while (this.moveTileToPlayer(newPlayer)) {
            this.moveTileToPlayer(newPlayer);
        }

        
    },

    // Get random tile from bag and assign to designated player
    moveTileToPlayer(player) {
        // TODO: check if letterbag is empty before assigning tiles
       
        // Won't allow more than 7 tiles per player
        if (player.tilesOnRack.length < 7) {
            let randomIndex = Math.floor(Math.random() * this.tiles.length);
            let newTile = this.tiles.splice(randomIndex, 1);
            player.tilesOnRack.push(newTile);
            return true;
        } else {
            return false;
        }
    }

}
















