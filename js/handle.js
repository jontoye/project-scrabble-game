import { game } from "./game.js";

export const handle = {
    onDragStart(e) {
        e.dataTransfer.effectAllowed = 'move';

        // Use an object to store the id, startLocation, and endLocation of the selected tile
        let tileInTransit = {
            id: e.target.id,
            startLocation: e.target.parentNode.id || 'player-rack'
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(tileInTransit));

        console.log('Picked up tile from: ', tileInTransit.startLocation);
    },
    
    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        // Add effect to board squares when hovering over with tile
        if (e.target.classList.contains('square')) {
            e.target.classList.add('pop-out');
        }
    },

    onDragLeave(e) {
        e.preventDefault();
        // Remove square highlighting effect
        e.target.classList.remove('pop-out');
    },

    onDrop(e) {
        e.preventDefault();

        // Update tileInTransit object with endLocation
        const tileInTransit = JSON.parse(e.dataTransfer.getData('text/plain'));
        tileInTransit.endLocation = e.target.id || 'player-rack';
        
        // Get the tile element
        const tile = document.getElementById(tileInTransit.id);
        
        // If tile came from another sqaure, remove data from that square
        let startIndex = parseInt(tileInTransit.startLocation);
        if (startIndex) {
            game.board[startIndex].currentTile = null;
            game.currentActiveSquares.splice(game.currentActiveSquares.indexOf(startIndex), 1);
        }

        // Handle adding letter to the board
        if (e.target.classList.contains('square')) {
            e.target.classList.remove('pop-out');

            // render
            e.target.append(tile);

            // Add data to square
            game.board[tileInTransit.endLocation].currentTile = tile.dataset.letter;
            game.currentActiveSquares.push(parseInt(tileInTransit.endLocation)); // add to array
    
            game.currentActiveSquares.sort((a, b) => a - b);
        }

        // Handle adding letter to a rack
        if (e.currentTarget.classList.contains('tile-area')) {
            let dropArea = e.target;

            // Allow the drop area to only be a slot
            while (!dropArea.classList.contains('player-rack__slot')) {
                dropArea = dropArea.parentNode;
            }
            
            // Slot is empty
            if (!dropArea.hasChildNodes()) {
                dropArea.append(tile);
            } 

            // Slot already contains a tile, so shift it to the next available empty slot
            else {

                // prev and next of slots on end of rack will default to current drop area
                let tileToMove = dropArea.firstChild;
                let prevSlot = dropArea.previousSibling || dropArea;
                let nextSlot = dropArea.nextSibling || dropArea;

                // Previous slot is empty
                if (!prevSlot.hasChildNodes()) {
                    prevSlot.append(tileToMove);
                    dropArea.append(tile);
                } 
                // Next slot is empty
                else if (!nextSlot.hasChildNodes()) {
                    nextSlot.append(tileToMove);
                    dropArea.append(tile);
                } 
                // Need to swap tiles
                else {
                    swapTiles(tile.parentNode, tileToMove.parentNode)
                }
            }
            
        }

        // Helper
        function swapTiles(slotA, slotB) {
            let tileA = slotA.removeChild(slotA.firstChild);
            let tileB = slotB.removeChild(slotB.firstChild);
            slotA.append(tileB);
            slotB.append(tileA);
        }
  
    },


    onButtonClick(e) {
        if (e.target.id === 'playWordBtn') {
            let word = game.currentActiveSquares.map(i => game.board[i].currentTile).join('');
            if (word.length > 0) {
                game.evaluateWord(word);
            }
        }
    }

}
