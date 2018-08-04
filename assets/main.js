import { AudioManager } from './AudioManager.js';
import { GameEnginePeriferies } from './GameEnginePeriferies.js';

class GameEngineEntity {
    /**
     * 
     * @param {GameEngine} engine 
     * @param {string} name 
     */
    constructor(engine, name = 'entity') {
        this.name = name;
        this.engine = engine;
        this.ctx = engine.ctx;
        this.childEntities = [];
        this.position = {x:0, y:0};
        this.dimension = {width:0, height:0};
        this.direction = 0;
        this.setParent = this.setParent.bind(this);
        this.getGlobalPosition = this.getGlobalPosition.bind(this);
    }
    setParent(entity) {
        this.parent = entity;
    }
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
    getGlobalPosition(){
        let x = this.position.x;
        let y = this.position.y;
        if (this.parent){
            const ppos = this.parent.getGlobalPosition();
            x += ppos.x;
            y += ppos.y;
        }
        return {x, y};
    }
    setDimension(width, height) {
        this.dimension.width;
        this.dimension.height;
    }
    _beforeRender(time) {
        this.ctx.save();
        this.beforeRender(time);
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.direction);
    }
    beforeRender(time) {

    }
    _render(time){
        this.render(time);
    }
    render(time){
        this._render(time);
    }
    _afterRender(time){
        this.childEntities.forEach(entity => {
            entity._beforeRender(time);
            entity._render(time);
            entity._afterRender(time);
        });
        this.afterRender();
        this.ctx.restore();
    }
    afterRender(time){

    }
    addEntity(entity){
        this.childEntities.push(entity);
    }
    removeEntity(entity) {
        const i = this.childEntities.indexOf(entity);
        if (i > -1) {
            this.childEntities.splice(i, 1);
        }
    }
}

class GameEngine {
    constructor(container, size = {width: 400, height: 400}) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.oncontextmenu = e => {e.preventDefault(); return false};
        this.setCanvasSize(size.width, size.height);
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.childEntities = [];

        this.frame = this.frame.bind(this);
        this.frame();
    }
    setCanvasSize(width, height) {
        this.size = {width, height};
        this.canvas.width = this.size.width;
        this.canvas.height = this.size.height;
    }

    frame(time = 0){
        this.ctx.clearRect(0, 0, this.size.width, this.size.height);
        this.childEntities.forEach(entity => {
            entity._beforeRender(time);
            entity._render(time);
            entity._afterRender(time);
        });
        requestAnimationFrame(this.frame);
    }
    addEntity(entity){
        this.childEntities.push(entity);
    }
    removeEntity(entity) {
        const i = this.childEntities.indexOf(entity);
        if (i > -1) {
            this.childEntities.splice(i, 1);
        }
    }
}

const gameEngine = new GameEngine(document.body);

const periferies = new GameEnginePeriferies(gameEngine);
periferies.watchMouse();
periferies.watchKeyboard();
periferies.watchTouch();

const debugEntity = new GameEngineEntity(gameEngine);
debugEntity.setPosition(100, 100);
debugEntity.render = function(time) {
    this.ctx.strokeText(
        'mouseX: ' + periferies.mouse.position.current.x +
        ' mouseY: ' + periferies.mouse.position.current.y +
        ' button: ' + periferies.mouse.button + 
        ' buttons: ' + periferies.mouse.buttons,
        0,
        0
    );
    this.ctx.strokeText(
        'angle: ' + Math.atan2(periferies.mouse.position.current.x - 200, periferies.mouse.position.current.y - 200),
        0,
        20
    );
    this.ctx.strokeText(
        'kb: ' + JSON.stringify(periferies.keyboard),
        0,
        40
    );
    this.ctx.strokeText('touch: ' + JSON.stringify(periferies.touch.points[0], (key, value) => {
        if (typeof value == 'number') {
            return Math.round(value);
        }
        return value;
    }), -90, 60);
    this.ctx.strokeText('1 level entities: ' + this.engine.childEntities.length, 0, 80);
};
gameEngine.addEntity(debugEntity);

const playerEntity = new GameEngineEntity(gameEngine, 'player');
playerEntity.score = 0;
playerEntity.weaponCooldown = 10;
playerEntity.weaponRemainingCooldown = 0;
playerEntity.setPosition(50, 100);
playerEntity.beforeRender = function(time) {
    if (this.weaponRemainingCooldown > 0) {
        this.weaponRemainingCooldown--;
    }
    let x = periferies.mouse.position.current.x;
    let y = periferies.mouse.position.current.y;
    if (periferies.touch.points.length > 0) {
        x = periferies.touch.points[0].x;
        y = periferies.touch.points[0].y;
    }
    // x = x - this.engine.size.width / 2;
    // y = y - this.engine.size.height / 2;
    const pos = this.getGlobalPosition();
    x = x - pos.x;
    y = y - pos.y;
    this.direction = Math.atan2(y, x);
    ['w', 's', 'a', 'd'].forEach(key => {
        if (periferies.keyboard.keys.indexOf(key) > -1) {
            if (key == 'w') {
                this.position.y--;
            }
            if (key == 's') {
                this.position.y++;
            }
            if (key == 'a') {
                this.position.x--;
            }
            if (key == 'd') {
                this.position.x++;
            }
        }
    });
    if (periferies.mouse.buttonList.indexOf(0) > -1 || periferies.touch.points.length > 0) {
        if (this.weaponRemainingCooldown <= 0) {
            this.weaponRemainingCooldown = this.weaponCooldown;
            audioManager.playSoundNextTrack('ak47_firing');
            const x = Math.cos(this.direction) * 5;
            const y = Math.sin(this.direction) * 5;
            const bullet = new GameEngineBulletEntity(this.engine, {x: this.position.x, y:this.position.y}, {x, y});
            this.engine.addEntity(bullet);
        }
    }
};
playerEntity.render = function(time) {
    let x = periferies.mouse.position.current.x;
    let y = periferies.mouse.position.current.y;
    if (periferies.touch.points.length > 0) {
        x = periferies.touch.points[0].x;
        y = periferies.touch.points[0].y;
    }
    // x = x - this.engine.size.width / 2;
    // y = y - this.engine.size.height / 2;
    const pos = this.getGlobalPosition();
    x = x - pos.x;
    y = y - pos.y;
    this.direction = Math.atan2(y, x);

    // this.ctx.strokeStyle = 'black';

    this.ctx.beginPath();
    this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(15, 0);
    this.ctx.closePath();
    this.ctx.stroke();
};
// playerEntity.afterRender = function(time) {
//     if (periferies.mouse.buttonList.indexOf(0) > -1 || periferies.touch.points.length > 0) {
        
//     }
// }

class GameEngineBulletEntity extends GameEngineEntity {
    constructor(engine, position, velocity, destroyOutOfCanvas = true) {
        super(engine, 'bullet');
        this.position.x = position.x;
        this.position.y = position.y;
        this.velocity = {
            x: velocity.x,
            y: velocity.y
        };
        this.destroyOutOfCanvas = destroyOutOfCanvas;
    }
    beforeRender(time) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.engine.childEntities.forEach( entity => {
            if (!entity instanceof EnemyEntity) {
                return true;
            }
            // console.log('enemy');
            if(this.position.x > entity.position.x - entity.radius &&
                this.position.x < entity.position.x + entity.radius &&
                this.position.y > entity.position.y - entity.radius &&
                this.position.y < entity.position.y + entity.radius
            ) {
                // console.log('hit');
                playerEntity.score++;
                this.engine.removeEntity(entity);
                for (let i = 0; i < Math.floor(playerEntity.score * 0.001 + 1); i++) {
                    const newEnemyEntity = spawnEnemy();
                    newEnemyEntity.movementSpeed += playerEntity.score * 0.01;
                }
            }
        });
    }

    render(time) {
        this.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(-this.velocity.x,-this.velocity.y);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    afterRender(time) {
        if (this.position.x > this.engine.canvas.width || this.position.x < 0 || this.position.y > this.engine.canvas.height || this.position.y < 0) {
            if (this.parent) {
                this.parent.removeEntity(this);
            } else {
                this.engine.removeEntity(this);
            }
        }
    }

}

class EnemyEntity extends GameEngineEntity {
    constructor(gameEngine) {
        super(gameEngine, 'enemy');
        this.movementSpeed = Math.random();
        if (this.movementSpeed < 0.1) {
            this.movementSpeed = 0.1;
        } else if (this.movementSpeed > 0.9) {
            this.movementSpeed = 0.9;
        }
        this.radius = 10;
        this.velocity = {
            x: 0,
            y: 0
        };
    }
    beforeRender() {
        let x = playerEntity.position.x - this.position.x;
        let y = playerEntity.position.y - this.position.y;
        // x = Math.sqrt(x * x);
        // y = Math.sqrt(y * y);
        let dir = Math.atan2(y, x);
        x = Math.cos(dir);
        y = Math.sin(dir);
        this.position.x += x * this.movementSpeed;
        this.position.y += y * this.movementSpeed;
        // if (playerEntity.position.x > this.position.x) {
        //     this.position.x+=this.movementSpeed;
        // } else {
        //     this.position.x-=this.movementSpeed;
        // }
        // if (playerEntity.position.y > this.position.y) {
        //     this.position.y+=this.movementSpeed;
        // } else {
        //     this.position.y-=this.movementSpeed;
        // }
    }
    render() {
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
}

function spawnEnemy() {
    const enemyEntity = new EnemyEntity(gameEngine);
    enemyEntity.position.x = 300 + Math.random() * 50;
    enemyEntity.position.y = Math.random() * 300 + 50;
    gameEngine.addEntity(enemyEntity);
    return enemyEntity;
}
spawnEnemy();
// class GameEnginePhysics {
//     constructor(engine) {
//         this.engine = engine;
//         this.entities = [];
//     }
//     addEntity(entity) {
//         if (this.entities.indexOf(entity) < 0) {
//             this.entities.push(entity);
//         }
//     }
//     removeEntity(entity) {
//         const i = this.entities.indexOf(entity);
//         if (i > -1) {
//             this.entities.splice(i, 1);
//         }
//     }
//     check() {
//         for (let i = this.entities.length - 1; i > 0; i--) {
//             const entityA = this.entities[i];
//             const positionA = entityA.getGlobalPosition();
//             const dimensionA = entityA.dimension;
//             const velocityA = entityA.velocity;
//             const directionA = entityA.directionA;
//             for (let j = this.entities.length - i - 1; j >=0; j--) {
//                 const entityB = this.entities[j];
//                 const positionB = entityB.getGlobalPosition();
//                 const dimensionB = entityB.dimension;
//                 const velocityB = entityB.velocity;
//                 const directionB = entityB.directionB;
//                 if (this.isCollide({position:positionA, dimension:dimensionA}, {position:positionB, dimension:dimensionB})){
//                     entityA.collideWith(entityB);
//                     entityB.collideWith(entityA);
//                 } else if (this.willCollide({position:positionA, dimension:dimensionA, velocity: velocityA, direction: directionA}, {position:positionB, dimension:dimensionB, velocity: velocityB, direction: directionB})) {
//                     entityA.willCollide(entityB);
//                     entityB.willCollide(entityA);
//                 }
//             }
//         }
//     }
//     isCollide(entityA, entityB) {
//         const xA1 = entityA.position.x;
//         const xA2 = xA1 + entityA.dimension.width;
//         const yA1 = entityA.position.y;
//         const yA2 = yA1 + entityA.dimension.height;
//         const xB1 = entityB.position.x;
//         const xB2 = xB1 + entityB.dimension.width;
//         const yB1 = entityB.position.y;
//         const yB2 = yB1 + entityB.dimension.height;
//         let collision = false;
//         if (
//             xA1 >= xB1 && xA2 <= xB1 && yA1 >= yB1 && yA2 <= yB1 ||
//             xA1 >= xB2 && xA2 <= xB2 && yA1 >= yB2 && yA2 <= yB2
//         ) {
//             collision = true;
//         }
//         return collision;
//     }
//     willCollide(entityA, entityB) {

//     }
// }

gameEngine.addEntity(playerEntity);

const audioManager = new AudioManager('./assets/sounds/');
audioManager.loadTrack('ak47_firing', 'ak47_firing.json').then( ab => {
}, err => {
    console.warn('error occured while loading sound', err, audioManager);
});