// Imbrigliamo il bottone per generare la griglia. Gli mettiamo un event listener.
document.getElementById('start-button').addEventListener('click', prepareGame);

/* Questa funzione prende una stringa ("difficulty") che può essere "easy", "medium", "hard"
e costruisce un div contenente, rispettivamente, 100, 81 o 49 div con una classe pertinente alla difficulty */
function buildGrid(difficulty) {
    // Creiamo un div e gli diamo la classe 'grid-container'
    const thisGrid = document.createElement('div');
    thisGrid.classList.add('grid-container');

    // Convertiamo "difficulty" (che è una stringa) in un valore numerico con uno la nostra funzione dedicata
    let gridSize = difficulty ** 2;

    // Settiamo una variabile con la quantità di bombe che vogliamo generare
    let numberOfBombs = 16;

    // Generiamo un array di bombe appropriato per la dimensione della grid.
    let bombArray = generateUniqueRandomsInRange(numberOfBombs, gridSize);
    console.log(bombArray);

    let recursiveCount = 0;

    let safeCellsClicked = [];

    // In questo loop popoliamo il grid-container di tanti div quanta è la gridSize. Aggiungiamo le classi appropriate.
    for(let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = i;
        newCell.dataset.cellno = i;
        newCell.classList.add('cell');
        newCell.style.width = `calc(100% / ${difficulty})`
        newCell.style.height = `calc(100% / ${difficulty})`

        // Aggiungiamo un eventListener che attiva/disattiva la classe "active" se si clicca sul div
        newCell.addEventListener('click', cellClickHandler);
        newCell.addEventListener('contextmenu', cellRightClick);
        thisGrid.append(newCell);
    }

    // Una volta popolata la griglia, è pronta e la restituiamo
    return thisGrid;

    // HELPER FUNCTIONS. Le creo all'interno di questa funzione così può accedere alla varaibili dichiarate al suo interno.
    function cellClickHandler() {
        let thisCellNumber = parseInt(this.dataset.cellno);

        // Se hai cliccato una bomba
        if(bombArray.includes(thisCellNumber)) {
            this.classList.add("bomb");
            gameEnd(false);
        }

        // Se hai cliccato una cella
        else {
            safeCellsClicked.push(thisCellNumber);
            console.log(`Safe cells clicked: ${safeCellsClicked.length} To win: ${gridSize - numberOfBombs}`);

            if(safeCellsClicked.length >= gridSize - numberOfBombs) {
                gameEnd(true);
            }
        }

        this.removeEventListener('click', cellClickHandler);
    }

    function cellRightClick(event) {
        event.preventDefault();

        if (!this.classList.contains('active')) {
            console.log(event.target);
            
            if (!this.classList.contains('flag')) {
                this.classList.add('flag');
                this.removeEventListener('click', cellClickHandler);
            }
            else {
                this.classList.remove('flag');
                this.addEventListener('click', cellClickHandler);
            }
        }
    }

    /* Questa funzione prende un valore booleano (true === vittoria, false === sconfitta)
    non ritorna niente e manipola il DOM per mostrare la schermata di fine gioco al giocatore */
    function gameEnd(winLose) {
        let result = document.getElementById('result');
        let resultText = "";

        if(winLose) {
            resultText = `Hai vinto!`;

        }
        else {
            resultText = `Hai perso. hai fatto ${safeCellsClicked.length} punti su ${gridSize - numberOfBombs}`
        }

        result.textContent = resultText;
        result.classList.remove('hidden');

        // Disattiviamo gli eventListener su tutte le celle
        cells = document.getElementsByClassName('cell');
    
        for(let i = 0; i < cells.length; i++) {
            cells[i].removeEventListener('click', cellClickHandler);
            cells[i].removeEventListener('contextmenu', cellRightClick);

            // Se abbiamo perso, evidenziamo tutte le bombe
            if(!winLose && bombArray.includes(parseInt(cells[i].dataset.cellno))) {
                cells[i].classList.add('bomb');
                cells[i].classList.remove('flag');
            }
        }
    }

    function countBombsInArray(adjacentList) {
        let sumOfBombs = 0;

        for(let i = 0; i < adjacentList.length; i++) {
            if(bombArray.includes(adjacentList[i])) {
                sumOfBombs++;
            }
        }
        return sumOfBombs;
    }
}

// La funzione chiamata con il click al bottone "start"
function prepareGame() {
    // Leggiamo la difficolta scelta dall'utente (nel select)
    userPickedDifficulty = parseInt(document.getElementById('level').value);

    // Imbrigliamo il container della griglia
    let grid = document.querySelector('.grid-container');

    // Creiamo un nuovo container generandolo con la funzione buildGrid 
    let newGrid = buildGrid(userPickedDifficulty);

    // Sostituiamo il container della griglia con quello generato dalla funzione
    grid.parentNode.replaceChild(newGrid, grid);

    document.getElementById('result').classList.add('hidden');
}

// questa funzione prende due integers (quantity e rangeMax) e restituisce un array contentente "quantity" elementi generati a caso da 1 a "rangemax".
function generateUniqueRandomsInRange(quantity, rangeMax) {
    let uniqueRandoms = [];
    let i = 0;

    while(uniqueRandoms.length < quantity) {
        let thisRandom = Math.floor(Math.random() * rangeMax) + 1;

        if(!uniqueRandoms.includes(thisRandom)) {
            uniqueRandoms.push(thisRandom);
            i++;
        }
    }
    return uniqueRandoms;
}