import { game } from "./game.js";
import { view } from "./view.js";

export const controller = {

    
    startGame: function() {
        let numPlayers = game.players.length;
        game.whosTurn = game.players[0];
        game.playing = true;
        
        console.log('current player: ', game.whosTurn);
    },


}