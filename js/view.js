import { Event } from "./Event.js";

export class View {
    constructor() {
        // DOM Elements
        this.boardEl = document.querySelector('.board');
        this.tileArea = document.querySelector('.tile-area');
        this.playerCards = document.querySelectorAll('.player-card');
        this.names = document.querySelectorAll('.player-card__name');
        this.scores = document.querySelectorAll('.player-card__score');
        this.bestWord = document.querySelectorAll('.player-card__best-word');
        this.imgs = document.querySelectorAll('.player-card__img img');
        this.racks = [];

        this.startBtn = document.getElementById('startGame');
        this.playBtn = document.getElementById('playBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.recallBtn = document.getElementById('recallBtn');
        this.exchangeBtn = document.getElementById('exchangeBtn');
        this.passBtn = document.getElementById('passBtn');
        this.forfeitBtn = document.getElementById('forfeitBtn');

        this.notificationEl = document.querySelector('.notification');
        this.tileCountEl = document.getElementById('tileCount');

        this.introPageEl = document.querySelector('.intro-page');
        this.mainPageEl = document.querySelector('.main-page');
        this.gameSetupEl = document.querySelector('.game-setup');
        this.numPlayersInput = document.getElementById('numPlayers');
        this.playerInputsEl = document.querySelectorAll('.player-input');
        this.playerIcons = document.querySelectorAll('.player-icons img');
        this.wordListEl = document.querySelector('.wordList');
        this.wordListWordEl = document.querySelector('.wordList .word');
        this.wordListScoreEl = document.querySelector('.wordList .score');
        
        // Tile Events
        this.tilePickedUpEvent = new Event();
        this.tileDropBoardEvent = new Event();
        this.tileDropRackEvent = new Event();
        this.tileHoverEvent = new Event();
        
        // Button Events
        this.wordPlayedEvent = new Event();
        this.passTurnEvent = new Event();
        this.tileRecallEvent = new Event();
        this.tileExchangeEvent = new Event();
        this.forfeitEvent = new Event();
        this.startGameEvent = new Event();
        
        // Add event listeners
        this.playBtn.addEventListener('click', () => this.wordPlayedEvent.trigger());
        this.passBtn.addEventListener('click', () => this.passTurnEvent.trigger());
        this.recallBtn.addEventListener('click', () => this.tileRecallEvent.trigger());
        this.shuffleBtn.addEventListener('click', () => this.shuffleTiles());
        this.exchangeBtn.addEventListener('click', () => this.tileExchangeEvent.trigger());
        this.forfeitBtn.addEventListener('click', () => this.forfeitEvent.trigger());
        this.startBtn.addEventListener('click', () => this.collectPlayerData());
        this.numPlayersInput.addEventListener('input', e => this.renderPlayerInputElements(Number(e.target.value)));
        this.playerIcons.forEach(icon => icon.addEventListener('click', e => this.focusIcon(e)));

        // Audio
        this.whooshSound = new Audio('./audio/whoosh.flac');
    }

    // Initialize board
    renderBoard(boardSquares) {
        boardSquares.forEach(squareObj => {
            const squareEl = this.createSquareElement(squareObj.row, squareObj.col, squareObj.type);
            this.boardEl.append(squareEl);
        });
    }

    // Initialize player rack
    renderRack(tiles) {
        const rackEl = this.createElement('div', 'player-rack', 'hidden'); 

        // add event listeners
        rackEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.shiftTiles(e);
        });
        rackEl.addEventListener('drop', (e) => {
            e.preventDefault();
            this.tileDropRackEvent.trigger();
        });

        tiles.forEach(tile => {
            const tileEl = this.createTileElement(tile.id, tile.letter, tile.points);
            rackEl.append(tileEl);
        });
        this.tileArea.append(rackEl);
        this.racks.push(rackEl);
    }

    renderPlayerInputElements(numPlayers) {
        this.playerInputsEl.forEach((player, i) => {
            player.classList.add('hidden');
            if (i < numPlayers) {
                player.classList.remove('hidden');
            }
        })
    }

    // Collect player data from intro-page
    collectPlayerData() {
        let numPlayers = Number(this.numPlayersInput.value);
        let playerData = [];

        for (let i = 0; i < numPlayers; i++) {
            let playerNameEl = document.querySelector(`#player${i}`)
            let name = playerNameEl.value
            let img = this.playerInputsEl[i].querySelector('img[class="active"');

            playerData.push({
                name: name || `Player ${i + 1}`,
                img: img ? img.src : ''
            });
        }

        this.startGameEvent.trigger(numPlayers, playerData);
    }

    setActivePlayer(id) {
        this.playerCards.forEach(card => card.classList.remove('active'));
        this.playerCards[id].classList.add('active');
        let rackEls = this.tileArea.querySelectorAll('.player-rack');
        rackEls.forEach(rack => rack.classList.add('hidden'));
        rackEls[id].classList.remove('hidden');        
    }

    focusIcon(e) {
        Array.from(e.target.parentNode.children).forEach(icon => icon.classList.remove('active'));
        e.target.classList.add('active');
    }

    showGameWindow() {
        this.introPageEl.classList.add('hidden');
        this.mainPageEl.classList.remove('hidden');
    }

    /**********************   Tile updates  **************************/ 
    moveTileToBoard(tileID, squareID) {
        let tileEl = document.getElementById(tileID);
        let squareEl = document.getElementById(squareID);

        squareEl.append(tileEl);
        tileEl.classList.remove('dragging')
        this.removeFocusSquare(squareEl.id);
    }

    moveTileToRack(playerID) {
        const currentTile = document.querySelector('.dragging');
        this.racks[playerID].append(currentTile);
        currentTile.classList.remove('dragging');
    }

    recallTileToRack(playerID, tileID) {
        this.whooshSound.play();
        const tile = document.getElementById(tileID);
        this.racks[playerID].append(tile);
    }

    addTileToRack(id, letter, points) {
        let tileEl = this.createTileElement(id, letter, points);
        let rackEl = document.querySelector('.player-rack:not(.hidden)')
        rackEl.append(tileEl);
    }

    shiftTiles(e) {
        let rect = e.target.getBoundingClientRect();
        let offset = e.clientX - ((rect.left + rect.right) / 2);
        let tileToMove = e.target.closest('.tile');
        if (tileToMove) {
            let tileToInsert = document.querySelector('.dragging');
            if (offset < 0) {
                tileToMove.parentNode.insertBefore(tileToInsert, tileToMove);
            } else {
                tileToMove.parentNode.insertBefore(tileToInsert, tileToMove.nextSibling);
            }
        }
    }

    clearTiles() {
        let rackEl = document.querySelector('.player-rack:not(.hidden');

        while (rackEl.hasChildNodes()) {
            rackEl.removeChild(rackEl.lastChild);
        }
    }

    freezeTile(squareID) {
        let square = document.getElementById(squareID);
        let tile = square.querySelector('.tile');
        tile.removeAttribute('draggable');
    }

    shuffleTiles() {
        this.whooshSound.play();
        const playerRack = this.tileArea.querySelector('.player-rack:not(.hidden)');
        let tileArray = Array.from(playerRack.querySelectorAll('.tile'));
        let m = tileArray.length, temp, i;

        while (m > 0) {
            i = Math.floor(Math.random() * m);
            m--;
            temp = tileArray[m];
            tileArray[m] = tileArray[i];
            tileArray[i] = temp;
        }
        
        tileArray.forEach(tile => playerRack.append(tile));
    }

    hideTileRack() {
        this.tileArea.classList.add('hidden')
    }

    /**********************   Board and stats updates  **************************/ 
    renderPlayerCards(playerData) {
        playerData.forEach((player, i) => {
            this.imgs[i].src = player.img;
            this.names[i].innerText = player.name;
            this.playerCards[i].classList.remove('hidden');
        })
    }

    updatePlayerStats(playerID, score, best) {
        this.playerCards.forEach(card => card.classList.remove('active'));
        this.playerCards[playerID].classList.add('active');
        this.scores[playerID].innerText = score;
        this.bestWord[playerID].innerText = `${best.word} (${best.points}pts)`;
    }

    updateTileCount(tilesLeft) {
        this.tileCountEl.innerText = `Tiles Left: ${tilesLeft}`;
    }

    deactivatePlayer(playerID) {
        this.clearTiles();
        this.playerCards[playerID].classList.add('forfeit');
    }

    focusSquare(id) {
        document.getElementById(id).classList.add('pop-out');
    }

    removeFocusSquare(id) {
        document.getElementById(id).classList.remove('pop-out');
    }

    disableButtons() {
        document.querySelectorAll('button').forEach(btn => btn.setAttribute('disabled', ''));
    }

    showNotification(msg) {
        this.notificationEl.innerText = msg;
        this.notificationEl.classList.remove('hidden');
    }

    hideNotification() {
        this.notificationEl.classList.add('hidden');
    }

    updateWordList(word, points) {
        let itemWord = this.createElement('li')
        let itemScore = this.createElement('li')
        itemWord.innerText = word;
        itemScore.innerText = points;
        this.wordListWordEl.append(itemWord);
        this.wordListScoreEl.append(itemScore);
        this.wordListEl.scrollTo(0, this.wordListEl.scrollHeight);

        // this.wordListEl.value += `${word.padEnd(12, ' ')} ${points}\n`;
    }

    /**********************   Create elements  *********************/ 
    createElement(tag, ...classNames) {
        const element = document.createElement(tag);
        classNames.forEach(name => element.classList.add(name));
        return element;
    }

    createTileElement(id, letter, points) {
        const tileEl = this.createElement('div', 'tile');
        tileEl.id = id;
        tileEl.setAttribute('data-letter', letter);
        tileEl.setAttribute('data-points', points);
        tileEl.setAttribute('draggable', 'true');
        tileEl.innerHTML = `
        <div class="tile__letter">${letter}</div>
        <div class="tile__point-value">${points}</div>`;
        
        tileEl.addEventListener('dragstart', (e) => {
            tileEl.classList.add('dragging');
            this.tilePickedUpEvent.trigger(tileEl.id);
        });
        tileEl.addEventListener('dragend', () => tileEl.classList.remove('dragging'));

        return tileEl;
    }

    createSquareElement(row, col, type) {
        const squareEl = this.createElement('div', 'square');
        squareEl.id = row * 15 + col;

        // For special squares
        if (type) {
            squareEl.classList.add(`square--${type}`);
            squareEl.setAttribute('data-type', type)
            squareEl.innerHTML = type;
        }

        // Add event listeners
        squareEl.addEventListener('dragover', (e) => {
            e.preventDefault();

            // only focus empty squares
            if (squareEl.children.length === 0) {
                this.focusSquare(squareEl.id)
            }
        });
        squareEl.addEventListener('dragleave', () => this.removeFocusSquare(squareEl.id));
        squareEl.addEventListener('drop', (e) => {
            e.preventDefault();
            this.tileDropBoardEvent.trigger(squareEl.id)
        });

        return squareEl;
    }
}