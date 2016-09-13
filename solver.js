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
    var reserved = [];
    for (var row = 0; row < 9; row++) {
        grid[row] = [];
        reserved[row] = [];
        for (var column = 0; column < 9; column++) {
            var cellValue = document.getElementById('box_' + row.toString() + column.toString()).value;
            if (cellValue == '') {
                grid[row][column] = 0;
                reserved[row][column] = false;
            } else {
                grid[row][column] = cellValue;
                reserved[row][column] = true;
            }
        }
    }
    var errors = numContradictions(grid);
    if (errors > 0) {
        displayError('This sudoku puzzle is unsolvable.');
        setEnabled(true);
        return;
    }

    showReservedCells(true, reserved);
    initialConfiguration(grid);
    errors = numContradictions(grid);
    var swaps = 0;
    var dirty = true;

    var better = 0;
    var equal = 0;
    var waccepted = 0;
    var wrejected = 0;

    while (true) {
        if (dirty) {
            console.log('SWAPS ERRORS BETTER EQUAL WACCEPTED WREJECTED: ' + swaps.toString() + ' ' + errors.toString() + ' ' + better.toString() + ' ' + equal.toString() + ' ' + waccepted.toString() + ' ' + wrejected.toString());
            updateDisplay(grid, errors);
            dirty = false;

            if (errors == 0) {
                displaySuccess(swaps);
                break;
            }
            if (swaps >= 25000) {
                displayError('Swap limit reached. Terminating');
                break;
            }
        }

        var randomBox = getRandomInt(0, 8);
        var cornerRow = Math.floor(randomBox / 3) * 3;
        var cornerColumn = (randomBox % 3) * 3;

        var firstCellSwappable = false;
        while (!firstCellSwappable) {
            var randomRow1 = cornerRow + getRandomInt(0, 2);
            var randomCol1 = cornerColumn + getRandomInt(0, 2);
            if (reserved[randomRow1][randomCol1] == false) firstCellSwappable = true;
        }

        var secondCellSwappable = false;
        while (!secondCellSwappable) {
            var randomRow2 = cornerRow + getRandomInt(0, 2);
            var randomCol2 = cornerColumn + getRandomInt(0, 2);
            if (reserved[randomRow2][randomCol2] == false) secondCellSwappable = true;
        }

        var proposedGrid = copyGrid(grid);
        var temp = proposedGrid[randomRow1][randomCol1];
        proposedGrid[randomRow1][randomCol1] = proposedGrid[randomRow2][randomCol2];
        proposedGrid[randomRow2][randomCol2] = temp;

        var proposedErrors = numContradictions(proposedGrid);
        var difference = proposedErrors - errors;
        if (difference < 0) {
            better += 1;
        } else if (difference == 0) {
            equal += 1;
        }
        if (Math.random() < Math.exp(-difference / getTemperature(errors))) {
            grid = proposedGrid;
            errors = proposedErrors;
            swaps += 1;
            dirty = true;
            if (difference > 0) {
                waccepted += 1;
            }
        } else {
            wrejected += 1;
        }
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
function updateDisplay(grid, errors) {
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

// Highlight cells filled in by the user with a different color.
function showReservedCells(setting, reserved) {
    for (var row = 0; row < 9; row++) {
        for (var column = 0; column < 9; column++) {
            var cell = document.getElementById('box_' + row.toString() + column.toString());
            if (setting == true && reserved[row][column] == true) {
                cell.classList.add('sss-reserved');
            } else {
                cell.classList.remove('sss-reserved');
            }
        }
    }
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

// Fill the passed-in grid in a way that satisfies the box property.
function initialConfiguration(grid) {
    for (var cornerRow = 0; cornerRow < 9; cornerRow += 3) {
        for (var cornerColumn = 0; cornerColumn < 9; cornerColumn += 3) {
            var numbersRemaining = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            for (var row = 0; row < 3; row++) {
                for (var column = 0; column < 3; column++) {
                    var val = grid[cornerRow + row][cornerColumn + column];
                    if (val > 0) {
                        var index = numbersRemaining.indexOf(parseInt(val));
                        numbersRemaining.splice(index, 1);
                    }
                }
            }

            for (row = 0; row < 3; row++) {
                for (column = 0; column < 3; column++) {
                    val = grid[cornerRow + row][cornerColumn + column];
                    if (val == 0) {
                        grid[cornerRow + row][cornerColumn + column] = numbersRemaining[0];
                        numbersRemaining.splice(0, 1);
                    }
                }
            }
        }
    }
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

// Get a simulated annealing temperature for the current # of errors.
function getTemperature(errors) {
    if (errors >= 50) {
        return 2;
    } else if (errors >= 40) {
        return 1;
    } else if (errors >= 20) {
        return 0.75;
    } else if (errors >= 10) {
        return 0.4;
    }
    return 0.3;
}

// Helper function  to draw random integers.
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to deep-copy a 2d array
function copyGrid(grid) {
    var copy = [];
    for (var i = 0; i < grid.length; i++) {
        copy[i] = grid[i].slice();
    }
    return copy;
}

})();
