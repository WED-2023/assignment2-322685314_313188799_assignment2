const users = [{ username: "p", password: "testuser" }];

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(div => div.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

function validateRegistration() {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;
  const confirm = document.getElementById("regConfirm").value;
  const first = document.getElementById("firstName").value;
  const last = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;

  const nameRegex = /^[a-zA-Zא-ת]+$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameRegex.test(first) || !nameRegex.test(last)) {
    alert("First and Last names must contain letters only.");
    return false;
  }
  if (!passRegex.test(pass)) {
    alert("Password must include at least 8 characters, letters and numbers.");
    return false;
  }
  if (pass !== confirm) {
    alert("Passwords do not match.");
    return false;
  }
  if (!emailRegex.test(email)) {
    alert("Invalid email format.");
    return false;
  }

  users.push({ username: user, password: pass });
  alert("Registration successful!");
  showScreen('login');
  return false;
}

function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;
  const error = document.getElementById("loginError");

  const found = users.find(u => u.username === user && u.password === pass);
  if (found) {
    showScreen("game");
    error.textContent = "";
  } else {
    error.textContent = "Incorrect username or password.";
  }
}

function openAbout() {
  document.getElementById("aboutModal").classList.remove("hidden");
}

function closeAbout() {
  document.getElementById("aboutModal").classList.add("hidden");
}

// close with esc
window.addEventListener("keydown", function(e) {
  const modal = document.getElementById("aboutModal");

  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    e.preventDefault();     
    e.stopImmediatePropagation(); 
    closeAbout();
  }
});

// close with click outside the window
window.addEventListener("click", function(e) {
  const modal = document.getElementById("aboutModal");
  if (e.target === modal) {
    closeAbout();
  }
});

// Initialization
window.onload = function () {
  const day = document.getElementById("birthDay");
  const month = document.getElementById("birthMonth");
  const year = document.getElementById("birthYear");
  for (let d = 1; d <= 31; d++) day.innerHTML += `<option>${d}</option>`;
  for (let m = 1; m <= 12; m++) month.innerHTML += `<option>${m}</option>`;
  for (let y = 2025; y >= 1900; y--) year.innerHTML += `<option>${y}</option>`;
  showScreen("welcome");
};

// ************************************Game Implementation************************************

// ------------ Vars and Consts ------------
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var playerLives = 3; // number of nullification
var playerScore = 0; 
const HIT_FIRST_REWARD = 20; // points added on a hit
const HIT_SECOND_REWARD = 15; // points added on a hit
const HIT_THIRD_REWARD = 10; // points added on a hit
const HIT_FOURTH_REWARD = 5; // points added on a hit
var enemySpeed = 1;         // init horizontal movement speed for enemies

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timeLeft = 60; // the amount of time left in seconds
var timeElapsed = 0; // the number of seconds elapsed

// variables for the bad and main ship's bullets
const enemies = [];
const enemyBullets = [];
const playerBullets = [];
const playerBulletSpeed = 5; // enemy's bullet speed should match the current enemies speed!

// variables for sounds
var BackgroundSound;
var HitTargetSound;
var NullificationSound;

let currentPlayerName = "";
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
  const storedPlayer = localStorage.getItem("user");
  if (storedPlayer !== currentPlayerName) {
    localStorage.setItem("user", currentPlayerName);
    localStorage.setItem("scoreHistory", JSON.stringify([])); // מאפס היסטוריה
  }
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
   context = canvas.getContext("2d");



  //  Start MainShip and enemies positions
   MainShip  = { x: canvas.width / 2, y: canvas.height - 60, width: 40, height: 60, speed: 5 };
  setupEnemies();

   // get sounds
   BackgroundSound = document.getElementById( "backgroundSound" );
   HitTargetSound = document.getElementById( "hitSound" );
   NullificationSound = document.getElementById( "loseSound" );

} // end function setupGame

function setupEnemies() {
  const rows = 4;
  const cols = 5;
  const enemyWidth = 60;
  const enemyHeight = 60;
  const gapX = 60;
  const gapY = 30;
  const startX = 100;
  const startY = 50;

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
  context.fillText("Score: " + playerScore, 10, 20);
   // Draw playe's current lifes
   context.fillStyle = "white";
   context.font = "20px Arial";
   context.fillText("Lifes: " + playerLives, 110, 20);
  // Draw game time left
  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText("Time Left: " + timeLeft, 200, 20);
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
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => delete keys[e.key]);

function update() {
  moveMainShip();
  updateEnemies();
  updateEnemyBullets();
  updatePlayerBullets();
}

// Update posion's help function:
function moveMainShip() {
  const moveAreaHeight = canvas.height * 0.4;
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
        playerScore += reward;
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

// Listener for player shoot
document.addEventListener("keydown", function(e) {
  if (e.key === " ") { // spacebar to shoot - change it later
    shootPlayerBullet();
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

function endGame(reason) {
  cancelAnimationFrame(GameLoopId); 
  context.clearRect(0, 0, canvas.width, canvas.height); 
  clearInterval(intervalTimer);

  // שמירת ציון
  let history = JSON.parse(localStorage.getItem("scoreHistory")) || [];
  history.push(playerScore);
  history.sort((a, b) => b - a); 
  localStorage.setItem("scoreHistory", JSON.stringify(history));

  const rank = history.indexOf(playerScore) + 1;

  let message = "";
  if (reason === "lives") {
    message = "You Lost!";
  } else if (reason === "time") {
    if (playerScore < 100) {
      message = "You can do better";
    } else {
      message = "Winner!";
    }
  } else if (reason === "enemiesKilled") {
    message = "Champion!";
  }

  document.getElementById("endMessage").textContent = message;
  document.getElementById("endScore").textContent = `Your Score: ${playerScore} (Rank #${rank})`;
  
  const highScoresDiv = document.getElementById("highScores");
  highScoresDiv.innerHTML = "<h3>Your High Scores:</h3><ol>" +
    history.map(score => `<li>${score}</li>`).join("") +
    "</ol>";


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