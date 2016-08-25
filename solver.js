(function() {

document.addEventListener('DOMContentLoaded', function() {

    var gridBox = document.getElementById('stochastic-sudoku-solver');
    gridBox.classList.add('sss-top');

    var table = document.createElement('table');
    table.classList.add('sss-table');
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '0');

    for (var row = 0; row < 9; row++) {
        var tr = document.createElement('tr');
        for (var column = 0; column < 9; column++) {
            var td = document.createElement('td');
            td.classList.add('sss-cell');

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

});

})();
