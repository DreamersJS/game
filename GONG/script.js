window.addEventListener('load', function () {

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

class InputHandler{
    constructor(game){
        this.game = game;
        window.addEventListener('keydown', (event) => {
            // console.log(event);
            // console.log(this.game.keys);
            if (((event.key === 'ArrowUp') || (event.key === 'ArrowDown')) && this.game.keys.indexOf(event.key) === -1){
                this.game.keys.push(event.key);
            } else if(event.key === ' '){
                this.game.player.shoot();
            } 
        window.addEventListener('keyup', (event) => {
            if(this.game.keys.indexOf(event.key) > -1){
                this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
            }
        });
       
        });
    }
}
class Projectile{
    constructor(game,x,y){
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 3;
        this.speed = 3;
        this.markedForDeletion = false;
    }
    update(){
        this.x += this.speed;
        if(this.x > this.game.width * 0.98){
            this.markedForDeletion = true;
        }
    }
    draw(context){
        context.fillStyle = 'grey';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
class Particle{}
class Player{
    constructor(game){
        this.game = game;
        this.width = 120;
        this.height = 190;
        this.x = 20;
        this.y = 100;
        this.speedY = 0;
        this.maxSpeed = 3;
        this.projectiles = [];
    }
    update(){
        if(this.game.keys.includes('ArrowUp')){
            this.speedY =-this.maxSpeed;
        } else if(this.game.keys.includes('ArrowDown')){
            this.speedY = this.maxSpeed;
        } else {
            this.speedY = 0;
        }
        this.y += this.speedY;
        this.projectiles.forEach((projectile) => {
            projectile.update();
        });
        this.projectiles = this.projectiles.filter((projectile) => !projectile.markedForDeletion);
        }

    draw(context){
        context.fillStyle = 'black';
        context.fillRect(this.x, this.y, this.width, this.height);
        this.projectiles.forEach((projectile) => {
            projectile.draw(context);
        });
    }

    shoot(){
        if (this.game.ammo > 0){ 
            const projectile = new Projectile(this.game, this.x, this.y );
            this.projectiles.push(projectile);
            this.game.ammo--;
        }
    }
}
class Enemy{
    constructor(game){
        this.game = game;
        this.x = this.game.width;
        this.speedX = Math.random() * -1,5 - 0.5;
        this.markedForDeletion = false;
        this.lives = 2;
        this.score = this.lives;
    }
    update(){
        this.x += this.speedX;
        if(this.x + this.width < 0){
            this.markedForDeletion = true;
        }
    }
    draw(context){
        context.fillStyle = 'red';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'black';
        context.font = '20px Helvetica';
        context.fillText(this.lives, this.x, this.y);
    }
   
}
class Angler1 extends Enemy{
    constructor(game){
        super(game);
        this.width = 228 * 0.2;
        this.height = 169 * 0.2;
        this.y = Math.random() * (this.game.height * 0.9 - this.height);
    }

}
class Layer{}
class Background{}
class UI{
    constructor(game){
        this.game = game;
        this.fontSize = 25;
        this.fontFamily = 'Helvetica';
        this.color = 'white';
    }
    draw(context){
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'black';
        context.font = this.fontSize + 'px ' + this.fontFamily;
        context.fillText(`Score: ${this.game.score}`, 20, 40);
        context.fillStyle = this.color;
        for(let i = 0; i < this.game.ammo; i++){
            context.fillRect(20 + 5 * i,50,3,20);
        }
        const timeRemaining = Math.max(0, this.game.timeLimit - this.game.gameTime);
        context.fillText(`Time: ${Math.floor(timeRemaining / 1000)}`, this.game.width - 200, 40);
            if(this.game.gameOver){
            context.textAlign = 'center';
            let message1;
            let message2;
            if(this.game.score >= this.game.winningScore){
                message1 = 'You Win!';
                message2 = 'well done!';
            }else{
                message1 = 'Game Over';
                message2 = 'try again';
            }
            context.font = '50px ' + this.fontFamily;
            context.fillText(message1, this.game.width / 2, this.game.height / 2);
            context.font = '25px ' + this.fontFamily;
            context.fillText(message2, this.game.width / 2, this.game.height / 2 + 50);
        }
        context.restore();
    }
}
class Game{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.player = new Player(this);
        this.input= new InputHandler(this);
        this.ui = new UI(this);
        this.keys = [];
        this.ammo = 20;
        this.maxAmmo = 50;
        this.ammoTimer = 0;
        this.ammoInterval = 500;
        this.enemies = [];
        this.enemyTimer = 0;
        this.enemyInterval = 2000;
        this.gameOver = false;
        this.score = 0;
        this.winningScore = 10;
        this.gameTime = 0;
        this.timeLimit = 30000;
    }
    update(deltaTime){
        if (!this.gameOver) {
            this.gameTime += deltaTime;
        }
        if(this.gameTime > this.timeLimit){
            this.gameOver = true;
        }
        this.player.update();
        if(this.ammo < this.maxAmmo && this.ammoTimer > this.ammoInterval){
            this.ammo++;
            this.ammoTimer = 0;
        } else {
            this.ammoTimer += deltaTime; 
        }
        this.enemies.forEach((enemy) => {
            enemy.update();
            if (this.checkCollision(this.player, enemy)){
                enemy.markedForDeletion = true;
            }
            this.player.projectiles.forEach((projectile) => {
                if(this.checkCollision(projectile, enemy)){
                    enemy.lives--;
                    projectile.markedForDeletion = true;
                    if(enemy.lives <= 0){
                        enemy.markedForDeletion = true;
                        if (!this.gameOver) {
                            this.score += enemy.score;
                        }
                        if(this.score >= this.winningScore){
                            this.gameOver = true;
                        }
                    }
                }
            });
        });
        this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
        if (this.enemyTimer > this.enemyInterval && !this.gameOver){
            this.addEnemy();
            this.enemyTimer = 0;
            
            
        }else{
            this.enemyTimer += deltaTime; 
        }
    }
    draw(context){
        this.player.draw(context);
        this.ui.draw(context);
        this.enemies.forEach((enemy) => {
            enemy.draw(context);
        });
    }

    addEnemy(){
        const enemy = new Angler1(this);
        this.enemies.push(enemy);
        // console.log(this.enemies);
    }

    checkCollision(rect1, rect2){
        return(
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        )
    }
}

const game = new Game(canvas.width, canvas.height);
let lastTime = 0;
function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
}
animate(0);
    
})