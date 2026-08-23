var totalRows = 25;
var totalCols = 40;
var inProgress = false;
var cellsToAnimate = [];
var createWalls = false;
var algorithm = 'Depth-First Search (DFS)';
var justFinished = false;
var animationSpeed = 'Fast';
var animationState = null;
var startCell = [11, 15];
var endCell = [11, 25];
var movingStart = false;
var movingEnd = false;

function generateGrid(rows, cols) {
  var grid = '<table>';
  for (var row = 1; row <= rows; row++) {
    grid += '<tr>';
    for (var col = 1; col <= cols; col++) {
      grid += '<td></td>';
    }
    grid += '</tr>';
  }
  grid += '</table>';
  return grid;
}

var myGrid = generateGrid(totalRows, totalCols);
$('#tableContainer').append(myGrid);

/* ------------------------- */
/* ---- MOUSE FUNCTIONS ---- */
/* ------------------------- */

$('td').mousedown(function () {
  var index = $('td').index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (!inProgress) {
    if (justFinished && !inProgress) {
      clearBoard(true);
      justFinished = false;
    }
    if (index == startCellIndex) {
      movingStart = true;
    } else if (index == endCellIndex) {
      movingEnd = true;
    } else {
      createWalls = true;
    }
  }
});

$('td').mouseup(function () {
  createWalls = false;
  movingStart = false;
  movingEnd = false;
});

$('td').mouseenter(function () {
  if (!createWalls && !movingStart && !movingEnd) {
    return;
  }
  var index = $('td').index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (!inProgress) {
    if (justFinished) {
      clearBoard(true);
      justFinished = false;
    }
    if (movingStart && index != endCellIndex) {
      moveStartOrEnd(startCellIndex, index, 'start');
    } else if (movingEnd && index != startCellIndex) {
      moveStartOrEnd(endCellIndex, index, 'end');
    } else if (index != startCellIndex && index != endCellIndex) {
      $(this).toggleClass('wall');
    }
  }
});

$('td').click(function () {
  var index = $('td').index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (
    inProgress == false &&
    !(index == startCellIndex) &&
    !(index == endCellIndex)
  ) {
    if (justFinished) {
      clearBoard(true);
      justFinished = false;
    }
    $(this).toggleClass('wall');
  }
});

$('body').mouseup(function () {
  createWalls = false;
  movingStart = false;
  movingEnd = false;
});

/* ----------------- */
/* ---- BUTTONS ---- */
/* ----------------- */

$('#startBtn').click(function () {
  if (inProgress) {
    update('wait');
    return;
  }
  traverseGraph();
});

$('#clearBtn').click(function () {
  if (inProgress) {
    update('wait');
    return;
  }
  clearBoard(false);
});

$('#mazeBtn').click(function (e) {
  e.preventDefault();
  if (inProgress) {
    update('wait');
    return;
  }
  spiralMaze();
});

/* ----------------- */
/* --- FUNCTIONS --- */
/* ----------------- */

function moveStartOrEnd(prevIndex, newIndex, startOrEnd) {
  var newCellY = newIndex % totalCols;
  var newCellX = Math.floor((newIndex - newCellY) / totalCols);
  if (startOrEnd == 'start') {
    startCell = [newCellX, newCellY];
  } else {
    endCell = [newCellX, newCellY];
  }
  clearBoard(true);
  return;
}

function update(message) {
  $('#resultsIcon').removeClass();
  $('#resultsIcon').addClass('fas fa-exclamation');
  $('#results').css('background-color', '#ffc107');
  $('#length').text('');
  if (message == 'wait') {
    $('#duration').text('Please wait for the algorithm to finish.');
  }
}

function updateResults(duration, pathFound, length) {
  var firstAnimation = 'swashOut';
  var secondAnimation = 'swashIn';
  $('#results').removeClass();
  $('#results').addClass('magictime ' + firstAnimation);
  setTimeout(function () {
    $('#resultsIcon').removeClass();
    if (pathFound) {
      $('#results').css('background-color', '#ff4778');
      $('#resultsIcon').addClass('fas fa-check');
    } else {
      $('#results').css('background-color', '#ff6961');
      $('#resultsIcon').addClass('fas fa-times');
    }
    $('#duration').text('Duration: ' + duration + ' ms');
    $('#length').text('Length: ' + length + ' blocks');
    $('#results').removeClass(firstAnimation);
    $('#results').addClass(secondAnimation);
  }, 1100);
}

function countLength() {
  var cells = $('td');
  var l = 0;
  for (var i = 0; i < cells.length; i++) {
    if ($(cells[i]).hasClass('success')) {
      l++;
    }
  }
  return l;
}

async function traverseGraph() {
  inProgress = true;
  clearBoard(true);
  var startTime = Date.now();
  var visited = createVisited();
  var pathFound = DFS(startCell[0], startCell[1], visited);
  await animateCells();
  var endTime = Date.now();
  if (pathFound) {
    updateResults(endTime - startTime, true, countLength());
  } else {
    updateResults(endTime - startTime, false, countLength());
  }
  inProgress = false;
  justFinished = true;
}

function createVisited() {
  var visited = [];
  var cells = $('#tableContainer').find('td');
  for (var i = 0; i < totalRows; i++) {
    var row = [];
    for (var j = 0; j < totalCols; j++) {
      if (cellIsAWall(i, j, cells)) {
        row.push(true);
      } else {
        row.push(false);
      }
    }
    visited.push(row);
  }
  return visited;
}

function cellIsAWall(i, j, cells) {
  var cellNum = i * totalCols + j;
  return $(cells[cellNum]).hasClass('wall');
}

function DFS(i, j, visited) {
  if (i == endCell[0] && j == endCell[1]) {
    cellsToAnimate.push([[i, j], 'success']);
    return true;
  }
  visited[i][j] = true;
  cellsToAnimate.push([[i, j], 'searching']);
  var neighbors = getNeighbors(i, j);
  for (var k = 0; k < neighbors.length; k++) {
    var m = neighbors[k][0];
    var n = neighbors[k][1];
    if (!visited[m][n]) {
      var pathFound = DFS(m, n, visited);
      if (pathFound) {
        cellsToAnimate.push([[i, j], 'success']);
        return true;
      }
    }
  }
  cellsToAnimate.push([[i, j], 'visited']);
  return false;
}

async function spiralMaze() {
  inProgress = true;
  clearBoard(false);

  var length = 1;
  var direction = {
    0: [-1, 1],
    1: [1, 1],
    2: [1, -1],
    3: [-1, -1],
  };
  var cell = [Math.floor(totalRows / 2), Math.floor(totalCols / 2)];
  while (inBounds(cell)) {
    var i_increment = direction[length % 4][0];
    var j_increment = direction[length % 4][1];
    for (var count = 0; count < length; count++) {
      var i = cell[0];
      var j = cell[1];
      cellsToAnimate.push([[i, j], 'wall']);
      cell[0] += i_increment;
      cell[1] += j_increment;
      if (!inBounds(cell)) {
        break;
      }
    }
    length += 1;
  }
  await animateCells();
  inProgress = false;
  return;
}

function inBounds(cell) {
  return (
    cell[0] >= 0 && cell[1] >= 0 && cell[0] < totalRows && cell[1] < totalCols
  );
}

function getNeighbors(i, j) {
  var neighbors = [];
  if (i > 0) {
    neighbors.push([i - 1, j]);
  }
  if (j > 0) {
    neighbors.push([i, j - 1]);
  }
  if (i < totalRows - 1) {
    neighbors.push([i + 1, j]);
  }
  if (j < totalCols - 1) {
    neighbors.push([i, j + 1]);
  }
  return neighbors;
}

async function animateCells() {
  animationState = null;
  var cells = $('#tableContainer').find('td');
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  var delay = getDelay();
  for (var i = 0; i < cellsToAnimate.length; i++) {
    var cellCoordinates = cellsToAnimate[i][0];
    var x = cellCoordinates[0];
    var y = cellCoordinates[1];
    var num = x * totalCols + y;
    if (num == startCellIndex || num == endCellIndex) {
      continue;
    }
    var cell = cells[num];
    var colorClass = cellsToAnimate[i][1];

    await new Promise(function (resolve) {
      setTimeout(resolve, delay);
    });

    $(cell).removeClass();
    $(cell).addClass(colorClass);
  }
  cellsToAnimate = [];
  return true;
}

function getDelay() {
  return 10;
}

function clearBoard(keepWalls) {
  var cells = $('#tableContainer').find('td');
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  for (var i = 0; i < cells.length; i++) {
    var isWall = $(cells[i]).hasClass('wall');
    $(cells[i]).removeClass();
    if (i == startCellIndex) {
      $(cells[i]).addClass('start');
    } else if (i == endCellIndex) {
      $(cells[i]).addClass('end');
    } else if (keepWalls && isWall) {
      $(cells[i]).addClass('wall');
    }
  }
}

clearBoard(false);
