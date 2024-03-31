let board = null;
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

function initializeGame() {
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
    birdImg.src = "https://i.ibb.co/FBjyhWH/photo-output.png";

    topPipeImg = new Image();
    topPipeImg.src = "https://i.ibb.co/hdP1Brx/IMG-5346.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "https://i.ibb.co/MgvYFtC/IMG-5345.png";

    coinImg = new Image();
    coinImg.src = "https://i.ibb.co/fG3296n/photo-output.jpg";

    if (pipeIntervalId) {
        clearInterval(pipeIntervalId);
    }
    pipeIntervalId = setInterval(placePipes, 1500);

    animationId = requestAnimationFrame(update);
}

window.onload = function() {
    initializeGame();
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", handleTouch, false);
    board.addEventListener("click", handleRestart, false);
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
        }
    });

    coinArray.forEach((coin, index) => {
        coin.x += velocityX;
        if (!coin.collected) {
            context.drawImage(coin.img, coin.x, coin.y, coin.width, coin.height);

            if (detectCollision(bird, coin)) {
                score += 1;
                coin.collected = true;
                coinArray.splice(index, 1);
            }
        }
    });

    pipeArray = pipeArray.filter(pipe => pipe.x + pipeWidth > 0);
    coinArray = coinArray.filter(coin => coin.x + coin.width > 0);

    context.fillStyle = "black";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
}

function placePipes() {
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);

    let coinY = randomPipeY + pipeHeight + openingSpace / 2;
    let coin = {
        img: coinImg,
        x: pipeX + 20,
        y: coinY - 15,
        width: 30,
        height: 30,
        collected: false
    };
    coinArray.push(coin);
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        velocityY = -6;
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (!gameOver) {
        velocityY = -6;
    } else {
        restartGame();
    }
}

function handleRestart(e) {
    if (gameOver) {
        restartGame();
    }
}

function restartGame() {
    cancelAnimationFrame(animationId);
    initializeGame();
}

function showGameOver() {
    context.fillStyle = "black";
    context.font = "45px sans-serif";
    context.fillText("GAME OVER", boardWidth / 2 - context.measureText("GAME OVER").width / 2, boardHeight / 2);
}

function detectCollision(bird, object) {
    let birdLeft = bird.x;
    let birdRight = bird.x + bird.width;
    let birdTop = bird.y;
    let birdBottom = bird.y + bird.height;

    let objectLeft = object.x;
    let objectRight = object.x + object.width;
    let objectTop = object.y;
    let objectBottom = object.y + object.height;

    return birdRight > objectLeft &&
           birdLeft < objectRight &&
           birdBottom > objectTop &&
           birdTop < objectBottom;
}
