// ************************************Game Implementation************************************

// ------------ Vars and Consts ------------
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var playerLives = 3; // number of nullification
var playerCurrentScore = 0; 
const HIT_FIRST_REWARD = 20; // points added on a hit
const HIT_SECOND_REWARD = 15; // points added on a hit
const HIT_THIRD_REWARD = 10; // points added on a hit
const HIT_FOURTH_REWARD = 5; // points added on a hit

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timeLeft = 60; // the amount of time left in seconds
var timeElapsed = 0; // the number of seconds elapsed

const enemies = [];
var enemySpeed = 5;         // init horizontal movement speed for enemies
const enemyBullets = [];
const playerBullets = [];
const playerBulletSpeed = 5; // enemy's bullet speed should match the current enemies speed!

// get sounds (background sound started in first click to enter game)
const HitTargetSound = document.getElementById( "hitSound" );
const NullificationSound = document.getElementById( "loseSound" );


// ------------ Init game's images ------------
const MainSpaceshipImg = new Image();
const FirstTragetImg = new Image();
const SecondTragetImg = new Image();
const ThirdTragetImg = new Image();
const FourthTragetImg = new Image();

let imagesLoaded = 0;

function checkAllImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 5) {
    StartGame();
  }
}

MainSpaceshipImg.onload = checkAllImagesLoaded;
FirstTragetImg.onload = checkAllImagesLoaded;
SecondTragetImg.onload = checkAllImagesLoaded;
ThirdTragetImg.onload = checkAllImagesLoaded;
FourthTragetImg.onload = checkAllImagesLoaded;

MainSpaceshipImg.src = "images/MainShips/MainShipOpt1.png";
FirstTragetImg.src = "images/BadShips/BadBlueShip.png";
SecondTragetImg.src = "images/BadShips/BadRedShip.png";
ThirdTragetImg.src = "images/BadShips/BadWhiteShip.png";
FourthTragetImg.src = "images/BadShips/BadYellowShip.png";


// ------------ Start game (after all imgs loaded) ------------
function StartGame(){
  setupGame();  
  startGameTimer();
  startEnemyAcceleration(); 
  GameLoop(); 
}

// ------------ SETUP ------------
function setupGame()
{
   // get the canvas, its context and setup its click event handler
   canvas = document.getElementById( "theCanvas" );
     // Set fixed dimensions for the canvas
    canvas.width = 900;  // Fixed width in pixels
    canvas.height = 800; // Fixed height for 4:3 aspect ratio
   context = canvas.getContext("2d");

  //  Start MainShip and enemies positions
   MainShip  = {  x: canvas.width / 2, y: canvas.height - 80, width: 40, height: 60, speed: 5 };
  setupEnemies();

} // end function setupGame

function setupEnemies() {
    const rows = 4;
    const cols = 5;
    const enemyWidth = 60;
    const enemyHeight = 60;
    const gapX = 40;    // גדל את המרחק האופקי בין האויבים
    const gapY = 40;    // גדל את המרחק האנכי בין האויבים
    const startX = 120; // התאם את נקודת ההתחלה האופקית
    const startY = 10;  // התחל גבוה יותר בקנבס
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy = {
          x: startX + col * (enemyWidth + gapX),
          y: startY + row * (enemyHeight + gapY),
          width: enemyWidth,
          height: enemyHeight,
          type: row + 1 // line 1 - blue, line 2 - red, line 3 - white, line 4 - yellow
        };
        enemies.push(enemy);
      }
    }
  }

// ENEMIES SPEED UP
let accelerationCount = 0;
const maxAccelerations = 4;
const accelerationInterval = 5000;

function startEnemyAcceleration() {
  setInterval(() => {
    if (accelerationCount < maxAccelerations) {
      enemySpeed += 1; // Linear speedup
      accelerationCount++;
    }
  }, accelerationInterval);
}

// Start game timer
function startGameTimer() {
    intervalTimer = setInterval(() => {
    timeElapsed++;
    timeLeft--;

    if (timeLeft <= 0) {
      endGame("time");                  
    }
  }, 1000); // every seond for 60sec game
}

// ------------ Drew ------------
function drawEverything() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw MainShip
  context.drawImage(MainSpaceshipImg, MainShip.x, MainShip.y, MainShip.width, MainShip.height);
  drawEnemy();
  drawEnemyBullets();
  drawPlayerBullets();
  // Draw playe's current score
  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText("Score: " + playerCurrentScore, 10, 15);
   // Draw playe's current lifes
   context.fillStyle = "white";
   context.font = "20px Arial";
   context.fillText("Lifes: " + playerLives, 110, 15);
  // Draw game time left
  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText("Time Left: " + timeLeft, 200, 15);
}

function drawEnemy(){
  for (const enemy of enemies) {
    let enemyImg;

    // Drae enemy by type:
    switch (enemy.type) {
      case 1:
        enemyImg = FirstTragetImg;
        break;
      case 2:
        enemyImg = SecondTragetImg;
        break;
      case 3:
        enemyImg = ThirdTragetImg;
        break;
      case 4:
        enemyImg = FourthTragetImg;
        break;
      default:
        continue; // illegal type
    }

    context.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

function drawEnemyBullets() {
  context.fillStyle = "red";
  for (let bullet of enemyBullets) {
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawPlayerBullets() {
  context.fillStyle = "blue"; // Set bullet color
  for (let bullet of playerBullets) {
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

// ------------ UPDATES ------------
// For tracking user's keypress:
const keys = {};
document.addEventListener("keydown", e => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;
  });
document.addEventListener("keyup", e => {
keys[e.key] = false;
});

function update() {
  moveMainShip();
  updateEnemies();
  updateEnemyBullets();
  updatePlayerBullets();
}

// Update posion's help function:
function moveMainShip() {
    const moveAreaHeight = canvas.height * 0.5; // גדל את אזור התנועה של השחקן
    const topLimit = canvas.height - moveAreaHeight;
  
    if (keys["ArrowLeft"] && MainShip.x > 0) {
      MainShip.x -= MainShip.speed;
    }
    if (keys["ArrowRight"] && MainShip.x + MainShip.width < canvas.width) {
      MainShip.x += MainShip.speed;
    }
    if (keys["ArrowUp"] && MainShip.y > topLimit) {
      MainShip.y -= MainShip.speed;
    }
    if (keys["ArrowDown"] && MainShip.y + MainShip.height < canvas.height) {
      MainShip.y += MainShip.speed;
    }
  }

let enemyDirection = 1;  // Horizontal movement direction (1 = right, -1 = left)

let enemyYDirection = 1;     // Vertical shake direction (1 = down, -1 = up)
let enemyYAmplitude = 1;     // Pixels to move vertically each frame (for shaking)
let enemyYTick = 0;          // Frame counter for vertical movement
let enemyYTickLimit = 30;    // How often to reverse vertical direction (every 30 frames)


function updateEnemies() {
  let reachedRightEdge = false;
  let reachedLeftEdge = false;

  if (enemies.length <= 0){
    endGame("enemiesKilled");
  }
  // Check if any enemy ship reached the screen edge
  for (let enemy of enemies) {
    if (enemyDirection === 1 && enemy.x + enemy.width >= canvas.width) {
      reachedRightEdge = true;
    } else if (enemyDirection === -1 && enemy.x <= 0) {
      reachedLeftEdge = true;
    }
  }

  // If reached an edge, reverse direction and move all enemies down a bit
  if (reachedRightEdge || reachedLeftEdge) {
    enemyDirection *= -1;
  }

  // Vertical "shaking" movement logic
  enemyYTick++;
  if (enemyYTick >= enemyYTickLimit) {
    enemyYDirection *= -1; // Reverse vertical direction
    enemyYTick = 0;        // Reset counter
  }

  // Apply movement to each enemy
  for (let enemy of enemies) {
    enemy.x += enemyDirection * enemySpeed;             // Move horizontally
    enemy.y += enemyYDirection * enemyYAmplitude;       // Slight vertical shake
  }
}


function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += enemyBullets[i].speed;

    // delete bullet if exided screen
    if (enemyBullets[i].y > canvas.height) {
      enemyBullets.splice(i, 1);
    }
    if (isColliding(enemyBullets[i], MainShip)){
      playerLives--; 
      resetPlayerShip(); 
      
      // Player Loses!
      if (playerLives <= 0) {
        endGame("lives"); 
      } 
      enemyBullets.splice(i, 1); 
    }
  }
}

function updatePlayerBullets() {
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    // Move the bullet upwards
    playerBullets[i].y -= playerBullets[i].speed;

    // Remove the bullet if it goes off the screen
    if (playerBullets[i].y < 0) {
      playerBullets.splice(i, 1);
      continue;
    }

    // Check for collisions with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (isColliding(playerBullets[i], enemy)) {
        // If a bullet hits an enemy, remove the enemy
        enemies.splice(j, 1);
        // Remove the bullet
        playerBullets.splice(i, 1);
        let reward;
            // Drae enemy by type:
        switch (enemy.type) {
          case 1:
            reward = HIT_FIRST_REWARD;
            break;
          case 2:
            reward = HIT_SECOND_REWARD;
            break;
          case 3:
            reward = HIT_THIRD_REWARD;
            break;
          case 4:
            reward = HIT_FOURTH_REWARD;
            break;
          default:
            continue; // illegal type
        }
        playerCurrentScore += reward;
        break;
      }
    }
  }
}
function resetPlayerShip() {
  MainShip.x = canvas.width / 2
  MainShip.y = canvas.height - 60; 
}

function isColliding(rect1, rect2) {
    if (!rect1 || !rect2){
        return false;
    }
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}
// ------------ SHOOT ------------
// Add to enemyBullets aray new bullet to shoot 
function shootEnemyBullet() {
  // Filter enemies that still avaible
  const availableEnemies = enemies.filter(e => e.y < canvas.height);

  if (availableEnemies.length === 0) return;

  // implement the ¾ demand
  if (enemyBullets.length > 0) {
    const lastBullet = enemyBullets[enemyBullets.length - 1];
    if (lastBullet.y < canvas.height * 0.75) return;
  }

  const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

  const bullet = {
    x: randomEnemy.x + randomEnemy.width / 2 - 2,
    y: randomEnemy.y + randomEnemy.height,
    width: 4,
    height: 10,
    speed: 2 + enemySpeed * 0.5 // regard to enemy's speed
  };

  enemyBullets.push(bullet);
}
setInterval(shootEnemyBullet, 700);

let canShoot = true;

// Listener for player shoot
document.addEventListener("keydown", function(e) {
  if (e.key === " ") { // spacebar to shoot - change it later
    if (canShoot){
    shootPlayerBullet();
    HitTargetSound.play();
    canShoot = false;
    // Match setTimeout to audio time playing
    setTimeout(() => canShoot = true, 1000);
    }
  }
});

function shootPlayerBullet() {
  const bullet = {
    x: MainShip.x + MainShip.width / 2 - 2, // Center the bullet on the ship
    y: MainShip.y, // Start from the ship's current position
    width: 4,
    height: 10,
    speed: playerBulletSpeed
  };

  playerBullets.push(bullet);
}


// ------------ LOOP ------------
let GameLoopId;
function GameLoop(){
  update();
  drawEverything();
  if (playerLives > 0){
  GameLoopId = requestAnimationFrame(GameLoop);
}
}


// Put this in your register/login logic
const currentPlayerName = document.getElementById("regUser").value;
sessionStorage.setItem("username", currentPlayerName);

// Function to save and return score list and rank
function saveScore() {
    const userNameKey = "scores_" + sessionStorage.getItem("username");
    let scores = JSON.parse(localStorage.getItem(userNameKey)) || [];
    
    scores.push(playerCurrentScore);
    scores.sort((a, b) => b - a); // Sort descending
    scores = scores.slice(0, 10); // Top 10 only

    localStorage.setItem(userNameKey, JSON.stringify(scores));
    
    return { scores, rank: scores.indexOf(playerCurrentScore) + 1 };
}



function endGame(reason) {
  cancelAnimationFrame(GameLoopId); 
  context.clearRect(0, 0, canvas.width, canvas.height); 
  clearInterval(intervalTimer);


  let message = "";
  if (reason === "lives") {
    message = "You Lost!";
  } else if (reason === "time") {
    if (playerCurrentScore < 100) {
      message = "You can do better";
    } else {
      message = "Winner!";
    }
  } else if (reason === "enemiesKilled") {
    message = "Champion!";
  }

  const { scores, rank } = saveScore();

  document.getElementById("endMessage").textContent = message;
  document.getElementById("endScore").textContent = `Your Score: ${playerCurrentScore}.\nYour Rank: ${rank}`;

  const scoreList = document.getElementById("scoreHistory");
  document.getElementById("endScore").innerHTML = `Your Score: ${playerCurrentScore}<br>Your Rank: ${rank}`;
  scoreList.innerHTML = "";
  scores.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `#${i + 1}: ${s}`;
    scoreList.appendChild(li);
  });
  document.getElementById("endScreen").style.display = "flex";
}

function restartGame() {
  document.getElementById("endScreen").style.display = "none";
  location.reload(); // reloading page 
}

  // // Let user pick a ship:
  // let selectedSpaceship = null;
  // document.querySelector('.spaceship-option').forEach(img => {
  //   img.addEventListener('click', () => {
  //     document.querySelectorAll('.spaceship-option').forEach(i => i.classList.remove('selected'));
  //     img.classList.add('selected');
  //     selectedSpaceship = img.dataset.path;
  //   });
  // });
  // MainSpaceshipImg.src = selectedSpaceship;