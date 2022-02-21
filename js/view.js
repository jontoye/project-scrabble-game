import { handle } from './handle.js';

export const view = {

    elements: {},

    render(gameState) {
        this.renderBoard(gameState.board);
        this.renderPlayerRacks(gameState.players);
        this.elements.buttons = document.querySelectorAll('button');
        this.elements.scores = document.querySelectorAll('.player-card__score > span');
        this.elements.bestWord = document.querySelectorAll('.player-card__best-word > span');
        this.addListeners();
    },

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
        players.forEach((player, i) => {
            let playerRack = this.createElement('div', 'player-rack', 'hidden'); 
            // let playerRack = this.createElement('div', 'player-rack');  // FOR TESTING --> doesnt hide racks
            playerRack.id = 'rack-' + i;

            for (let i = 0; i < 7; i++) {
                let currentTile = player.tilesOnRack[i];
                let slot = this.createElement('div', 'player-rack__slot');
                playerRack.append(slot);

                let tile = this.renderTile(currentTile.id, currentTile.letter, currentTile.points);
                slot.append(tile);
            }
            this.elements.tileArea.append(playerRack);
        })
    },

    renderTile(id, letter, points) {
        let tile = this.createElement('div', 'tile');
        tile.id = id;
        tile.setAttribute('data-letter', letter);
        tile.setAttribute('data-points', points);
        tile.setAttribute('draggable', 'true');
        tile.innerHTML = `
        <div class="tile__letter">${tile.dataset.letter}</div>
        <div class="tile__point-value">${tile.dataset.points}</div>`;

        return tile;
    },

    renderPlayerStats(playerID, score, best) {
        this.elements.scores[playerID].innerText = score;
        this.elements.bestWord[playerID].innerText = best.word + ' || ' + best.points;
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

    focusSquare(element) {
        element.classList.add('pop-out');
    },

    removeFocusSquare(element) {
        element.classList.remove('pop-out');
    },

    moveTileToBoard(elementID, boardID) {
        let tileElement = document.getElementById(elementID);
        let squareElement = document.getElementById(boardID);
        
        if (squareElement.childNodes.length < 2) {
            squareElement.append(tileElement);
            this.removeFocusSquare(tileElement.parentNode);
        }
    },

    moveTileToRack(elementID, rackSlot) {
        let tileElement = document.getElementById(elementID);       
        
        // Allow the drop area to only be a slot
        while (!rackSlot.classList.contains('player-rack__slot')) {
            rackSlot = rackSlot.parentNode;
        }
        
        // Slot is empty
        if (!rackSlot.hasChildNodes()) {
            rackSlot.append(tileElement);
        } 

        // Slot already contains a tile, so shift it to the next available empty slot
        else {

            // prev and next of slots on end of rack will default to current drop area
            let tileToMove = rackSlot.firstChild;
            let prevSlot = rackSlot.previousSibling || rackSlot;
            let nextSlot = rackSlot.nextSibling || rackSlot;

            if (tileElement === tileToMove) return;

            // Previous slot is empty
            if (!prevSlot.hasChildNodes()) {
                prevSlot.append(tileToMove);
                rackSlot.append(tileElement);
            } 
            // Next slot is empty
            else if (!nextSlot.hasChildNodes()) {
                nextSlot.append(tileToMove);
                rackSlot.append(tileElement);
            } 
            // Need to swap tiles
            else {
                this.swapTiles(tileElement.parentNode, tileToMove.parentNode)
            }
        }
    },

    showPlayerRack(id) {
        let element = document.querySelector(`#rack-${id}`);
        element.classList.remove('hidden');        
    },

    hidePlayerRack(id) {
        let element = document.querySelector(`#rack-${id}`);
        element.classList.add('hidden');        
    },

    freezeTile(squareID) {
        let square = document.getElementById(squareID);
        let tile = square.querySelector('.tile');
        tile.removeAttribute('draggable');
    },

      
    /*********** Helpers ***********/
    swapTiles(slotA, slotB) {
        // console.log('slots', slotA, slotB);
        let tileA = slotA.removeChild(slotA.firstChild);
        let tileB = slotB.removeChild(slotB.firstChild);
        slotA.append(tileB);
        slotB.append(tileA);
    },
    
    createElement(tag, ...classNames) {
        const element = document.createElement(tag);
        classNames.forEach(name => element.classList.add(name));

        return element;
    },

    getElement(selector) {
        return document.querySelector(selector);
    },

    getAllElements(selector) {
        return document.querySelectorAll(selector);
    },   
    
}
