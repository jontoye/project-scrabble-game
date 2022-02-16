import { game } from './game.js';
import { handle } from './handle.js';


export const view = {

    elements: {},

    // Draw an empty game board
    renderBoard: function() {
        this.elements.board = document.querySelector('.board');
        game.board.forEach(square => {
            const squareElement = document.createElement('div');
            squareElement.id = `${square.row}-${square.col}`;
            squareElement.classList.add('square');
            
            // For special squares
            if (square.type) {
                squareElement.classList.add(`square--${square.type}`);
                squareElement.setAttribute('data-type', square.type);
                squareElement.innerHTML = squareElement.dataset.type;
            }

            this.elements.board.append(squareElement);
            
        })
    },

    renderTile: function() {

    },

    renderPlayer: function() {

    },

    renderStats: function() {

    },

    renderGameOver: function() {

    },

    addListeners: function () {

    }



}
