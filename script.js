// init users array with default user creds

let users = [{
            username: "p",
            password: "testuser"
          }]
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(div => div.classList.add("hidden"));
  const next = document.getElementById(screenId);
  next.classList.remove("hidden");

  const logo = document.getElementById("logo");
  logo.classList.add("animate");
  setTimeout(() => logo.classList.remove("animate"), 600);
}


function validateRegistration() {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;
  const confirm = document.getElementById("regConfirm").value;
  const first = document.getElementById("firstName").value;
  const last = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;

  const errorElement = document.getElementById("registerError");
  errorElement.textContent = "";

  const nameRegex = /^[a-zA-Zא-ת]+$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameRegex.test(first) || !nameRegex.test(last)) {
    errorElement.textContent = "First and Last names must contain letters only.";
    return false;
  }
  if (!passRegex.test(pass)) {
    errorElement.textContent = "Password must include at least 8 characters, letters and numbers.";
    return false;
  }
  if (pass !== confirm) {
    errorElement.textContent = "Passwords do not match.";
    return false;
  }
  if (!emailRegex.test(email)) {
    errorElement.textContent = "Invalid email format.";
    return false;
  }

  users.push({
    username: user,
    password: pass
  });

  console.log(users);
  errorElement.textContent = "Registration successful!";
  showScreen('login');
  return true;
}

// catch current user username and history list
let currentUser;
let highScores;
function login() {
  console.log(users);

  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;
  const error = document.getElementById("loginError");
  console.log(users.length);

  let found = false;

  for (let i = 0; i < users.length; i++) {
      if (users[i].username === user && users[i].password === pass) {
          found = true;
          break;
      }
  }

  if (found) {
    currentUser = user;
    highScores = [];
    showScreen("config");  
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

let shootKey = " ";

function setShootKey(event) {
  const shootInput = document.getElementById('fireKey');
  if (event.key === " ") { 
      event.preventDefault();
      // for desplay Space as chosen key
      shootInput.value = "Space";
  }
  else {
    shootInput.value = event.key; // Otherwise, show the chosen key
  }
  
  // for test input and game manage
  shootKey = event.key;
}

// listener for shoot key input (time and color input are not need any listener!)
function shootConfig() {
  const shootInput = document.getElementById('fireKey');

  shootInput.addEventListener('focus', function () {
      document.addEventListener('keydown', setShootKey);
  });

  shootInput.addEventListener('blur', function () {
      document.removeEventListener('keydown', setShootKey);
  });

}

shootConfig();


let gameTime;
let spaceshipColor;
var heroShipImg = new Image();
const FirstTragetImg = new Image();
const SecondTragetImg = new Image();
const ThirdTragetImg = new Image();
const FourthTragetImg = new Image();

document.getElementById('startButton').addEventListener('click', getUserConfiguration);

function getUserConfiguration(event) {
    event.preventDefault(); 

    // const fireKeyInput = document.getElementById('fireKey');
    const gameTimeInput = document.getElementById('gameTime');
    const shipColorSelect = document.getElementById('shipColor');
    const errorParagraph = document.getElementById('configError');

    // shootKey = fireKeyInput.value;
    gameTime = parseInt(gameTimeInput.value, 10) * 60; //for seconds
    spaceshipColor = shipColorSelect.value;

    errorParagraph.textContent = '';

    // valid test
    const validKeyRegex = /^[a-zA-Z ]$/;
    if (!validKeyRegex.test(shootKey)) {
        errorParagraph.textContent = "You must select a fire key: A-Z, a-z, or space.";
        return false;
    }
    if (isNaN(gameTime) || gameTime < 2) {
      errorParagraph.textContent = "Game time must be at least 2 minutes.";
      return false;
  }

  if (!spaceshipColor) {
      errorParagraph.textContent = "You must select a spaceship color.";
      return false;
  }

  // load spaceships imgs before enter game
  FirstTragetImg.src = "images/BadShips/BadBlueShip.png";
  SecondTragetImg.src = "images/BadShips/BadRedShip.png";
  ThirdTragetImg.src = "images/BadShips/BadWhiteShip.png";
  FourthTragetImg.src = "images/BadShips/BadYellowShip.png";  

  heroShipImg.src = `images/MainShips/spaceship_${spaceshipColor}.png`;

  heroShipImg.onload = () => {
    startGame();
  };
}


const canvas = document.getElementById('theCanvas');
const context = canvas.getContext('2d');
canvas.width = 1100;
canvas.height = 619; 

let GameOver = false;
let enemies = [];
let enemyBullets = [];
let playerBullets = [];
let playerBulletSpeed = 5;

const HIT_FIRST_REWARD = 20; // points added on a hit
const HIT_SECOND_REWARD = 15; // points added on a hit
const HIT_THIRD_REWARD = 10; // points added on a hit
const HIT_FOURTH_REWARD = 5; // points added on a hit

let player;
let playerLives = 3;
let playerCurrentScore = 0; 

let enemySpeedInterval;
let enemyShootInterval;
let gameTimerInterval;

let enemySpeed = 5;  // init horizontal movement speed for enemies (will increased lineraric)
let enemySpeedIncreaseCounter = 0;

let keys = {};
let canShoot = true;


let enemyDirection = 1;  // Horizontal movement direction (1 = right, -1 = left)
let enemyYDirection = 1;     // Vertical shake direction (1 = down, -1 = up)
let enemyYAmplitude = 1;     // Pixels to move vertically each frame (for shaking)
let enemyYTick = 0;          // Frame counter for vertical movement
let enemyYTickLimit = 30;    // How often to reverse vertical direction (every 30 frames)


let shootSound = new Audio('Sounds/shoot.mp3');
let backgoundSound = new Audio('Sounds/background.mp3');
// looping till end game
backgoundSound.addEventListener('ended', function() {
  backgoundSound.play(); 
});
let loseSound = new Audio('Sounds/lose.mp3');
let hitSound = new Audio('Sounds/hit.mp3');


function handleKeyDown(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key] = true;

    const shooting = shootKey;
    if (e.key === shooting) { 
        if (canShoot) {
            shootPlayerBullet();
            shootSound.play();
            canShoot = false;
            setTimeout(() => canShoot = true, 500);
        }
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}


function update() {
  updatePlayer();
  updateEnemies();
  updateEnemyBullets();
  updatePlayerBullets();
}

function updatePlayer() {
  if (GameOver) return;
  const moveAreaHeight = canvas.height * 0.5; 
  const topLimit = canvas.height - moveAreaHeight;

  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }
  if (keys["ArrowUp"] && player.y > topLimit) {
    player.y -= player.speed;
  }
  if (keys["ArrowDown"] && player.y + player.height < canvas.height) {
    player.y += player.speed;
  }
}


function updateEnemies() {
  if (GameOver) return;
  let reachedRightEdge = false;
  let reachedLeftEdge = false;

  if (enemies.length <= 0){
    GameOver = true;
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
  if (GameOver) return;
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += enemyBullets[i].speed;

    // delete bullet if exided screen
    if (enemyBullets[i].y > canvas.height) {
      enemyBullets.splice(i, 1);
    }
    if (isColliding(enemyBullets[i], player)){
      loseSound.play();
      playerLives--; 
      resetPlayerShip(); 
      // Player Loses!
      if (playerLives <= 0) {
        GameOver = true;
        endGame("lives"); 
      } 
      enemyBullets.splice(i, 1); 
    }
  }
}



function updatePlayerBullets() {
  if (GameOver) return;
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
        hitSound.play();
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


// Adding to enemyBullets array new bullet to shoot 
function shootEnemyBullet() {
  if (GameOver) return;
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



function shootPlayerBullet() {
  if (GameOver) return;
  const bullet = {
    x: player.x + player.width / 2 - 2, // Center the bullet on the ship
    y: player.y, // Start from the ship's current position
    width: 4,
    height: 10,
    speed: playerBulletSpeed
  };

  playerBullets.push(bullet);
}



function resetPlayerShip() {
  if (GameOver) return;
  player = {x : (canvas.width / 2) - 50, y : canvas.height * 0.8, width : 50, height : 50, speed : 10};
}

function isColliding(rect1, rect2) {
  if (GameOver) return;
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

function drawEverything() {
  if (GameOver) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw player
  context.drawImage(heroShipImg, player.x, player.y, player.width, player.height);

  drawEnemy();
  drawEnemyBullets();
  drawPlayerBullets();


document.getElementById("score").textContent = playerCurrentScore;
document.getElementById("lives").textContent = playerLives;
document.getElementById("time").textContent = gameTime + "s";

}


function drawEnemy(){
  if (GameOver) return;
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
function drawPlayerBullets() {
  if (GameOver) return;
  for (let bullet of playerBullets) {
    const gradient = context.createRadialGradient(
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      0,
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      10
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#66ccff");

    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(bullet.x + 2, bullet.y + 5, 4, 10, 0, 0, 2 * Math.PI);
    context.fill();
  }
}

function drawEnemyBullets() {
  if (GameOver) return;
  for (let bullet of enemyBullets) {
    const gradient = context.createRadialGradient(
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      0,
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      10
    );
    gradient.addColorStop(0, "#ffaa00");
    gradient.addColorStop(1, "#ff3300");

    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(bullet.x + 2, bullet.y + 5, 4, 10, 0, 0, 2 * Math.PI);
    context.fill();
  }
}

// Incresing the enemy Speed
function increaseEnemySpeed(){
  if (GameOver) return;
  if(enemySpeedIncreaseCounter < 4){
      enemySpeed *= 1.2;
      enemySpeedIncreaseCounter++;
  }
}

function StartTimer(){
  if (GameOver) return;
  gameTimerInterval = setInterval(() => {
      if(GameOver){
          clearInterval(gameTimerInterval);
          return;
      }
      
      gameTime--;

      if(gameTime <= 0){
          clearInterval(gameTimerInterval);
          GameOver = true;
          endGame("time");
          return;
      }

  }, 1000);
}

let GameLoopId;
// Loop of the game
function gameLoop() {
  if (GameOver) return;
    update();
    drawEverything();
    GameLoopId = requestAnimationFrame(gameLoop);
  
}

function startEnemies() {
  if (GameOver) return;
  const rows = 4;
  const cols = 5;
  const enemyWidth = 70;
  const enemyHeight = 60;
  const gapX = 20;    // גדל את המרחק האופקי בין האויבים
  const gapY = 5;    // גדל את המרחק האנכי בין האויבים
  const startX = 120; // התאם את נקודת ההתחלה האופקית
  const startY = 10;  // התחל גבוה יותר בקנבס

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const enemy = {
        x: startX + col * (enemyWidth + gapX),
        y: startY + row * (enemyHeight + gapY),
        width: enemyWidth,
        height: enemyHeight,
        type: row + 1 
      };
      enemies.push(enemy);
    }
  }
}

// Start the Game
function startGame() {
  if (GameOver) return;
  console.log("start game");
  if (GameLoopId) {
    cancelAnimationFrame(GameLoopId);
    GameLoopId = null;
  }

  showScreen('game');
  console.log("back sound");

  backgoundSound.play();
  window.scrollTo(0, 0);

  console.log("init player");
  player = {x : (canvas.width / 2) - 50, y : canvas.height * 0.8, width : 50, height : 50, speed : 10};
  console.log("init enemies");
  startEnemies();

  console.log("init listers");
  //add event listers
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  console.log("init interval");
  // Every 5 Secound calls the function to increase enemy speed
  enemySpeedInterval = setInterval(increaseEnemySpeed, 5000);
  // Every 7 Secound enemy shoots
  enemyShootInterval = setInterval(shootEnemyBullet, 700);

  StartTimer();
  console.log("start game loop");
  gameLoop();
}


// Gane Over Screen
function endGame(reason) {
  console.log(reason);
  if (GameLoopId) {
    cancelAnimationFrame(GameLoopId);
    GameLoopId = null;
    console.log("cancel animation")
  }  

  // clear intervals
  clearInterval(enemySpeedInterval);
  clearInterval(enemyShootInterval);
  clearInterval(gameTimerInterval);

  backgoundSound.pause();

  // remove event listenrs
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);

  // current game rank msg
  let message = "";
    if (reason === "lives") {
      message = "You Lost!";
    } else if (reason === "time") {
      message = playerCurrentScore < 100 ? "You can do better" : "Winner!";
    } else if (reason === "enemiesKilled") {
      message = "Champion!";
    } else if (reason === "buttonClicked") {
      message = "Game Ended via Button Click";
    }


  const messageElement = document.getElementById('endMessage');
  messageElement.innerText = message;

  document.getElementById('endScore').innerText = playerCurrentScore;


  // Save the current game result
  let current = {
      score: playerCurrentScore,
  };

  highScores.push(current);

  // Sort by score descending
  highScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
  });

  // Assign rank to each entry
  highScores.forEach((entry, index) => {
      entry.rank = index + 1;
  });

  // Keep only the top 5 scores
  highScores = highScores.slice(0, 5);

  // Render the high score table
  renderHighScores();

  document.getElementById("endScreen").style.display = "flex";
}

// Show hige score table
function renderHighScores() {
  const scoreHistory = document.getElementById('scoreHistory');
  scoreHistory.innerHTML = '';

  highScores.forEach((entry, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="rank-num">${i + 1}.</span> <span class="score-val">${entry.score} pts</span>`;

    if (i + 1 === entry.rank) {
      li.classList.add("highlight-player");
    }
    // add current score to list
    scoreHistory.appendChild(li);
  });
}

// Two option: [1] same user wants to restart the game. [2] the user wants to end game so he wants to go back to welcome home page
// Reastart the game and go back to the same user
function restartGame(){
  resetGame();
  resetConfigurationScreen();
  showScreen('config');
}

// Reastart the game and go back to the Home screen
function restartGame_andHome(){
    resetGame();
    resetConfigurationScreen();
    showScreen('welcome');
}

// Restart the game
function resetGame(){
  document.getElementById("endScreen").style.display = "none";
  // Reset game variables
  GameOver = false;
  enemies = [];
  enemyBullets = [];
  playerBullets = [];
  playerBulletSpeed = 5;
  
  playerLives = 3;
  playerCurrentScore = 0; 
  
  enemySpeed = 5;  // init horizontal movement speed for enemies (will increased lineraric)
  enemySpeedIncreaseCounter = 0;

  keys = {};
  canShoot = true;
  
  enemyDirection = 1;  // Horizontal movement direction (1 = right, -1 = left)
  enemyYDirection = 1;     // Vertical shake direction (1 = down, -1 = up)
  enemyYAmplitude = 1;     // Pixels to move vertically each frame (for shaking)
  enemyYTick = 0;          // Frame counter for vertical movement
  enemyYTickLimit = 30;    // How often to reverse vertical direction (every 30 frames)
}

// If start a new game it will reset the old Settings
function resetConfigurationScreen(){
  document.getElementById('fireKey').value = '';
  document.getElementById('gameTime').value = 2;

  shootKey = ' ';
  spaceshipColor = '';
}