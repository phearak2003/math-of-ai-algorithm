# DFS Step-by-Step Presentation Guide

Speakable notes for presenting this project to a teacher. Keep this beside you while you demo.

---

## 1. One-minute overview

**Say this:**  
“This app visualizes Depth-First Search for pathfinding on a grid. The grid is 25 rows by 40 columns. Green is the start, red is the target, and dark cells are walls. DFS finds *a* path if one exists — it does **not** guarantee the shortest path.”

| Fixed setting | Value |
|---------------|--------|
| Algorithm | Depth-First Search (DFS) |
| Grid | 25 × 40 |
| Moves | Up, left, down, right (no diagonals) |
| Maze option | Simple Spiral |
| Speed | Fast (10 ms per cell) |

Code lives mainly in `script.js`. The UI is `index.html`.

---

## 2. Problem setup

**Say this:**  
“We treat the grid as a graph. Every free cell is a node. Two cells are connected if they share a side. Walls are not nodes — DFS never steps on them.”

- **Start** \(s\) — green cell  
- **Target** \(t\) — red cell  
- **Walls** — blocked cells  
- **Goal** — find a sequence of moves from \(s\) to \(t\) that avoids walls  

Neighbor order in this project (`getNeighbors`):

1. North  
2. West  
3. South  
4. East  

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

**Say this:**  
“Changing this order changes which path DFS finds first — still not necessarily the shortest.”

---

## 3. Algorithm steps (match `DFS` in `script.js`)

Walk through these five steps while pointing at the `DFS` function.

### Step 1 — Base case (success)

If the current cell is the target:

- Queue it as **success** (yellow path)  
- Return `true`

```javascript
// script.js — DFS Step 1
if (i == endCell[0] && j == endCell[1]) {
  cellsToAnimate.push([[i, j], 'success']);  // yellow path
  return true;
}
```

**Say this:**  
“If we are on the target, we found a path. We mark it and return success up the call stack.”

### Step 2 — Mark and explore

Otherwise:

- Set `visited[i][j] = true`  
- Queue **searching** (purple)

```javascript
// script.js — DFS Step 2
visited[i][j] = true;
cellsToAnimate.push([[i, j], 'searching']);  // purple
```

**Say this:**  
“We mark this cell so we never enter it again, then show it as searching.”

### Step 3 — Try each neighbor

For each neighbor in order N → W → S → E:

- Skip if already visited  
- Recursively call `DFS` on that neighbor  

```javascript
// script.js — DFS Step 3
var neighbors = getNeighbors(i, j);
for (var k = 0; k < neighbors.length; k++) {
  var m = neighbors[k][0];
  var n = neighbors[k][1];
  if (!visited[m][n]) {
    var pathFound = DFS(m, n, visited);  // go deeper
    // Step 4 handles pathFound === true
  }
}
```

**Say this:**  
“DFS goes as deep as possible along one branch before trying the next. The recursion call stack *is* the DFS stack.”

### Step 4 — Success on the way back

If a recursive call returns `true`:

- Queue the **current** cell as **success** (yellow)  
- Return `true`

```javascript
// script.js — DFS Step 4
if (pathFound) {
  cellsToAnimate.push([[i, j], 'success']);  // yellow
  return true;
}
```

**Say this:**  
“The yellow path is built during successful backtracking. Each cell that led to the target paints itself yellow as we return.”

### Step 5 — Dead end

If no neighbor works:

- Queue **visited** (pink)  
- Return `false`

```javascript
// script.js — DFS Step 5
cellsToAnimate.push([[i, j], 'visited']);  // pink
return false;
```

**Say this:**  
“Pink means this branch failed. We backtrack and try another direction.”

### Pseudocode (say out loud)

```
DFS(i, j, visited):
    if (i, j) is target:
        paint SUCCESS
        return true

    mark visited
    paint SEARCHING

    for each neighbor in [N, W, S, E]:
        if not visited:
            if DFS(neighbor) is true:
                paint SUCCESS
                return true

    paint VISITED   // dead end
    return false
```

### How a run starts (`traverseGraph`)

1. Clear search colors (keep walls)  
2. `createVisited()` — walls start as already visited  
3. `DFS(start)` — fills the animation queue  
4. `animateCells()` — paints the queue at Fast speed  

```javascript
// script.js — traverseGraph()
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

**Say this:**  
“Search finishes first in memory. Then we replay every step as animation.”

---

## 4. What you see on screen

| Color / class | Meaning |
|---------------|---------|
| Green (`start`) | Start cell |
| Red (`end`) | Target cell |
| Dark (`wall`) | Blocked |
| Purple (`searching`) | Just entered / expanding |
| Pink (`visited`) | Explored; dead end / failed branch |
| Yellow (`success`) | On the path found by backtracking |
| White | Not yet explored |

**Say this while demoing:**  
“Watch for deep purple corridors — that is depth-first. Pink is backtracking. Yellow is the recovered path. If the yellow path looks long and winding, that shows DFS is not optimizing length.”

---

## 5. Demo script (exact order)

1. Open `index.html` — show empty grid, green start, red target.  
2. Explain the graph model (4 moves, walls blocked).  
3. Click **Simple Spiral** *or* draw a few walls by hand.  
   - **Say:** “Spiral only paints walls. It does not search.”  
4. Optionally drag start or target.  
5. Click **Start DFS**. Narrate:  
   - Purple = going deeper  
   - Pink = failed branch, backtrack  
   - Yellow = path on successful return  
6. Point at results (duration / path length).  
7. Ask: “Why might this path not be shortest?”  
8. Click **Clear**, move start/target, run again to show a different path.

---

## 6. Complexity and takeaways

Let \(V\) = number of free cells (at most \(25 \times 40 = 1000\)).

| Measure | Bound |
|---------|--------|
| Time | \(O(V)\) — each cell entered at most once |
| Space (visited matrix) | \(O(V)\) |
| Space (recursion stack) | \(O(V)\) worst case |

Visible delay is mostly **animation** (10 ms), not DFS compute time.

**Key takeaways to close with:**

1. This is recursive DFS pathfinding on an unweighted grid.  
2. DFS is **complete** on a finite grid (finds a path if one exists) but **not optimal**.  
3. The yellow path comes from **backtracking**, not a separate parent-pointer pass.  
4. Neighbor order (N → W → S → E) decides which path appears first.  
5. **Simple Spiral** generates walls only; **DFS** alone finds the path.

---

## 7. Likely teacher questions (short answers)

**Q: Why isn’t this the shortest path?**  
A: DFS explores deeply along one branch first. BFS (or Dijkstra on unit costs) would find shortest paths on this grid. We use DFS to show depth-first exploration and backtracking.

**Q: Why this neighbor order?**  
A: It is an implementation choice. Any fixed order works for finding *a* path; the order changes *which* path we find first.

**Q: Where is the DFS stack?**  
A: The JavaScript call stack from recursive `DFS` calls. Each nested call is one level deeper in the search.

**Q: How do walls work?**  
A: `createVisited()` marks wall cells as visited before search starts, so DFS never enters them.

**Q: How is the yellow path reconstructed?**  
A: When a recursive call returns `true`, the current cell is queued as `success` before returning. That walks back from the target to the start along the successful branch.

**Q: What does Simple Spiral do?**  
A: Only generates a spiral pattern of walls from the center. Search runs later when you click Start DFS.

**Q: Time complexity?**  
A: \(O(V)\) for the search; animation is separate and slower on purpose for visualization.

---

## Quick reference — functions to point at

| Function | Role |
|----------|------|
| `traverseGraph()` | Start button: clear → visited → DFS → animate |
| `createVisited()` | Walls = already visited |
| `getNeighbors(i, j)` | N, W, S, E |
| `DFS(i, j, visited)` | Core algorithm |
| `animateCells()` | Replay the animation queue |
| `spiralMaze()` | Wall generator only |

---

*Use with the live demo. For deeper theory, see `README.md`.*
