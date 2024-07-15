let cells, rows, cols;
let running = false;

onmessage = function (event) {
  const { action, ...data } = event.data;
  if (action === 'start') {
    ({ cells, rows, cols } = data);
    running = true;
    postMessage({ action: 'next' });
  } else if (action === 'stop') {
    running = false;
  } else if (action === 'next') {
    if (running) {
      const startTime = performance.now();
      const { newCells, changes } = computeNextGeneration(cells, rows, cols);
      cells = newCells;
      const endTime = performance.now();
      postMessage({ changes, generationTime: endTime - startTime });
    }
  }
};

const computeNextGeneration = (cells, rows, cols) => {
  const newCells = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
  const changes = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const neighbors = getNeighbors(y, x);
      const aliveNeighbors = neighbors.filter(
        ([ny, nx]) => cells[ny][nx]
      ).length;

      if (cells[y][x]) {
        newCells[y][x] = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
        if (newCells[y][x] === 0) changes.push([y, x, 0]);
      } else {
        newCells[y][x] = aliveNeighbors === 3 ? 1 : 0;
        if (newCells[y][x] === 1) changes.push([y, x, 1]);
      }
    }
  }

  return { newCells, changes };
};

const getNeighbors = (y, x) => {
  const neighbors = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy === 0 && dx === 0) continue;
      const ny = (y + dy + rows) % rows;
      const nx = (x + dx + cols) % cols;
      neighbors.push([ny, nx]);
    }
  }
  return neighbors;
};
