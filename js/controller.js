import { Game } from "./Game.js";
import { View } from "./View.js";
import * as config from "./gameConfig.js";


export class Controller {
    constructor() {
        this.game = new Game(config);
        this.view = new View();

        // Add event handlers
        this.view.startGameEvent.addHandler((numPlayers, playerData) => this.onStartGameClick(numPlayers, playerData));

        this.view.tilePickedUpEvent.addHandler(tileID => this.onTilePickUp(tileID));
        this.view.tileDropBoardEvent.addHandler(boardID => this.onTileDropSquare(boardID))
        this.view.tileDropRackEvent.addHandler(() => this.onTileDropRack());
        this.view.tileRecallEvent.addHandler(() => this.onTileRecall());
        this.view.tileExchangeEvent.addHandler(() => this.onTileExchange());

        this.view.wordPlayedEvent.addHandler(() => this.onWordPlayed());
        this.view.passTurnEvent.addHandler(() => this.onPassTurn());
        this.view.forfeitEvent.addHandler(() => this.onForfeit());
    }

    init() {
        // render page
        this.view.renderBoard(this.game.board.squares);
    }

    // Handlers
    onStartGameClick(numPlayers, playerData) {

        // add players to game data
        playerData.forEach(player => this.game.addPlayer(player.name));

        // render player racks
        this.game.players.forEach((player, id) => {
            this.view.renderRack(player.tilesOnRack)
        });

        // start game
        this.game.start()
        this.view.setActivePlayer(this.game.whosTurn);
        this.view.updateTileCount(this.game.letterBag.tiles.length);
        this.view.renderPlayerCards(playerData);
        this.view.showGameWindow();
    }

    onTilePickUp(tileID) {
        const player = this.game.getCurrentPlayer();
        const tiles = [...player.tilesOnBoard, ...player.tilesOnRack];
        const tile = tiles.find(tile => tile.id === tileID);

        this.game.setActiveTile(tile);
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

            // display temporary notification
            this.view.showNotification(`You must connect your tiles to the ones on the board!`);
            setTimeout(() => this.view.hideNotification(), 2500);
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

            // display temporary notification
            this.view.showNotification(`Invalid tile placement`);
            setTimeout(() => this.view.hideNotification(), 2000);
            return;
        }

        // Check each word in play and determine points
        if (wordsInPlay.length > 0) {
            
            wordsInPlay.forEach(wordObj => {
                let currentWord = wordObj.letters.join('');

                if (this.isValidWord(wordObj)) {
                    let currentWordPoints = this.scoreWord(wordObj);
                    if (playedSquares.length === 7) currentWordPoints += 50;        // 7 tile bonus
                    wordCache[currentWord] = currentWordPoints;
                } else { 
                    console.log(`${currentWord.toUpperCase()} is not a word`);

                    validPlay = false; 

                    // display temporary notification
                    this.view.showNotification(`${currentWord.toUpperCase()} is not a word`);
                    setTimeout(() => this.view.hideNotification(), 2000);
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
            let tileToRecall = player.tilesOnBoard.find(tile => tile.location === boardID);
            
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

    onTileExchange() {
        let player = this.game.getCurrentPlayer();

        // recall any tiles on the board first
        this.view.tileRecallEvent.trigger();

        // pop tiles off into letterbag
        while (player.tilesOnRack.length > 0) {
            let tile = player.tilesOnRack.pop()
            tile.location = null;   // clear location property
            this.game.letterBag.tiles.push(tile);
        }

        this.view.clearTiles();
        
        // get new tiles
        this.refillRack();

          // end turn
        this.view.showNotification(`${player.name} exchanged their tiles`);
        setTimeout(() => this.view.hideNotification(), 1500);
        this.view.passTurnEvent.trigger();
    }

    onPassTurn() {
        // recall any tiles on the board first
        this.view.tileRecallEvent.trigger();
        this.view.showNotification(`${this.game.getCurrentPlayer().name} passed`);
        setTimeout(() => this.view.hideNotification(), 1500);
        this.game.nextPlayer();
        this.view.setActivePlayer(this.game.whosTurn);
    }

    onForfeit() {
        this.view.tileRecallEvent.trigger();
        this.view.showNotification(`${this.game.getCurrentPlayer().name} forfeits!`);
        setTimeout(() => this.view.hideNotification(), 1500);
        this.view.deactivatePlayer(this.game.whosTurn);
        this.game.forfeitPlayer(this.game.whosTurn);


        let playersLeft = this.game.players.filter(player => player.isPlaying).length;

        if (playersLeft === 1) {
            this.endGame(playersLeft[0]);
        } else {
            this.switchPlayer();
        }


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

    refillRack() {
        let player = this.game.getCurrentPlayer();
        let tilesNeeded = 7 - player.tilesOnRack.length;
        
        for (let i = 0; i < tilesNeeded; i++) {
            let tileObj = this.game.letterBag.getRandomTile();      // returns false if no more letters in bag
            if (tileObj) {
                player.addNewTile(tileObj)
                const {id, letter, points} = tileObj;
                this.view.addTileToRack(id, letter, points);
            }
        }

        this.view.updateTileCount(this.game.letterBag.tiles.length);
    }

    switchPlayer() {
        this.game.nextPlayer();
        this.view.setActivePlayer(this.game.whosTurn);
    }

    endTurn() {
        // lock tiles in place
        this.game.board.currentPlayedSquares.forEach(id => this.view.freezeTile(id));
        this.view.updatePlayerStats(this.game.whosTurn,
                                    this.game.getCurrentPlayer().score,
                                    this.game.getCurrentPlayer().bestWord);

        // update board data
        this.game.board.updateAdjacentSquares();
        this.game.board.currentPlayedSquares = [];

        // refill player rack 
        this.refillRack();

        // check for end of game
        if (this.game.getCurrentPlayer().tilesOnRack.length === 0) {
            this.endGame(this.game.getCurrentPlayer());
        } else {
            this.switchPlayer();
        }
    }

    determineWinner() {
        // What if tie?
        let winner = this.game.players.reduce((prev, cur) => {
            if (cur.isPlaying) {
                return cur.score > prev.score ? cur : prev;
            }
        });

        return winner;
    }

    endGame(endPlayer) {
        console.log('GAME OVER')

        let playersLeft = this.game.players.filter(player => player.isPlaying);

        this.game.playing = false;
        this.view.disableButtons();
        let winner;

        if (playersLeft.length === 1) {
            winner = playersLeft[0];
        } else {
            // Count bonus points from other players tiles
            let bonusPoints = 0;
            this.game.players.forEach(player => {
                // player.isPlaying = false;
                player.tilesOnRack.forEach(tile => bonusPoints += tile.points);
            });
            console.log(`${endPlayer.name} gets ${bonusPoints} bonus points!`);

            // Add bonus points to player who ended game
            endPlayer.score += bonusPoints;
            this.view.updatePlayerStats(this.game.whosTurn, endPlayer.score, endPlayer.bestWord);        

            // Determine winner
            winner = this.determineWinner();
        }

        this.view.hideTileRack();
        this.view.setActivePlayer(this.game.players.indexOf(winner));
        setTimeout(this.view.showNotification(`${winner.name.toUpperCase()} wins!`), 3000);
    }

}
