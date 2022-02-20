import { game } from "./game.js";
import { view } from "./view.js";

export const controller = {

    startGame() {
        let numPlayers = game.players.length;
        game.whosTurn = 0;
        game.playing = true;
        this.beginTurn();
    },

    beginTurn() {
        view.showPlayerRack(game.whosTurn);
    },

    endTurn() {

        // lock tiles in plaace
        game.currentPlayedSquares.forEach(squareID => {
            view.freezeTile(squareID);
        });

        // update player stats

        // update board data
        game.updateAdjacentSquares();
        game.currentPlayedSquares = [];

        // refill player rack
        this.refillRack(game.whosTurn);
        this.switchPlayer();
    },
    
    switchPlayer() {
        view.hidePlayerRack(game.whosTurn);   
        game.nextPlayer();
        view.showPlayerRack(game.whosTurn);
    },

    refillRack(playerID) {
        let tilesNeeded = 7 - game.players[playerID].tilesOnRack.length;
        
        for (let i = 0; i < tilesNeeded; i++) {
            let tileObj = game.getTileFromBag(game.players[playerID]);

            const {id, letter, points} = tileObj;
            let tileElement = view.renderTile(id, letter, points);
            let rackID = 'rack-' + game.whosTurn;
            let emptySlotElement = document.querySelector(`#${rackID} > .player-rack__slot:empty`);

            emptySlotElement.append(tileElement);
        }
    },
}


window.control = controller;