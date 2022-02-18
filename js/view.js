import { game } from './game.js';
import { handle } from './handle.js';


export const view = {

    elements: {},

    render(gameState) {
        this.renderBoard(gameState.board);
        this.renderPlayerRacks(gameState.players);
        this.elements.buttons = document.querySelectorAll('button');
        this.addListeners();
    },

    // Receives an array of squares representing the gameboard 
    renderBoard(gameBoard) {

        const board = this.getElement('.board');
        this.elements.board = board;

        const tileArea = this.getElement('.tile-area');
        this.elements.tileArea = tileArea;

        gameBoard.forEach(squareObj => {
            const element = this.createElement('div', 'square');
            element.id = squareObj.row * 15 + squareObj.col;

            // For special squares
            if (squareObj.type) {
                element.classList.add(`square--${squareObj.type}`);
                element.setAttribute('data-type', squareObj.type)
                element.innerHTML = element.dataset.type;
            }

            // Append to board
            this.elements.board.append(element);
        })
    },


    renderPlayerRacks(players) {

        players.forEach(player => {
            let playerRack = this.createElement('div', 'player-rack');
            playerRack.id = 'rack-' + player.name.toLowerCase().replace(' ', '-');

            for (let i = 0; i < 7; i++) {
                let currentTile = player.tilesOnRack[i];
                let slot = this.createElement('div', 'player-rack__slot');
                playerRack.append(slot);

                let tile = this.createElement('div', 'tile');
                tile.id = currentTile.id;
                tile.setAttribute('data-letter', currentTile.letter);
                tile.setAttribute('data-points', currentTile.points);
                tile.setAttribute('draggable', 'true');
                tile.innerHTML = `
                <div class="tile__letter">${tile.dataset.letter}</div>
                <div class="tile__point-value">${tile.dataset.points}</div>`;
                slot.append(tile);
            }

            this.elements.tileArea.append(playerRack);
        })

    },


    addListeners() {

        // add listeners to tile area and board
        this.elements.tileArea.addEventListener('dragstart', handle.onDragStart);
        this.elements.tileArea.addEventListener('dragover', handle.onDragOver);
        this.elements.tileArea.addEventListener('dragleave', handle.onDragLeave);
        this.elements.tileArea.addEventListener('drop', handle.onDrop);

        this.elements.board.addEventListener('dragstart', handle.onDragStart);
        this.elements.board.addEventListener('dragover', handle.onDragOver);
        this.elements.board.addEventListener('dragleave', handle.onDragLeave);
        this.elements.board.addEventListener('drop', handle.onDrop);

        // button listners
        this.elements.buttons.forEach(button => {
            button.addEventListener('click', handle.onButtonClick);
        })
    },



    /*********** Helpers ***********/

    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);

        return element;
    },

    getElement(selector) {
        return document.querySelector(selector);
    },

    getAllElements(selector) {
        return document.querySelectorAll(selector);
    },   



}
