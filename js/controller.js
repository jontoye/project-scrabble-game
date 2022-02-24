import { Game } from "./Game.js";
import { View } from "./View.js";
import * as config from "./gameConfig.js";

export class Controller {
    constructor() {
        this.game = new Game(config);
        this.view = new View();

        // Tile Events
        this.view.tilePickedUpEvent.addHandler(tileID => this.onTilePickUp(tileID));
        this.view.tileDropBoardEvent.addHandler(boardID => this.onTileDropSquare(boardID))
        this.view.tileDropRackEvent.addHandler(() => this.onTileDropRack());
        this.view.tileHoverEvent.addHandler( e => this.onTileOverRack(e));

        // Button Events
        this.view.wordPlayedEvent.addHandler(() => this.onWordPlayed());

        // Recall tiles
        this.view.tileRecallEvent.addHandler(() => this.onTileRecall());

        // Pass turn
        this.view.passTurnEvent.addHandler(() => this.onPassTurn());
    }

    init() {
        // simulate adding players
        this.game.addPlayer('Player 1');
        this.game.addPlayer('Player 2');
        this.game.addPlayer('Player 3');
        this.game.addPlayer('Player 4');

        // render page
        this.view.renderBoard(this.game.board.squares);
        this.game.players.forEach((player, id) => {
            this.view.renderRack(player.tilesOnRack)
        });

        // start game
        this.game.start();
        this.startNewTurn();
    }


    // Handlers

    onTilePickUp(tileID) {
        const player = this.game.getCurrentPlayer();
        const tiles = [...player.tilesOnBoard, ...player.tilesOnRack];
        const tile = tiles.find(tile => tile.id === tileID);

        this.game.setActiveTile(tile);
    }

    onTileOverRack(e) {

    }

    onTileDropRack() {
        const tile = this.game.getActiveTile();
        const prevLoc = tile.location;
        const player = this.game.getCurrentPlayer();
        const board = this.game.board.squares;

        // don't drop if rack is full
        if (player.tilesOnRack.length < 7) {
            if (prevLoc === 'rack') {
                // shift tiles here
                // no data to update
            } else {
                // move tile object
                player.tilesOnRack.push(player.tilesOnBoard.splice(player.tilesOnBoard.findIndex(t => t === tile), 1)[0]);

                // update tile and board data
                tile.location = 'rack';
                board[prevLoc].currentTile = null;
                this.game.board.removePlayedSquare(prevLoc)

                // update view
                this.view.moveTileToRack(this.game.whosTurn);

                // reset active tile
                this.game.setActiveTile(null);
            }
        }
    }

    onTileDropSquare(boardID) {
        const tile = this.game.getActiveTile();
        const prevLoc = tile.location;
        const player = this.game.getCurrentPlayer();
        const board = this.game.board.squares;

        if (!board[boardID].currentTile) {
            
            if (prevLoc === 'rack') {
                // move tile object
                player.tilesOnBoard.push(player.tilesOnRack.splice(player.tilesOnRack.findIndex(t => t === tile), 1)[0]);
            } else {
                // clear previous board data first
                board[prevLoc].currentTile = null;
                this.game.board.removePlayedSquare(prevLoc);
                // tile.location = Number(boardID);
            }
            
            // update tile and board data
            tile.location = Number(boardID);
            board[boardID].currentTile = tile.letter;
            this.game.board.addPlayedSquare(Number(boardID));

            // update view
            this.view.moveTileToBoard(tile.id, boardID);

            // reset active tile
            this.game.setActiveTile(null);
        }
    }

    onWordPlayed() {

        const currentPlayer = this.game.getCurrentPlayer();
        const playedSquares = this.game.board.currentPlayedSquares;
        const wordCache = {};   // for storing valid words and their point score
        let connectedToTiles;
        let wordsInPlay = [];
        let validPlay = true;
        let isHorizontal = true;
        let isVertical = true;

        // check that at least 1 played tile is connected to an existing tile
        connectedToTiles = playedSquares.filter(id => this.game.board.currentAdjacentSquares.includes(id)).length > 0;
        if (!connectedToTiles) {
            console.log('You must connect your tiles to the ones on the board!');
            return;
        }

        // check if tiles were placed horizontally
        for (let i = 0; i < playedSquares.length - 1; i++) {
            if (this.game.board.squares[playedSquares[i]].row !== this.game.board.squares[playedSquares[i + 1]].row ||   // tiles are not in came row OR
                !this.game.board.squares[playedSquares[i] + 1].currentTile) {                               // adjacent square is empty
                isHorizontal = false;
                break;
            }
        }

        // check if tiles were placed vertically
        for (let i = 0; i < playedSquares.length - 1; i++) {
            if (this.game.board.squares[playedSquares[i]].col !== this.game.board.squares[playedSquares[i + 1]].col ||   // tiles are not in same col OR
                !this.game.board.squares[playedSquares[i] + 15].currentTile) {                              // adjacent square is empty
                isVertical = false;
                break;
            }
        }

        // Only one tile was placed
        if (playedSquares.length === 1) {
            let horizontalLetters = this.game.board.getAdjacentHorizontalLetters(playedSquares[0])
            let verticalLetters = this.game.board.getAdjacentVerticalLetters(playedSquares[0]);
            if (horizontalLetters) { wordsInPlay.push(horizontalLetters); }
            if (verticalLetters) { wordsInPlay.push(verticalLetters); }
        }

        // Tiles placed horiztonally
        else if (isHorizontal) {
            wordsInPlay.push(this.game.board.getAdjacentHorizontalLetters(playedSquares[0]));
            playedSquares.forEach(square => {
                let adjacentTiles = this.game.board.getAdjacentVerticalLetters(square);
                if (adjacentTiles) { wordsInPlay.push(adjacentTiles); }
            });
        }

        // Tiles placed vertically
        else if (isVertical) {
            wordsInPlay.push(this.game.board.getAdjacentVerticalLetters(playedSquares[0]));
            playedSquares.forEach(square => {
                let adjacentTiles = this.game.board.getAdjacentHorizontalLetters(square);
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

                if (this.isValidWord(wordObj)) {
                    let currentWordPoints = this.scoreWord(wordObj);
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
            this.endTurn();
        }
    }

    onShuffleTiles() {
        this.view.shuffleTiles(this.game.whosTurn);
        this.switchPlayer();
    }

    onTileRecall() {
        const player = this.game.getCurrentPlayer();

        this.game.board.currentPlayedSquares.forEach(boardID => {
            let tileToRecall = player.tilesOnBoard.find(tile => tile.location = boardID);
            
            // move tile object
            player.tilesOnRack.push(player.tilesOnBoard.splice(player.tilesOnBoard.findIndex(t => t === tileToRecall), 1)[0]);

            // // update view
            this.view.recallTileToRack(this.game.whosTurn, tileToRecall.id);

            // // update tile and board data
            tileToRecall.location = 'rack';
            this.game.board.squares[boardID].currentTile = null;
        })

        // Clear current played scores
        this.game.board.currentPlayedSquares = [];
    }

    onExchangeTiles() {
        this.view.exchangeTiles(this.game.whosTurn);
    }

    onPassTurn() {
        this.view.tileRecallEvent.trigger();
        this.game.nextPlayer();
        this.view.setActivePlayer(this.game.whosTurn);
    }

    onForfeit() {

    }

    startNewTurn() {
        this.view.setActivePlayer(this.game.whosTurn);
    }

    isValidWord(wordObj) {
        return config.VALID_WORDS[wordObj.letters.join('')];
    }

    scoreWord(wordObj) {
        const { letters: lettersToScore , loc: boardIDs } = wordObj;
        let points = 0;
        let wordMultiplier = 1;

        lettersToScore.forEach((letter, i) => {
            let currentID = boardIDs[i];
            let letterMultiplier = 1;

            // If player placed a tile on a bonus square, use multipliers
            if (this.game.board.currentPlayedSquares.includes(currentID)) {

                // set multiplier values
                if (this.game.board.squares[currentID].type === 'dl') {
                    letterMultiplier = 2;
                } else if (this.game.board.squares[currentID].type === 'dw') {
                    wordMultiplier = 2;
                } else if (this.game.board.squares[currentID].type === 'tl') {
                    letterMultiplier = 3;
                } else if (this.game.board.squares[currentID].type === 'tw') {
                    wordMultiplier = 3;
                } 
            }
            points += (config.LETTER_BAG[letter].points) * (letterMultiplier);
        });
        points *= wordMultiplier;
        return points;
    }

    refillRack(playerID) {
        let tilesNeeded = 7 - this.game.players[playerID].tilesOnRack.length;
        
        for (let i = 0; i < tilesNeeded; i++) {
            let tileObj = this.game.letterBag.getRandomTile();
            this.game.players[playerID].addNewTile(tileObj)

            const {id, letter, points} = tileObj;
            this.view.addTileToRack(id, letter, points);
        }
    }

    switchPlayer() {
        this.game.nextPlayer();
        this.view.setActivePlayer(this.game.whosTurn);
    }

    endTurn() {
        // lock tiles in place
        this.game.board.currentPlayedSquares.forEach(id => this.view.freezeTile(id));
        this.view.renderPlayerStats(this.game.whosTurn,
                                    this.game.getCurrentPlayer().score,
                                    this.game.getCurrentPlayer().bestWord);

        this.game.board.updateAdjacentSquares();
        this.game.board.currentPlayedSquares = [];

        // refill player rack and switch players
        this.refillRack(this.game.whosTurn);
        this.switchPlayer();
    }
    
}
