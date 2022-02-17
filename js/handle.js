import { game } from "./game.js";

export const handle = {
    dragstart(e) {
        e.dataTransfer.effectAllowed = 'move';

        // Use an object to store the id, startLocation, and endLocation of the selected tile
        let selectedTile = {
            id: e.target.id,
            startLocation: e.target.parentNode.id || 'player-rack'
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(selectedTile));

        console.log('Picked up tile from: ', selectedTile.startLocation);
    },
    
    ondragover(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        // Add effect to board squares when hovering over with tile
        if (e.target.classList.contains('square')) {
            e.target.classList.add('pop-out');
        }
    },

    ondragleave(e) {
        e.preventDefault();
        // Remove square highlighting effect
        e.target.classList.remove('pop-out');
    },

    ondrop(e) {
        e.preventDefault();

        // Update selectedTile object with endLocation
        const selectedTile = JSON.parse(e.dataTransfer.getData('text/plain'));
        selectedTile.endLocation = e.target.id || 'player-rack';
        
        // Get the tile element
        const tile = document.getElementById(selectedTile.id);

        // Add letter data to square
        if (e.target.classList.contains('square')) {
            e.target.classList.remove('pop-out');
            let letter = tile.querySelector('.tile__letter').innerHTML;
            e.target.setAttribute('data-letter', letter);
            // Place tile 
            e.target.append(tile);
        }

        // Add letter to player rack
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

}
