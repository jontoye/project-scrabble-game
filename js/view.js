import { Event } from "./Event.js";

export class View {
    constructor() {
        // DOM Elements
        this.boardEl = document.querySelector('.board');
        this.tileArea = document.querySelector('.tile-area');
        this.statsArea = document.querySelector('.stats-area');
        this.playerCards = document.querySelectorAll('.player-card');
        this.scores = document.querySelectorAll('.player-card__score > span');
        this.bestWord = document.querySelectorAll('.player-card__best-word > span');
        this.racks = [];

        this.playBtn = document.getElementById('playBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.recallBtn = document.getElementById('recallBtn');
        this.exchangeBtn = document.getElementById('exchangeBtn');
        this.passBtn = document.getElementById('passBtn');
        this.forfeitBtn = document.getElementById('forfeitBtn');

        // Tile Events
        this.tilePickedUpEvent = new Event();
        this.tileDropBoardEvent = new Event();
        this.tileDropRackEvent = new Event();
        this.tileHoverEvent = new Event();

        // Button Events
        this.wordPlayedEvent = new Event();
        this.tileRecallEvent = new Event();
        this.exchangeEvent = new Event();
        this.passTurnEvent = new Event();
        this.forfeitEvent = new Event();

        // Add event listeners
        this.playBtn.addEventListener('click', () => this.wordPlayedEvent.trigger());
        this.passBtn.addEventListener('click', () => this.passTurnEvent.trigger());
        this.recallBtn.addEventListener('click', () => this.tileRecallEvent.trigger());
        this.shuffleBtn.addEventListener('click', () => this.shuffleTiles());
    }

    // Initialize board
    renderBoard(boardSquares) {
        boardSquares.forEach(squareObj => {
            const squareEl = this.createSquareElement(squareObj.row, squareObj.col, squareObj.type);
            this.boardEl.append(squareEl);
        })    
    }

    // Initialize player rack
    renderRack(tiles) {
        const rackEl = this.createElement('div', 'player-rack', 'hidden'); 
        // let playerRack = this.createElement('div', 'player-rack');  // FOR TESTING --> doesnt hide racks

        // add event listeners
        rackEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.tileHoverEvent.trigger(e)
            // this.shiftTiles(e);
        });
        rackEl.addEventListener('drop', (e) => {
            this.tileDropRackEvent.trigger();
        });

        tiles.forEach(tile => {
            const tileEl = this.createTileElement(tile.id, tile.letter, tile.points);
            rackEl.append(tileEl);
        });
        this.tileArea.append(rackEl);
        this.racks.push(rackEl);

    }

    // Update stats view
    renderPlayerStats(playerID, score, best) {
        this.playerCards.forEach(card => card.classList.remove('active'));
        this.playerCards[playerID].classList.add('active');
        this.scores[playerID].innerText = score;
        this.bestWord[playerID].innerText = best.word + '(' + best.points + 'pts)';
    }

    setActivePlayer(id) {
        this.playerCards.forEach(card => card.classList.remove('active'));
        this.playerCards[id].classList.add('active');
        let rackEls = this.tileArea.querySelectorAll('.player-rack');
        rackEls.forEach(rack => rack.classList.add('hidden'));
        rackEls[id].classList.remove('hidden');        
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
        const tile = document.getElementById(tileID);
        this.racks[playerID].append(tile);
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

    addTileToRack(id, letter, points) {
        let tileEl = this.createTileElement(id, letter, points);
        let rackEl = document.querySelector('.player-rack:not(.hidden)')
        rackEl.append(tileEl);
    }

    freezeTile(squareID) {
        let square = document.getElementById(squareID);
        let tile = square.querySelector('.tile');
        tile.removeAttribute('draggable');
    }

    shuffleTiles() {
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

    /**********************   Board updates  **************************/ 
    focusSquare(id) {
        document.getElementById(id).classList.add('pop-out');
    }

    removeFocusSquare(id) {
        document.getElementById(id).classList.remove('pop-out');
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
        squareEl.addEventListener('drop', () => this.tileDropBoardEvent.trigger(squareEl.id));

        return squareEl;
    }
}