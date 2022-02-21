import { game } from "./game.js";
import { view } from "./view.js";
import { controller } from "./controller.js";

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
            if (!e.target.classList.contains('square')) { return; }
            tileInTransit.endLocation = game.board[Number(e.target.id)];
            view.moveTileToBoard(tileInTransit.id, e.target.id);
        } else {
            tileInTransit.endLocation = 'player-rack';
            view.moveTileToRack(tileInTransit.id, e.target);
        }
        game.transferTile(tileInTransit);      
    },

    onButtonClick(e) {

        // Play word button
        if (e.target.id === 'playWordBtn') {
            
            const currentPlayer = game.players[game.whosTurn];
            const playedSquares = game.currentPlayedSquares;
            const wordCache = {};   // for storing valid words and their point score
            let connectedToTiles;
            let wordsInPlay = [];
            let validPlay = true;
            let isHorizontal = true;
            let isVertical = true;

            // check that at least 1 played tile is connected to an existing tile
            connectedToTiles = game.currentPlayedSquares.filter(id => game.currentAdjacentSquares.includes(id)).length > 0;
            if (!connectedToTiles) {
                console.log('You must connect your tiles to the ones on the board!');
                return;
            }

            // check if tiles were placed horizontally
            for (let i = 0; i < playedSquares.length - 1; i++) {
                if (game.board[playedSquares[i]].row !== game.board[playedSquares[i + 1]].row ||   // tiles are not in came row OR
                    !game.board[playedSquares[i] + 1].currentTile) {                               // adjacent square is empty
                    isHorizontal = false;
                    break;
                }
            }

            // check if tiles were placed vertically
            for (let i = 0; i < playedSquares.length - 1; i++) {
                if (game.board[playedSquares[i]].col !== game.board[playedSquares[i + 1]].col ||   // tiles are not in same col OR
                    !game.board[playedSquares[i] + 15].currentTile) {                              // adjacent square is empty
                    isVertical = false;
                    break;
                }
            }

            // Only one tile was placed
            if (playedSquares.length === 1) {
                let horizontalLetters = game.getAdjacentHorizontalLetters(playedSquares[0])
                let verticalLetters = game.getAdjacentVerticalLetters(playedSquares[0]);
                if (horizontalLetters) { wordsInPlay.push(horizontalLetters); }
                if (verticalLetters) { wordsInPlay.push(verticalLetters); }
            }

            // Tiles placed horiztonally
            else if (isHorizontal) {
                wordsInPlay.push(game.getAdjacentHorizontalLetters(playedSquares[0]));
                playedSquares.forEach(square => {
                    let adjacentTiles = game.getAdjacentVerticalLetters(square);
                    if (adjacentTiles) { wordsInPlay.push(adjacentTiles); }
                });
            }

            // Tiles placed vertically
            else if (isVertical) {
                wordsInPlay.push(game.getAdjacentVerticalLetters(playedSquares[0]));
                playedSquares.forEach(square => {
                    let adjacentTiles = game.getAdjacentHorizontalLetters(square);
                    if (adjacentTiles) { wordsInPlay.push(adjacentTiles); }
                });
            }

            // Invalid tile placement
            else {
                console.log('Invalid tile placement');
                return;
            }
            
            // Check each word in play and determine points
            if (wordsInPlay.length > 0) {
                
                wordsInPlay.forEach(wordObj => {
                    let currentWord = wordObj.letters.join('');

                    if (game.isValidWord(wordObj)) {
                        let currentWordPoints = game.scoreWord(wordObj);
                        wordCache[currentWord] = currentWordPoints;
                    } else { 
                        console.log(`${currentWord} is not a word`);
                        validPlay = false; 
                    }
                })
            } else { validPlay = false; }
    
            // Update player score and end turn
            if (validPlay) {
                for (let word in wordCache) {
                    if (wordCache[word] >= currentPlayer.bestWord.points) {
                        currentPlayer.bestWord.word = word;
                        currentPlayer.bestWord.points = wordCache[word];
                    }
                    currentPlayer.score += wordCache[word];
                    console.log(`${currentPlayer.name} scored ${wordCache[word]} points for ${word}`);
                }

                console.log('Total points for', currentPlayer.name, ': ', currentPlayer.score);
                controller.endTurn();
            }
        }





            
        



        // Shuffle tiles





        // Exchange tiles
    }

}
