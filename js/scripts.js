// const playButton = document.querySelector('#btn-play');
// const levelSelect = document.querySelector('#level');
// const welcome = document.querySelector('.welcome');
// const gridContainer = document.querySelector('.grid-container');
// const guide = document.querySelector('#btn-guide');

// playButton.addEventListener('click',
//     function() {
//         gridContainer.innerHTML = '';

//         gridContainer.classList.remove('hidden');

//         const nCell = parseInt(levelSelect.value);
//         const sideSquare = Math.sqrt(nCell);
//         gridContainer.style.setProperty('--sideSquare', sideSquare);

//         for(let i = 1; i <= nCell; i++) {
//             const newCell = document.createElement('div');
//             newCell.classList.add('cell');
//             newCell.innerHTML = i;
//             gridContainer.append(newCell);
        
//             newCell.addEventListener('click',
//                 function() {
//                     this.classList.toggle('active');
//                 }
//             );
//         }
//     }
// );

document.getElementById('btn-play').addEventListener('click',
    function() {
        levelSelect = document.getElementById('level').value;
        let gridContainer = document.querySelector('.grid-container'); 

        let newGridContainer = (buildGrid(levelSelect));

        gridContainer.parentNode.replaceChild(newGridContainer, gridContainer);
    }
);

function buildGrid(size) {
    const thisGrid = document.createElement('div');
    thisGrid.classList.add('grid-container');

    let gridSize = '';
    if(size == 'easy') {
        gridSize = 100;
    }
    else if(size == 'medium') {
        gridSize = 81;
    }
    else {
        gridSize = 49;
    }

    for(let i = 1; i <= gridSize; i++) {
        let newCell = document.createElement('div');
        newCell.innerHTML = `<span>${i}</span>`;
        newCell.classList.add('cell');
        newCell.classList.add(size);

        newCell.addEventListener('click',
        function() {
            this.classList.toggle('active');
        }
    );

    thisGrid.append(newCell);
    }

    return thisGrid;
}