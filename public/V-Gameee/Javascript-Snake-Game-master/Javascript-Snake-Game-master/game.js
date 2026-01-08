import {
    update as updateSnake,
    draw as drawSnake,
    SNAKE_SPEED,
    getSnakeHead,
    snakeIntersection,
  } from "./snake.js";
  import { update as updateFood, draw as drawFood } from "./food.js";
  import { outsideGrid } from "./grid.js";

  let lastRenderTime = 0;
  let gameOver = false;
  const gameBoard = document.getElementById("game-board");

  function main(currentTime) {
    if (gameOver) {
      // CHANGED: Replaced confirm popup with an in-game overlay
      showGameOverOverlay();
      return;
    }

    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

    lastRenderTime = currentTime;

    update();
    draw();
  }

  window.requestAnimationFrame(main);

  function update() {
    updateSnake();
    updateFood();
    checkDeath();
  }

  function draw() {
    gameBoard.innerHTML = "";
    drawSnake(gameBoard);
    drawFood(gameBoard);
  }

  function checkDeath() {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
  }

  // NEW: Function to display the loss message inside the board
  function showGameOverOverlay() {
    if (document.getElementById('game-over')) return;

    const overlay = document.createElement('div');
    overlay.id = 'game-over';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(3, 6, 23, 0.85);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10;
    `;

    overlay.innerHTML = `
      <h2 style="color: #7c3aed; font-family: 'Orbitron', sans-serif; margin: 0;">YOU LOST</h2>
      <p style="color: white; font-family: 'Poppins', sans-serif; margin: 10px 0;">Better luck next time!</p>
      <button onclick="window.location.reload()" style="
        background: #7c3aed;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 50px;
        font-family: 'Orbitron';
        cursor: pointer;
      ">RESTART</button>
    `;

    gameBoard.style.position = 'relative';
    gameBoard.appendChild(overlay);
  }