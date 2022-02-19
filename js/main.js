import { game } from "./game.js";
import { view } from "./view.js";
import { controller } from "./controller.js";
// validWords: require('../data/words.json'),

console.log('Welcome to Scrabble!')


// Initialize model and view
game.init();  
game.addPlayer('Player 1');
game.addPlayer('Player 2');
view.render(game);

controller.startGame();




// console.log(game);
window.game = game;