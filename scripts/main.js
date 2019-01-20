function GameCore() {
    this.width = defaultWidth;
    this.height = defaultHeight;
    this.playerScore = 0;
    this.currentLevel = 1;
    this.currentLives = 3;
    this.speed = 5;
    this.stateStack = [];
    this.pressedKeys = {};
    this.ctx = null;
    
    this.pressed = function(keyCode) {
        this.pressedKeys[keyCode] = true;
        var currentState = getCurrentState();
        if (currentState && currentState.keyDown) {
            currentState.keyDown(this, keyCode);
        }
    };
    
    this.released = function(keyCode) {
        delete this.pressedKeys[keyCode];
        var currentState = getCurrentState();
        if (currentState && currentState.keyUp) {
            currentState.keyUp(this, keyCode);
        }
    };
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
        if (keycode == 32 || keycode == 37 || keycode == 39) {
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

function executeMainLoop(game) {
    var currentState = getCurrentState();
    if (currentState) {
        var time = 0.04;
        var ctx = game.ctx;

        if (currentState.update) {
            currentState.update(game, time);
        }
        
        if (currentState.draw) {
            currentState.draw(game, time, ctx);
        }
    }
}

function WelcomeState() {
    this.draw = function(game, time, ctx) {
        ctx.clearRect(0, 0, game.width, game.height);
        ctx.font="28px Arial";
        ctx.fillStyle="#000000";
        ctx.textBaseline="center";
        ctx.textAlign="center";
        ctx.fillText("Tron 2.0", game.width / 2, game.height/2 - 40);
        ctx.font="16px Arial";
        ctx.fillText("Press 'Space' to play.", game.width / 2, game.height/2);
    };

    this.keyDown = function(game, keyCode) {
        // 32: space
        if (keyCode == 32) {
            setState(new PlayState());
        }
    };
}

function PlayState() {
    var background = new Image();
    background.src = defaultBackground;
    
    this.draw = function(game, dt, ctx){
        ctx.clearRect(0, 0, game.width, game.height);
        ctx.drawImage(background, 0, 0, game.width, game.height);
        ctx.fillStyle = '#555555';
    };
    
    // This method changes the position of the players
    // It refreshes based on defaultTime miliseconds
    this.update = function(game) {
        console.log('updating');
        // Left arrow
        if (game.pressedKeys[37]) { 
            // TODO: 
        }

        // Right arrow
        if (game.pressedKeys[39]) { 
            // TODO:
        }

        // TODO: 
        if (game.currentLives < 1) {
            setState(new GameOver());
        }
    };
}

var defaultBackground = './images/background.png';
var defaultWidth = 644;
var defaultHeight = 556;
var updateTime = 1000; // Miliseconds
var game = new GameCore();

attachListeners();
setState(new WelcomeState());

setInterval(function() { executeMainLoop(game); }, updateTime);
