// Imbrigliamo il bottone per generare la griglia. Gli mettiamo un event listener.
document.getElementById('start-button').addEventListener('click', prepareGame);

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

    let safeCellsClicked = [];

    let recursiveCount = 0;

    // In questo loop popoliamo il grid-container di tanti div quanta è la gridSize. Aggiungiamo le classi appropriate.
    for(let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = `<span></span>`;
        //invece di popolare l'InnerHTML dell'elemento, popolo l'attributo HTML data-cellno del div della cella.
        newCell.dataset.cellno = i;
        newCell.classList.add('cell');
        newCell.style.width = `calc(100% / ${difficulty})`
        newCell.style.height = `calc(100% / ${difficulty})`

        // Aggiungiamo un eventListener che attiva/disattiva la classe "active" se si clicca sul div
        newCell.addEventListener('click', cellClickHandler);
        //secondo eventlistener per il click destro che ci permette di mettere bandierine sulle celle
        newCell.addEventListener('contextmenu', cellRightClick);
        thisGrid.append(newCell);
    }
    // Una volta popolata la griglia, è pronta e la restituiamo
    return thisGrid;

    // HELPER FUNCTIONS. Le creo all'interno di questa funzione così può accedere alla varaibili dichiarate al suo interno.
    function cellClickHandler() {
        //leggiamo il numero di questa cella
        let thisCellNumber = parseInt(this.dataset.cellno);
        //troviamo le celle adiacenti a questa
        let thisAdjacents = getAdjacents(thisCellNumber,Math.sqrt(gridSize),Math.sqrt(gridSize));
        //contiamo quante bombe ci sono nelle celle adiacenti
        let thisAdjacentBombs = getCommonElements(thisAdjacents,bombArray);
        //vediamo se è una bomba
        let isThisABomb = bombArray.includes(thisCellNumber);

        // Se è la prima cella che clicchiamo, voglio che non sia una bomba nè che ci siano bombe intorno
        // il seguente if contiene le istruzioni per spostare eventuali bombe toccate dal primo click
        if (safeCellsClicked.length === 0 && (thisAdjacentBombs.length > 0 || isThisABomb)) {
            //dichiaro un array con le bombe da spostare
            let cellsToClear = thisAdjacentBombs;
            // se la cella cliccata è una bomba, la aggiungo all'array
            if (isThisABomb) {
                cellsToClear.push(thisCellNumber);
            }
            // dichiaro un array con le celle che NON voglio siano bombe (la prima cella cliccata e le sue adiacenti)
            let cleanMask = thisAdjacents;
            cleanMask.push(thisCellNumber);
            //scorro l'array delle bombe da spostare
            for (let i = 0; i < cellsToClear.length; i++) {
                // trovo, nell'array delle bombe, l'index della bomba da spostare a questo giro del loop
                let bombIndex = bombArray.indexOf(cellsToClear[i])
                console.log(`${bombArray[bombIndex]} is a bomb discovered on the first move of the game. Let's change that`);
                //inizio un ciclo while
                let cleanSwap = false;
                while (!cleanSwap){
                    // genero un numero a caso che sarà la nuova cella della bomba
                    let swapCandidate = generateUniqueRandomsInRange(1, gridSize)[0];
                    // Se la nuova cella non è **nè** già una bomba **nè** è presente nell'area da tenere pulita 
                    if (!cleanMask.includes(swapCandidate) && !bombArray.includes(swapCandidate)) {
                        // la sostituisco alla vecchia cella e chiudo il ciclo
                        console.log(`swapping ${bombArray[bombIndex]} with ${swapCandidate}`);
                        bombArray[bombIndex] = swapCandidate;
                        cleanSwap = true;
                    }
                }
            }
            console.log(bombArray);
            // aggiorno le variabili per riflettere la nuova situazione
            isThisABomb = bombArray.includes(thisCellNumber);
            thisAdjacentBombs = getCommonElements(thisAdjacents,bombArray);
        }

        // Se hai cliccato una bomba
        if(bombArray.includes(thisCellNumber)) {
            this.classList.add("bomb");
            gameEnd(false);
        }

        // Se hai cliccato una cella
        else {
            //attiviamo la cella
            this.classList.add('active');
            //se intorno ci sono bombe, scriviamo il numero di bombe nella cella e le diamo una classe per cambiare colore al testo
            if (thisAdjacentBombs.length > 0) {
                this.classList.add(`b${thisAdjacentBombs.length}`);
                this.querySelector('span').textContent = thisAdjacentBombs.length;
            }
            // se non ci sono bombe intorno, scopriamo anche le celle adiacenti a cascata.
            else {
                //inizio una funzione ricorsiva
                adjacentsDrilldown(thisAdjacents);
            }
            //aggiungo la cella cliccata al conteggio delle celle "pulite" scoperte
            //(se non l'abbiamo già aggiunto dentro la funzione ricorsiva)
            if (!safeCellsClicked.includes(thisCellNumber)) {
                safeCellsClicked.push(thisCellNumber);
            }
            console.log(`Safe cells clicked: ${safeCellsClicked.length} To win: ${gridSize - numberOfBombs}`);
            //se hai scoperto tutte le celle pulite, hai vinto.
            if (safeCellsClicked.length >= gridSize - numberOfBombs) {
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
            safeCellsClicked.sort(function(a, b) {
                return a - b;
            });
            console.log(safeCellsClicked);
            console.log('recusion count:', recursiveCount);

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

    function adjacentsDrilldown(thisAdjacents) {
        //variabile di debug per controllare che non faccia troppe ricursioni
        recursiveCount++;
        // console.log('No bombs around. drilling down to its neighbors');
        //facciamo partire un loop per scorrere tutte le celle adiacenti.
        for (let i = 0; i < thisAdjacents.length; i++) {
            // a ogni giro, imbrigliamo la cella 
            let thisAdjacentAdjacent = document.querySelector(`[data-cellno='${thisAdjacents[i]}']`);
            //troviamo le celle a loro volta adiacenti a questa
            let thisAdjacentAdjacents = getAdjacents(thisAdjacents[i],Math.sqrt(gridSize),Math.sqrt(gridSize));
            //contiamo le bombe intorno a questa cella
            let thisAdjacentAdjacentBombs = getCommonElements(thisAdjacentAdjacents,bombArray);
            // console.log(`cell ${thisAdjacents[i]} has the following neighbors: ${thisAdjacentAdjacents}. ${thisAdjacentAdjacentBombs} are bombs`);
            // controlliamo che non sia già stata scoperta
            let isThisAdjacentAdjacentClicked = thisAdjacentAdjacent.classList.contains('active');
            let isThisAdjacentAdjacentFlagged = thisAdjacentAdjacent.classList.contains('flag');
            // console.log(`Is it active? ${isThisAdjacentAdjacentClicked}. Is it flagged? ${isThisAdjacentAdjacentFlagged}`);
            // se non è attiva (e non è flaggata), la attiviamo
            if (!isThisAdjacentAdjacentClicked&&!isThisAdjacentAdjacentFlagged) {
                // console.log('good. Activating cell.');
                thisAdjacentAdjacent.classList.add('active');
                safeCellsClicked.push(thisAdjacents[i]);
                // se ha delle bombe intorno, la popoliamo con il conteggio delle bombe
                if (thisAdjacentAdjacentBombs.length > 0) {
                    thisAdjacentAdjacent.classList.add(`b${thisAdjacentAdjacentBombs.length}`);
                    // console.log('adding text content:', thisAdjacentAdjacentBombs.length);
                    thisAdjacentAdjacent.querySelector('span').textContent = thisAdjacentAdjacentBombs.length;
                }
                // se NON è attiva e NON ha bombe intorno, chiamiamo la funzione in cui già ci troviamo, ricorsivamente,
                // passadole i vicini di questa cella 
                if (thisAdjacentAdjacentBombs.length === 0) {
                    adjacentsDrilldown(thisAdjacentAdjacents);
                }
            }
            
        }
    }
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
    uniqueRandoms.sort(function(a, b) {
        return a - b
    });

    return uniqueRandoms;
}

// questa funzione prende due array e restituisce un array contente gli elementi che sono presenti in entrambi gli array
function getCommonElements(array1, array2) {
    const commonElements = [];
    for (let i = 0; i < array1.length; i++) {
        if (array2.includes(array1[i])) {
            commonElements.push(array1[i]);
        }
    }
    return commonElements;
}

function getAdjacents(cellno,width,height) {
    const isThisEdge = isEdge(cellno,width,height);
    const adjacents = [];
    
    if (!isThisEdge[0]) {                   // se la cella non è sul bordo superiore
        adjacents.push(cellno - width);     // pushamo la cella adiacente in alto
    }
    if (!isThisEdge[1]) {                   // se la cella non è sul bordo inferiore
        adjacents.push(cellno + width);     // pushamo la cella adiacente in basso
    }
    if (!isThisEdge[2]) {                   // se la cella non è sul bordo sinistro
        adjacents.push(cellno - 1);        // pushamo la cella adiacente a sinistra
    }
    if (!isThisEdge[3]) {                   // se la cella non è sul bordo destro
        adjacents.push(cellno + 1);         // pushamo la cella adiacente a destra
    }
    if (!isThisEdge[0] && !isThisEdge[2]) { // se la cella non è sul bordo superiore nè sul bordo sinistro
        adjacents.push(cellno - width - 1); // pushamo la cella adiacente in alto a sinistra
    }
    if (!isThisEdge[0] && !isThisEdge[3]) { // se la cella non è sul bordo superiore nè sul bordo destro
        adjacents.push(cellno - width + 1); // pushamo la cella adiacente in alto a destra
    }
    if (!isThisEdge[1] && !isThisEdge[2]) { // se la cella non è sul bordo inferiore nè sul bordo sinistro
        adjacents.push(cellno + width - 1); // pushamo la cella adiacente in basso a sinistra
    }
    if (!isThisEdge[1] && !isThisEdge[3]) { // se la cella non è sul bordo inferiore nè sul bordo destro
        adjacents.push(cellno + width + 1); // pushamo la cella adiacente in basso a destra
    }
    return adjacents;
}

function isEdge(cellno,width,height) {
    const isOnTopEdge = Math.floor((cellno - 1) / width) === 0;
    const isOnBottomEdge = Math.floor((cellno - 1) / width) + 1 === height;
    const isOnLeftEdge = cellno % width === 1;
    const isonRightEdge = cellno % width === 0;
    const edgeArray = [isOnTopEdge,isOnBottomEdge,isOnLeftEdge,isonRightEdge];

    return edgeArray;

}