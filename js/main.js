import { game } from "./game.js";
import { view } from "./view.js";
// validWords: require('../data/words.json'),

console.log('Welcome to Scrabble!')


// START GAME
game.init();  
game.addPlayer('Player 1');
game.addPlayer('Player 2');
view.render(game);


console.log(game);
window.game = game;