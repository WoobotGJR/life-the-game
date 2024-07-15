document.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('gameArea');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const randomBtn = document.getElementById('randomBtn');
  const rowsInput = document.getElementById('rows');
  const colsInput = document.getElementById('cols');
  const generationTimeDisplay = document.getElementById('generationTime');

  let rows = parseInt(rowsInput.value);
  let cols = parseInt(colsInput.value);
  let cells = [];
  let running = false;
  let worker = new Worker('worker.js');

  // Canvas context
  const ctx = gameArea.getContext('2d');
  const cellSize = 1;

  // Initialize game area
  const initializeGameArea = () => {
    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    gameArea.width = cols * cellSize;
    gameArea.height = rows * cellSize;

    cells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0)
    );

    gameArea.addEventListener('click', (event) => {
      const rect = gameArea.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);
      toggleCell(y, x);
    });

    updateDisplay();
  };

  // Toggle cell state
  const toggleCell = (y, x) => {
    cells[y][x] = cells[y][x] ? 0 : 1;
    drawCell(y, x);
  };

  // Draw cell
  const drawCell = (y, x) => {
    ctx.fillStyle = cells[y][x] ? 'black' : 'white';
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  };

  // Update display
  const updateDisplay = () => {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        drawCell(y, x);
      }
    }
  };

  // Compute next generation
  const nextGeneration = () => {
    worker.postMessage({ action: 'next', cells, rows, cols });
  };

  worker.onmessage = function (event) {
    const { changes, generationTime } = event.data;
    changes.forEach(([y, x, state]) => {
      cells[y][x] = state;
      drawCell(y, x);
    });
    generationTimeDisplay.textContent = `Время генерации: ${generationTime.toFixed(
      2
    )} мс`;

    if (running) {
      requestAnimationFrame(nextGeneration);
    }
  };

  // Start game
  const startGame = () => {
    if (!running) {
      running = true;
      worker.postMessage({ action: 'start', cells, rows, cols });
      requestAnimationFrame(nextGeneration);
    }
  };

  // Stop game
  const stopGame = () => {
    running = false;
    worker.postMessage({ action: 'stop' });
  };

  // Reset game
  const resetGame = () => {
    stopGame();
    initializeGameArea();
  };

  // Randomize cells
  const randomizeCells = () => {
    stopGame();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells[y][x] = Math.random() < 0.5 ? 1 : 0;
      }
    }
    updateDisplay();
  };

  // Event listeners
  startBtn.addEventListener('click', startGame);
  stopBtn.addEventListener('click', stopGame);
  resetBtn.addEventListener('click', resetGame);
  randomBtn.addEventListener('click', randomizeCells);
  rowsInput.addEventListener('change', resetGame);
  colsInput.addEventListener('change', resetGame);

  // Initial setup
  initializeGameArea();
});
