(function() {

document.addEventListener('DOMContentLoaded', function() {

    var gridBox = document.getElementById('stochastic-sudoku-solver');
    gridBox.classList.add('sss-widget');

    var header = document.createElement('h1');
    header.classList.add('sss-header');
    header.innerHTML = 'Stochastic Sudoku Solver';
    gridBox.appendChild(header);

    var table = document.createElement('table');
    table.classList.add('sss-table');
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '0');

    for (var row = 0; row < 9; row++) {
        var tr = document.createElement('tr');
        for (var column = 0; column < 9; column++) {
            var td = document.createElement('td');
            td.classList.add('sss-cell');

            if (row % 3 == 0) {
                td.classList.add('sss-thick-top');
            }
            if (row == 8) {
                td.classList.add('sss-thick-bottom');
            }
            if (column % 3 == 0) {
                td.classList.add('sss-thick-left');
            }
            if (column == 8) {
                td.classList.add('sss-thick-right');
            }

            var textBox = document.createElement('input');
            textBox.setAttribute('type', 'number');
            textBox.setAttribute('min', '1');
            textBox.setAttribute('max', '9');
            textBox.classList.add('sss-textbox');
            textBox.id = 'box_' + row.toString() + column.toString();

            td.appendChild(textBox);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    gridBox.appendChild(table);

    var label = document.createElement('p');
    label.classList.add('sss-label');
    label.innerHTML = 'Fill some cells on the grid and then press Solve.';
    gridBox.appendChild(label);

    var button = document.createElement('button');
    button.classList.add('sss-button');
    button.innerHTML = 'Solve';
    button.addEventListener('click', main);
    gridBox.appendChild(button);

});

// Function called in response to a button click
function main() {
    setEnabled(false);
    var grid = [];
    for (var row = 0; row < 9; row++) {
        grid[row] = [];
        for (var column = 0; column < 9; column++) {
            var cellValue = document.getElementById('box_' + row.toString() + column.toString()).value;
            if (cellValue == '') {
                grid[row][column] = 0;
            } else {
                grid[row][column] = cellValue;
            }
        }
    }
    var contradictions = numContradictions(grid);
    if (contradictions > 0) {
        displayError('This sudoku puzzle is unsolvable.');
        setEnabled(true);
        return;
    }

    setEnabled(true);
}

function setEnabled(setting) {
    for (var row = 0; row < 9; row++) {
        for (var column = 0; column < 9; column++) {
            document.getElementById('box_' + row.toString() + column.toString()).disabled = !setting;
        }
    }
    var button = document.getElementsByClassName('sss-button')[0];
    button.disabled = !setting;
}

// Display the current state of the sudoku grid on the page.
function updateGrid(grid, errors) {
    for (var row = 0; row < 9; row++) {
        for (var column = 0; column < 9; column++) {
            var cell = document.getElementById('box_' + row.toString() + column.toString());
            cell.value = grid[row][column];
        }
    }
    var label = document.getElementsByClassName('sss-label')[0];
    label.classList.remove('sss-green');
    label.classList.remove('sss-red');
    label.innerHTML = 'Errors on grid: ' + errors.toString();
}

// Notify the user of an unsolvable grid.
function displayError(error) {
    var label = document.getElementsByClassName('sss-label')[0];
    label.classList.remove('sss-green');
    label.classList.add('sss-red');
    label.innerHTML = error;
}

// Notify the user of a successful run.
function displaySuccess(swaps) {
        var label = document.getElementsByClassName('sss-label')[0];
        label.classList.remove('sss-red');
        label.classList.add('sss-green');
        label.innerHTML = 'Puzzle solved after ' + swaps.toString() + ' swaps.';
}

// Calculate the number of errors in a partial or full grid.
function numContradictions(grid) {
    var contradictions = 0;
    var occurrences = [];

    // All rows
    for (var row = 0; row < 9; row++) {
        for (var i = 0; i <= 9; i++) {
            occurrences[i] = 0;
        }
        for (var column = 0; column < 9; column++) {
            var val = grid[row][column];
            occurrences[val] += 1;
        }
        for (var index = 1; index <= 9; index++) {
            if (occurrences[index] > 1) {
                contradictions += (occurrences[index] - 1);
            }
        }
    }

    // All columns
    for (column = 0; column < 9; column++) {
        for (i = 0; i <= 9; i++) {
            occurrences[i] = 0;
        }
        for (row = 0; row < 9; row++) {
            val = grid[row][column];
            occurrences[val] += 1;
        }
        for (index = 1; index <= 9; index++) {
            if (occurrences[index] > 1) {
                contradictions += (occurrences[index] - 1);
            }
        }
    }

    // All boxes
    for (var cornerRow = 0; cornerRow < 9; cornerRow += 3) {
        for (var cornerColumn = 0; cornerColumn < 9; cornerColumn += 3) {
            for (i = 0; i <= 9; i++) {
                occurrences[i] = 0;
            }
            for (row = 0; row < 3; row++) {
                for (column = 0; column < 3; column++) {
                    val = grid[cornerRow + row][cornerColumn + column];
                    occurrences[val] += 1;
                }
            }
            for (index = 1; index <= 9; index++) {
                if (occurrences[index] > 1) {
                    contradictions += (occurrences[index] - 1);
                }
            }
        }
    }

    return contradictions;
}

})();
