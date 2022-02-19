import { game } from "./game.js";
import { view } from "./view.js";

export const handle = {

    onDragStart(e) {
        e.dataTransfer.effectAllowed = 'move';

        let tileInTransit = {
            id: e.target.id,
            letter: e.target.dataset.letter,
            startLocation: e.target.parentNode.id || 'player-rack'
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(tileInTransit));

    },
    
    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (e.target.classList.contains('square')) {
            view.focusSquare(e.target);
        }
    },

    onDragLeave(e) {
        e.preventDefault();
        view.removeFocusSquare(e.target);
    },

    onDrop(e) {
        e.preventDefault();

        // Data transfer for drag event
        const tileInTransit = JSON.parse(e.dataTransfer.getData('text/plain'));

        if (e.currentTarget.classList.contains('board')) {
            if (e.target.classList.contains('square')) {

                tileInTransit.endLocation = game.board[Number(e.target.id)];
                view.moveTileToBoard(tileInTransit.id, e.target.id);
            }
        } else {
            tileInTransit.endLocation = 'player-rack';
            view.moveTileToRack(tileInTransit.id, e.target);
        }

        game.transferTile(tileInTransit);      
  
    },










    onButtonClick(e) {

        // Play word
        if (e.target.id === 'playWordBtn') {

            let tileLocations = game.currentActiveSquares;
            let word = tileLocations.map(i => game.board[i].currentTile).join('');

            // Cannot play if word is less than 2 letters
            if (word.length > 1) {
                let isHorizonal = true;
                let isVertical = true;
                let connectedToTiles;

                // Make sure at least 1 of the tiles played is connected to an existing tile
                connectedToTiles = tileLocations.filter(id => game.currentAdjacentSquares.includes(id)).length > 0;
                if (!connectedToTiles) {
                    console.log('You must connect your tiles to the ones on the board!');
                    return;
                }

                // Check horizontal
                for (let i = 1; i < tileLocations.length; i++) {
                    let indexDiff = tileLocations[i] - tileLocations[i - 1];
                    if (indexDiff !== 1) {
                        isHorizonal = false;
                        break;
                    }
                }

                // Check vertical
                for (let i = 1; i < tileLocations.length; i++) {
                    let indexDiff = tileLocations[i] - tileLocations[i - 1];
                    if (indexDiff !== 15) {
                        isVertical = false;
                        break;
                    }
                }


                if (isHorizonal || isVertical) {
                    if (game.evaluateWord(word)) {
                        game.updateAdjacentSquares(tileLocations);
                    }
                } else {
                    console.log('Invalid tile placement');
                }

            }
        }



        // Shuffle tiles





        // Exchange tiles
    }

}
