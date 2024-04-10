let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let birdWidth = 62;
let birdHeight = 44;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let bird;

let pipeArray = [];
let coinArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let coinImg;

let velocityX = -2;
let velocityY;
let gravity = 0.4;

let gameOver;
let score;
let animationId;
let pipeIntervalId;

let playerName = localStorage.getItem('playerName') || null; // Get player name from local storage or set to null

window.onload = function() {
    // Initialize the game
    initializeGame();

    // Populate the leaderboard
    populateLeaderboard();
}

function initializeGame() {
    if (!playerName) {
        playerName = prompt("Please enter your name:"); // Prompt user for name if not set
        localStorage.setItem('playerName', playerName); // Save player name to local storage
    }

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };
    pipeArray = [];
    coinArray = [];
    velocityY = 0;
    gameOver = false;
    score = 0;

    birdImg = new Image();
    birdImg.src = "photo-output.png";

    topPipeImg = new Image();
    topPipeImg.src = "IMG-5346.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "IMG-5345.png";

    coinImg = new Image();
    coinImg.src = "photo-output.jpg";

    if (pipeIntervalId) {
        clearInterval(pipeIntervalId);
    }
    pipeIntervalId = setInterval(placePipes, 1500);

    animationId = requestAnimationFrame(update);
}

function update() {
    animationId = requestAnimationFrame(update);
    if (gameOver) {
        showGameOver();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    velocityY += gravity;
    bird.y += velocityY;
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y + bird.height < 0 || bird.y > boardHeight) {
        gameOver = true;
        recordScore(); // Record score when game over
        return;
    }

    pipeArray.forEach(pipe => {
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            recordScore(); // Record score when game over
        }
    });

    coinArray.forEach((coin, index) => {
        coin.x += velocityX;
        if (!coin.collected) {
            context.drawImage(coin.img, coin.x, coin.y, coin.width, coin.height);

            if (detectCollision(bird, coin)) {
                // score += 1; // Linha removida para que as moedas não contem pontos.
                coin.collected = true;
                coinArray.splice(index, 1);
            }
        }
    });

    pipeArray = pipeArray.filter(pipe => pipe.x + pipeWidth > 0);
    coinArray = coinArray.filter(coin => coin.x + coin.width > 0);

    context.fillStyle = "black";
    context.font = "45px sans-serif";
    context.fillText(score,5, 45);
}

function recordScore() {
    const currentDate = new Date().toLocaleDateString();
    const leaderboardEntry = { name: playerName, score: score, date: currentDate };

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []; // Get leaderboard from local storage or initialize empty array
    leaderboard.push(leaderboardEntry);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard)); // Save updated leaderboard to local storage

    // Refresh leaderboard display
    populateLeaderboard();
}

function populateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; // Clear existing entries

    // Retrieve leaderboard data from local storage
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Sort leaderboard entries by score (descending order)
    leaderboardData.sort((a, b) => b.score - a.score);

    // Display up to top 10 leaderboard entries
    const numEntriesToShow = Math.min(leaderboardData.length, 10);
    for (let i = 0; i < numEntriesToShow; i++) {
        const entry = leaderboardData[i];
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score} (${entry.date})`;
        leaderboardList.appendChild(listItem);
    }
}

// Rest of the code remains unchanged...
