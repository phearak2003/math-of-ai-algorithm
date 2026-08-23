# Algorithm Visualization — Depth-First Search (DFS)

A web-based pathfinding visualizer that demonstrates **Depth-First Search** on a 2D grid. The application is fixed to one algorithm (**DFS**), one maze generator (**Simple Spiral**), and one animation speed (**Fast**).

This document explains the problem model, how DFS works in this project, and how the visualization maps to the algorithm—suitable for academic or classroom presentation.

---

## 1. Project overview

| Item | Value |
|------|--------|
| Algorithm | Depth-First Search (DFS) |
| Grid size | 25 rows × 40 columns |
| Movement | 4-directional (up, left, down, right) — no diagonals |
| Edge cost | 1 per step (unweighted grid) |
| Maze option | Simple Spiral |
| Animation | Fast (10 ms per cell update) |

### How to run

1. Open `index.html` in a modern web browser.
2. Optionally click **Simple Spiral** to generate walls, or draw walls by clicking / dragging cells.
3. Drag the green **Start** or red **Target** cell to reposition them.
4. Click **Start DFS** to run the search and watch the animation.
5. Click **Clear** to reset the board.

### Project structure

```
tux/
  index.html          UI layout and controls
  script.js           Grid, DFS, spiral maze, animation
  styles/main.css     Visual theme and cell states
  styles/magic.min.css  (optional animation helpers)
  images/             Legacy tutorial assets (unused)
```

---

## 2. Problem formulation

### Graph model

The grid is modeled as an **undirected, unweighted graph** \(G = (V, E)\):

- Each **non-wall cell** is a vertex \(v \in V\).
- Two vertices are connected by an edge if they share a side (4-neighborhood).
- **Wall cells** are excluded from the searchable graph (treated as already “visited” / blocked).

Formally, for a cell at row \(i\), column \(j\), the neighbors are:

\[
N(i,j) = \{(i-1,j),\ (i,j-1),\ (i+1,j),\ (i,j+1)\}
\cap \text{(cells inside the grid bounds)}
\]

excluding any neighbor that is a wall.

### Goal

Given:

- **Start cell** \(s = (r_s, c_s)\)
- **Target cell** \(t = (r_t, c_t)\)

Find a sequence of moves from \(s\) to \(t\) that never steps on a wall. Each move has cost 1, so path length equals the number of steps (or blocks) along the path.

### What DFS guarantees (and what it does not)

| Property | DFS in this app |
|----------|------------------|
| Finds *a* path if one exists (finite grid) | Yes |
| Finds the *shortest* path | **No** |
| Explores deeply before backtracking | Yes |

Shortest-path algorithms on unit-cost grids include BFS and Dijkstra. This project intentionally uses **DFS** to illustrate depth-first exploration and backtracking—not optimal path length.

---

## 3. Depth-First Search — how it works

### High-level idea

DFS explores as **far as possible** along one branch before backtracking. On a grid:

1. Stand on the current cell.
2. Mark it as visited so it is not explored again.
3. Try each unvisited neighbor, recursively.
4. If a neighbor’s recursion reaches the target, the current cell is part of a valid path—mark it and return success.
5. If all neighbors fail, the current cell is a dead end—return failure and backtrack.

The call stack of the recursive function is the DFS stack.

### Neighbor order in this implementation

In `getNeighbors(i, j)`, neighbors are collected in this order:

1. **North** — \((i-1, j)\)
2. **West** — \((i, j-1)\)
3. **South** — \((i+1, j)\)
4. **East** — \((i, j+1)\)

DFS follows this order when choosing which branch to explore first. Changing the order changes which path is found (still not necessarily shortest).

**Say this:** “This is our graph edge list for one cell—only four directions, no diagonals.”

```javascript
// script.js — getNeighbors(i, j)
function getNeighbors(i, j) {
  var neighbors = [];
  if (i > 0) {
    neighbors.push([i - 1, j]);      // North
  }
  if (j > 0) {
    neighbors.push([i, j - 1]);      // West
  }
  if (i < totalRows - 1) {
    neighbors.push([i + 1, j]);      // South
  }
  if (j < totalCols - 1) {
    neighbors.push([i, j + 1]);      // East
  }
  return neighbors;
}
```

### Wall handling

Before DFS starts, `createVisited()` builds a 2D boolean matrix:

- `visited[i][j] = true` if the cell is a **wall** (blocked).
- `visited[i][j] = false` otherwise (free to explore).

As DFS runs, free cells are marked `true` when entered. Walls are never entered because they start as visited.

**Say this:** “Walls are pre-marked as visited, so DFS never steps on them.”

```javascript
// script.js — walls become visited[i][j] === true
function createVisited() {
  var visited = [];
  var cells = $('#tableContainer').find('td');
  for (var i = 0; i < totalRows; i++) {
    var row = [];
    for (var j = 0; j < totalCols; j++) {
      if (cellIsAWall(i, j, cells)) {
        row.push(true);   // wall = blocked
      } else {
        row.push(false);  // free cell
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
```

### Step-by-step (matching `DFS(i, j, visited)` in `script.js`)

1. **Base case (success)**  
   If \((i, j)\) equals the target, record this cell as part of the path (`success`) and return `true`.

2. **Mark and expand**  
   Set `visited[i][j] = true`.  
   Queue a visual “searching” state for animation.

3. **Recursive exploration**  
   For each neighbor \((m, n)\) that is not yet visited:
   - Recursively call `DFS(m, n, visited)`.
   - If that call returns `true`, mark the current cell as `success` (on the path) and return `true`.

4. **Dead end**  
   If no neighbor leads to the target, queue a “visited” visual state and return `false`.

5. **Path reconstruction**  
   The yellow path is not stored in a separate parent array. It is built during **successful backtracking**: each frame that returns `true` pushes the current cell onto the animation queue as `success`.

### Pseudocode

```
function DFS(i, j, visited):
    if (i, j) == target:
        animate(i, j, SUCCESS)
        return true

    visited[i][j] ← true
    animate(i, j, SEARCHING)

    for each neighbor (m, n) of (i, j) in order [N, W, S, E]:
        if not visited[m][n]:
            if DFS(m, n, visited) == true:
                animate(i, j, SUCCESS)   // backtrack: cell is on the found path
                return true

    animate(i, j, VISITED)               // dead end
    return false
```

### Our implementation (real code)

**Say this:** Point at each block—base case → mark → recurse → yellow path on the way back → pink on dead end.

```javascript
// script.js — core DFS (this is the algorithm you present)
function DFS(i, j, visited) {
  // 1) Base case: reached the target
  if (i == endCell[0] && j == endCell[1]) {
    cellsToAnimate.push([[i, j], 'success']);  // yellow path
    return true;
  }

  // 2) Mark current cell and show "searching"
  visited[i][j] = true;
  cellsToAnimate.push([[i, j], 'searching']);  // purple

  // 3) Try each unvisited neighbor (depth-first)
  var neighbors = getNeighbors(i, j);
  for (var k = 0; k < neighbors.length; k++) {
    var m = neighbors[k][0];
    var n = neighbors[k][1];
    if (!visited[m][n]) {
      var pathFound = DFS(m, n, visited);  // go deeper
      if (pathFound) {
        // 4) Success on the way back → this cell is on the path
        cellsToAnimate.push([[i, j], 'success']);  // yellow
        return true;
      }
    }
  }

  // 5) Dead end → backtrack
  cellsToAnimate.push([[i, j], 'visited']);  // pink
  return false;
}
```

### Complexity

Let \(V\) be the number of free cells (at most \(25 \times 40 = 1000\)).

| Measure | Bound | Notes |
|---------|--------|--------|
| Time | \(O(V)\) | Each cell is entered at most once |
| Space (visited matrix) | \(O(V)\) | Full grid boolean matrix |
| Space (recursion stack) | \(O(V)\) worst case | Deep path with little branching |

On this small grid, performance is not a concern; the visible delay comes from **animation** (10 ms per cell update), not from DFS computation.

---

## 4. Visualization mapping

The algorithm first runs to completion and fills an animation queue (`cellsToAnimate`). Then `animateCells()` paints the grid over time.

| Visual state | CSS class | Meaning in DFS |
|--------------|-----------|----------------|
| Start | `start` (green) | Source cell \(s\) |
| Target | `end` (red) | Goal cell \(t\) |
| Wall | `wall` (dark) | Blocked / not searchable |
| Searching | `searching` (purple) | Cell just entered / being expanded |
| Visited | `visited` (pink) | Explored; led to a dead end (or finished expansion without being on final path painting) |
| Path | `success` (yellow) | Cell on the path found by successful backtracking |
| Unvisited | default (white) | Not yet explored |

**Presentation tip:** Ask the audience to watch for *deep corridors* of purple/pink (depth-first) versus the *wavefront* they would see with BFS. Then point out that the yellow path can be long and winding—evidence that DFS does not optimize length.

---

## 5. Simple Spiral maze

**Simple Spiral** is not part of DFS; it is a maze (wall) generator used before search.

### Behavior

1. Clear the board.
2. Start at the center of the grid: \(\lfloor rows/2 \rfloor,\ \lfloor cols/2 \rfloor\).
3. Walk outward in rotating diagonal directions (NE → SE → SW → NW), increasing segment length after each turn.
4. Mark each cell along the walk as a wall (animated).

This creates a spiral-like pattern of obstacles. DFS must navigate around these walls from start to target. Paths may be forced into long corridors, which makes DFS’s deep exploration visually clear.

**Say this:** “Spiral only paints walls—it does not search. DFS runs afterward.”

```javascript
// script.js — Simple Spiral (maze generator only)
async function spiralMaze() {
  inProgress = true;
  clearBoard(false);

  var length = 1;
  var direction = {
    0: [-1, 1],   // northeast
    1: [1, 1],    // southeast
    2: [1, -1],   // southwest
    3: [-1, -1],  // northwest
  };
  // Start at grid center
  var cell = [Math.floor(totalRows / 2), Math.floor(totalCols / 2)];

  while (inBounds(cell)) {
    var i_increment = direction[length % 4][0];
    var j_increment = direction[length % 4][1];
    for (var count = 0; count < length; count++) {
      cellsToAnimate.push([[cell[0], cell[1]], 'wall']);
      cell[0] += i_increment;
      cell[1] += j_increment;
      if (!inBounds(cell)) break;
    }
    length += 1;  // next arm of the spiral is longer
  }
  await animateCells();
  inProgress = false;
}
```

---

## 6. End-to-end execution flow

```
User clicks Start DFS
        │
        ▼
clearBoard(keep walls)
        │
        ▼
createVisited()     ← walls marked blocked
        │
        ▼
DFS(start)          ← builds cellsToAnimate (search + path)
        │
        ▼
animateCells()      ← paints grid at Fast speed (10 ms)
        │
        ▼
Done (inProgress = false)
```

**Say this:** “Search finishes first; then we replay the steps as animation.”

```javascript
// script.js — what Start DFS triggers
async function traverseGraph() {
  inProgress = true;
  clearBoard(true);                          // keep existing walls
  var visited = createVisited();             // walls already "visited"
  var pathFound = DFS(startCell[0], startCell[1], visited);
  await animateCells();                      // paint searching → path
  inProgress = false;
  justFinished = true;
}
```

---

## 7. Suggested demo script (for presentation)

1. **Open** `index.html` — show empty grid, start (green), target (red).
2. **Explain the model** — graph on a grid, 4 moves, walls blocked.
3. **Draw a few walls** (or run **Simple Spiral**) — show the obstacle set.
4. **Start DFS** — narrate:
   - Purple/searching = going deeper.
   - Pink/visited = backtracking from a failed branch.
   - Yellow = path recovered on successful return.
5. **Discuss** — Why might this path not be shortest? How would BFS look different?
6. **Clear** and optionally move start/target; run again to show a different exploration order / path.

---

## 8. Key takeaways

1. This app visualizes **recursive DFS** for pathfinding on an unweighted grid with walls.
2. DFS is **complete** on a finite grid (it finds a path if one exists) but **not optimal** (path length may be far from minimal).
3. The yellow path is produced by **backtracking** after the target is found, not by a separate parent-pointer reconstruction pass.
4. Neighbor order (N → W → S → E) determines which path DFS finds first.
5. **Simple Spiral** only generates walls; **DFS** alone finds a path through the resulting maze.

---

## References (concepts)

- Cormen, T. H., et al. *Introduction to Algorithms* — Graph algorithms: Depth-first search.
- Russell, S., & Norvig, P. *Artificial Intelligence: A Modern Approach* — Uninformed search (DFS vs BFS).

---

*Implementation reference: `DFS`, `getNeighbors`, `createVisited`, `spiralMaze`, and `animateCells` in `script.js`.*
