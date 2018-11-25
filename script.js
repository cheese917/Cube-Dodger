var components = [];
var points = 0;
var ticks = 0;
var ticksOnLastFire = 0;
// Array for behaviors
var behaviors = [
    // Checks if the left or right arrow is pressed and moves accordingly
    function controls() {
        if (keysPressed.keys[37]) {
            hero.x = hero.x - 9;
        }
        if (keysPressed.keys[39]) {
            hero.x = hero.x + 9;
        }
        if (keysPressed.keys[32] && ticks - 25 >= ticksOnLastFire) {
            createBullet();
            laser.play();
        }
        
    },
    //Checks if the hero character is in bounds
    function heroInBounds() {
        if (hero.x <= 0) {
            hero.x = 0;
        } else if (hero.x >= (window.innerWidth - hero.width)) {
            hero.x = window.innerWidth - hero.width;
        }
    },
    function removeBullets() {
        for (b in components) {
            if (components[b].y <= 0 && components[b].group == "bullets"){
                components.splice(b,1);
            }
        }
    },
    function spawnEnemy() {
        var spawnRate = 10;
        if (ticks % spawnRate == 0) {
            if (ticks >= 500 && Math.floor(Math.random() * 5) == 1){
                createEnemy.hardEnemy();
            }else{
                createEnemy();
            }
        }
        if (ticks % 500 == 0 && spawnRate >= 4) {
            spawnRate -= 1;
        }
        
    },
    function removeEnemy() {
        for (e in components) {
            if(components[e].y >= window.innerHeight - components[e].height && components[e].group == "enemys"){
                components.splice(e,1);
            }
        }
    },
    function detectHits() {
        for(e in components) {
            if (components[e].group == "enemys" && components[e].hitObject(hero)) {
                gameArea.gameOver();
                explosion.play();
            } 
            for(b in components) {
                if(components[b].group == "bullets" && components[e].group == "enemys" && components[e].hitObject(components[b])){
                    components.splice(e,1);
                    points++;
                    explosion.play();
                }
            }
        }
    },
    function updateScore() {
        scoreText.text = "Score: " + points;
    }
]
function createEnemy() {
    enemy = new component(40, 40, Math.floor(Math.random() * gameArea.canvas.width), 0, "#ff0000", 10, "enemys", "rect");
    createEnemy.hardEnemy = function() {
        enemy = new component(30, 30, Math.floor(Math.random() * gameArea.canvas.width), 0, "#ff9900", 10, "enemys", "rect");
    }
}

function createBullet() {
    ticksOnLastFire = ticks;
    bullet = new component(15, 15, hero.x + 17, window.innerHeight - 100, "#00ff00", -25, "bullets", "rect");
}
// Creates intial components
function createComponents() {
    hero = new component(50, 50, window.innerWidth/2, window.innerHeight - 100, "#ff00ff", 0, "hero", "rect");
    scoreText = new component(null, null, 10, 30, "#ffffff", 0, "score", "text", "Score: ", "left");
    music = new sound ("sound/aerodynamic.mp3", true);
    music.play();
    explosion = new sound ("sound/explosion.mp3", false);
    laser = new sound ("sound/laser.mp3", false);
}
// Runs when gameOver function in gameArea is called 
function gameOverEvents() {
    music.stop();
    gameOverText = new component(null, null, window.innerWidth/2, window.innerHeight/2, "#ffffff", 0, "gameOver", "text", "Game Over!", "center");
    restartText = new component(null, null, window.innerWidth/2, window.innerHeight/2 + 40, "#ffffff", 0, "gameOver", "text", "Press any key to Restart.", "center");
    gameOverText.drawComponent();
    restartText.drawComponent();
    var restarted = false;
    window.addEventListener('keydown',function(e){ 
        if(!restarted){    
            restarted = true;
            startGame();
            points = 0;
            ticks = 0;
            ticksOnLastFire = 0;
            deleteAllComponents();
        }
    })
}
function startGame() {
    gameArea();
    keysPressed();
    if (!keysPressed.keys){
        keysPressed.keys = (keysPressed.keys || []);
        for(var n; n <= 222; n++){
            keysPressed.keys[n] = false;
        }
    }
    var started = false;
    controlsText = new component(null, null, window.innerWidth/2, window.innerHeight/2 - 40, "#ffffff", 0, "startup", "text", "Use left and right arrows to move and press space to shoot.", "center");
    instructionsText = new component(null, null, window.innerWidth/2, window.innerHeight/2, "#ffffff", 0, "startup", "text", "Shoot the falling cubes to score points.", "center");
    startText = new component(null, null, window.innerWidth/2, window.innerHeight/2 + 40, "#ffffff", 0, "startup", "text", "Press any key to play!", "center");
    controlsText.drawComponent();
    instructionsText.drawComponent();
    startText.drawComponent();
    window.addEventListener('keydown',function(e){ 
        if(!started){
            deleteAllComponents();    
            started = true;
            createComponents();
            this.interval = setInterval(update, 16);
        }
    })
}

function deleteAllComponents() {
    components.splice(0);
}

// Creates a new game area
function gameArea () { 
    gameArea.canvas = document.getElementById("gameArea");
    gameArea.ctx = gameArea.canvas.getContext("2d");
    gameArea.canvas.width = window.innerWidth;
    gameArea.canvas.height = window.innerHeight;
    gameArea.clear = function() {
        gameArea.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    gameArea.gameOver = function() {
        clearInterval(interval);
        gameOverEvents();
    }
}
// The update function changes the size of the canvas to match the screen size and updates the postion of components 
function update() {
        gameArea.clear();
        gameArea.canvas.width = window.innerWidth;
        gameArea.canvas.height = window.innerHeight;
        keysPressed();
        for (c in components) {   
            components[c].update();
            components[c].drawComponent();
        }
        for(b in behaviors){
            behaviors[b]();
        }
        ticks++;
}

// Ceates array of current keys being pressed
function keysPressed() {
    window.addEventListener('keydown', function(key){
        keysPressed.keys[key.keyCode] = (key.type == "keydown");
    }),
    window.addEventListener('keyup', function(key){
        keysPressed.keys[key.keyCode] = (key.type == "keydown");
    })
} 

function sound(src, loop) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute = ("loop", loop);
    this.sound.setAttribute = ("type", "audio/mpeg");
    this.sound.setAttribute = ("preload", "auto");
    this.sound.setAttribute = ("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.load();
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
    }

}

// Component constructor
function component(width, height, x, y, color, gravity, group, type, text, align){
    this.width = width; 
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    this.gravity = gravity;
    this.group = group;
    this.type = type;
    this.text = text;
    this.align = align;
    components.push(this);
    // Updates the position of a component and runs behaviors
    this.update = function() {
        if (this.y < gameArea.canvas.height - this.height){ 
            this.y = this.y + this.gravity;
        }
    }
    // Redraws the component
    this.drawComponent = function() {
        ctx = gameArea.ctx;
        ctx.fillStyle = color;
        if (type == "rect"){
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (type == "text") {
            ctx.font = "30px Arial";
            ctx.fillStyle = this.color;
            ctx.textAlign = this.align;
            ctx.fillText(this.text, this.x, this.y);
        }
    }
    this.hitObject = function(otherObj) {
        var myLeft = this.x;
        var myBottom = this.y;
        var myRight = this.x + this.width;
        var myTop = this.y + this.height;
        var otherLeft = otherObj.x;
        var otherBottom = otherObj.y;
        var otherRight = otherObj.x + otherObj.width;
        var otherTop = otherObj.y + otherObj.height;
        if (myLeft > otherRight || myRight < otherLeft || myTop < otherBottom || myBottom > otherTop) {
            return false;
        }
        return true;
    }
} 