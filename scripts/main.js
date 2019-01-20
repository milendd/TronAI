function GameCore() {
    this.width = defaultWidth;
    this.height = defaultHeight;
    this.playerScore = 0;
    this.currentLevel = 1;
    this.currentLives = 3;
    this.speed = 5;
    this.stateStack = [];
    this.playerPressedKeys = {};
    this.ctx = null;
    this.isGameStared = false;
    
    this.pressed = function(keyCode) {
        this.playerPressedKeys[keyCode] = true;
        var currentState = getCurrentState();
        if (currentState && currentState.keyDown) {
            currentState.keyDown(keyCode);
        }
    };
    
    this.released = function(keyCode) {
        delete this.playerPressedKeys[keyCode];
        var currentState = getCurrentState();
        if (currentState && currentState.keyUp) {
            currentState.keyUp(keyCode);
        }
    };

    this.addPlayerMove = function(x, y) {
        this.playerPositions[x][y] = true;
        this.playerLastMove = { x: x, y: y };
    };

    // Set start positions
    this.playerPositions = createMultiArray(20 * 3, 26 * 3);
    this.playerDirection = "left";
    this.playerLastMove = null;
    this.addPlayerMove(29, 64);
}

function getCurrentState() {
    if (game.stateStack.length > 0) {
        var lastIndex = game.stateStack.length - 1;
        return game.stateStack[lastIndex];
    }
    
    return null;
}

function setState(state) {
    var currentState = getCurrentState();
    if (currentState) {
        game.stateStack.pop();
    }
    
    game.stateStack.push(state);
}

function attachListeners() {
    window.addEventListener('keydown', function keydown(e) {
        var keycode = e.which || window.event.keycode;
        // 32: space, 37: left arrow, 39: right arrow
        if (keycode == 32 || keycode == 37 || keycode == 38 || keycode == 39 || keycode == 40) {
            e.preventDefault();
        }
        
        game.pressed(keycode);
    });

    window.addEventListener('keyup', function keydown(e) {
        var keycode = e.which || window.event.keycode;
        game.released(keycode);
    });
    
    var canvas = document.getElementById("mainCanvas");
    canvas.width = game.width;
    canvas.height = game.height;
    
    game.ctx = canvas.getContext("2d");
}

function executeMainLoop() {
    var currentState = getCurrentState();
    if (currentState) {
        var time = 0.04;
        var ctx = game.ctx;

        if (currentState.update) {
            currentState.update(time);
        }
        
        if (currentState.draw) {
            currentState.draw(time, ctx);
        }
    }
}

function WelcomeState() {
    this.draw = function(time, ctx) {
        ctx.clearRect(0, 0, game.width, game.height);
        ctx.font="28px Arial";
        ctx.fillStyle="#000000";
        ctx.textBaseline="center";
        ctx.textAlign="center";
        ctx.fillText("Tron 2.0", game.width / 2, game.height/2 - 40);
        ctx.font="16px Arial";
        ctx.fillText("Press 'Space' to play.", game.width / 2, game.height/2);
    };

    this.keyDown = function(keyCode) {
        // 32: space
        if (keyCode == 32) {
            setState(new PlayState());
        }
    };
}

function PlayState() {
    var background = new Image();
    background.src = defaultBackground;

    var playerTurboImg = new Image();
    playerTurboImg.src = './images/player_turbo.png';
    
    var enemyTurboImg = new Image();
    enemyTurboImg.src = './images/enemy_turbo.png';
    
    this.draw = function(dt, ctx){
        ctx.clearRect(0, 0, game.width, game.height);
        ctx.drawImage(background, 0, 0, game.width, game.height);
        ctx.fillStyle = '#555555';

        function displayPositions(img, data) {
            var startX = 37;
            var startY = 90;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[0].length; j++) {
                    if (data[i][j]) {
                        var middleY = parseInt(i % 3);
                        var middleX = parseInt(j % 3);
                        var displayY = startY + i * 7 + parseInt(i / 3);
                        var displayX = startX + j * 7 + parseInt(j / 3);
                        var sizeY = 7;
                        var sizeX = 7;

                        if (middleY == 0 && i != 0) {
                            displayY--;
                            sizeY++;
                        }
                        
                        if (middleX == 0 && j != 0) {
                            displayX--;
                            sizeX++;
                        }
                        
                        ctx.drawImage(img, displayX, displayY, sizeX, sizeY);
                    }
                }
            }
        }

        displayPositions(playerTurboImg, game.playerPositions);
    };
    
    // This method changes the position of the players
    // It refreshes based on defaultTime miliseconds
    this.update = function() {
        if (!game.isGameStared) {
            game.isGameStared = true;
        }
        else {
            this.updatePlayerPositions();

            // TODO: 
            if (game.currentLives < 1) {
                setState(new GameOver());
            }
        }
    };

    this.updatePlayerPositions = function () {
        var newX = undefined;
        var newY = undefined;
        if (game.playerDirection == "left") {
            newX = game.playerLastMove.x;
            newY = game.playerLastMove.y - 1;
        }
        else if (game.playerDirection == "right") {
            newX = game.playerLastMove.x;
            newY = game.playerLastMove.y + 1;
        }
        else if (game.playerDirection == "up") {
            newX = game.playerLastMove.x - 1;
            newY = game.playerLastMove.y;
        }
        else if (game.playerDirection == "down") {
            newX = game.playerLastMove.x + 1;
            newY = game.playerLastMove.y;
        }
        
        game.addPlayerMove(newX, newY);
    }

    this.keyUp = function(keyCode) {
        debugger;
        if (keyCode == 37) { 
            game.playerDirection = "left";
        }
        else if (keyCode == 39) { 
            game.playerDirection = "right";
        }
        else if (keyCode == 38) { 
            game.playerDirection = "up";
        }
        else if (keyCode == 40) { 
            game.playerDirection = "down";
        }
    };
}

function createMultiArray(x, y) {
    var result = new Array(x);

    for (var i = 0; i < x; i++) {
        result[i] = new Array(y);
        for (var j = 0; j < y; j++) {
            result[i][j] = false;
        }
    }
    
    return result;
}

var defaultBackground = './images/background.png';
var defaultWidth = 644;
var defaultHeight = 556;
var updateTime = 500; // Miliseconds
var game = new GameCore();

attachListeners();
setState(new WelcomeState());

setInterval(function() { executeMainLoop(game); }, updateTime);
//executeMainLoop(game);