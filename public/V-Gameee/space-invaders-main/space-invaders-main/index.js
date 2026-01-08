import EnemyController from "./EnemyController.js";
import Player from "./Player.js";
import BulletController from "./BulletController.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 500;

const background = new Image();
background.src = "images/space.png";

// Theme Colors
const ACCENT_COLOR = "#7c3aed"; 
const TEXT_COLOR = "#ffffff";

// Bullet setup - Using theme colors for player bullets
const playerBulletController = new BulletController(canvas, 10, ACCENT_COLOR, true);
const enemyBulletController = new BulletController(canvas, 4, "white", false);
const enemyController = new EnemyController(
  canvas,
  enemyBulletController,
  playerBulletController
);
const player = new Player(canvas, 3, playerBulletController);

let isGameOver = false;
let didWin = false;

function game() {
  checkGameOver();
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  displayGameOver();
  if (!isGameOver) {
    enemyController.draw(ctx);
    player.draw(ctx);
    playerBulletController.draw(ctx);
    enemyBulletController.draw(ctx);
  }
}

function displayGameOver() {
  if (isGameOver) {
    let text = didWin ? "YOU WIN" : "GAME OVER";
    
    // Create an overlay effect
    ctx.fillStyle = "rgba(3, 6, 23, 0.85)"; // Matching your --bg-900 color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text Styling - Using Orbitron to match THREEE branding
    ctx.fillStyle = didWin ? ACCENT_COLOR : "#ff4d4d"; 
    ctx.font = "bold 60px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Draw text in the center
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Add sub-text
    ctx.font = "20px Poppins";
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText("Refresh the page to try again", canvas.width / 2, canvas.height / 2 + 60);
  }
}

function checkGameOver() {
  if (isGameOver) {
    return;
  }

  if (enemyBulletController.collideWith(player)) {
    isGameOver = true;
  }

  if (enemyController.collideWith(player)) {
    isGameOver = true;
  }

  if (enemyController.enemyRows.length === 0) {
    didWin = true;
    isGameOver = true;
  }
}

setInterval(game, 1000 / 60);