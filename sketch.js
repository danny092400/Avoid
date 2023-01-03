class Particle {
  constructor(x, y) {
    this.x = x + (Math.random()-0.5)*rectSize;
    this.y = y + (Math.random()-0.5)*rectSize;
    let angle = Math.random()*Math.PI*2
    this.vx = Math.cos(angle)*particleVel
    this.vy = Math.sin(angle)*particleVel
  }

  move() {
    this.vy += particleGravity;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y > height) {
      this.delete();
    }
  }

  display() {
    fill(255, 100)
    rect(this.x, this.y, particleSize, particleSize)
  }

  delete() {
    let index = particles.indexOf(this);
    if (index > -1) {
      particles.splice(index, 1);
    }
  }
}

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.live = true;

    this.shake = {type: null, time: 0, angle: 0};
  }

  display() {
    fill(0, 255, 0);
    drawRect(player.x, player.y);
  }
}

class Attacker {
  constructor(type, args) {
    this.type = type;
    this.args = args;
    this.shake = false;
  }

  collide() {
    let timer = (millis() - this.args.time)*0.001;
    if (this.type === 0) {
      if (this.args.wait < timer && timer < this.args.wait + laserShootTime) {
        if ((this.args.dir == "x" && player.y == this.args.value) || (this.args.dir == "y" && player.x == this.args.value)) {
          gameFinish()
        }
      }
    }
  }

  display() {
    let timer = (millis() - this.args.time)*0.001;
    if (this.type === 0) {
      if (this.args.value < -2 || this.args.value > 2) {
        this.delete();
        return;
      }
      if (timer < this.args.wait) {
        fill(255, 255, 0, map(timer, 0, this.args.wait, 0, attakerAlpha));
      } else if (timer < this.args.wait+laserShootTime) {
        if (!this.shake) {
          this.shake = true;
          player.shake.time = millis();
          player.shake.type = 0;
          if (this.args.dir === "x") {
            for (let i = -2; i < 3; i++) {
              createParticle(i*(rectSize-rectStroke*0.5), this.args.value*(rectSize-rectStroke*0.5), 10);
            }
          } else if (this.args.dir === "y") {
            for (let i = -2; i < 3; i++) {
              createParticle(this.args.value*(rectSize-rectStroke*0.5), i*(rectSize-rectStroke*0.5), 10);
            }
          }
        }
        fill(255, 0, 0, attakerAlpha);
      } else {
        this.delete();
        return;
      }
      if (this.args.dir === "x") {
        for (let i = -2; i < 3; i++) {
          drawRect(i, this.args.value);
        }
      } else if (this.args.dir === "y") {
        for (let i = -2; i < 3; i++) {
          drawRect(this.args.value, i);
        }
      }
    }
  }

  delete() {
    let index = attackers.indexOf(this);
    if (index > -1) {
      attackers.splice(index, 1);
    }
  }

}

function gameStart() {
  background(0);
  drawMap();
  
  rectSize = 150;
  rectStroke = 10;
  rectRound = 10;

  laserSpawnTime = millis();
  laserTimer = 2;

  player = new Player();
  particles = [];
  attackers = [];

  gameStartTime = millis();
}

function gameFinish() {
  gameFinishTime = millis();
  player.live = false;
}

function shakeMap() {
  if ((millis() - player.shake.time)*0.001 > 0.03) {
    player.shake.type = null;
    player.shake.angle = 0;
    return;
  }
  if (player.shake.type === 0) {
    rotate(player.shake.angle + (noise(millis()*0.15)-0.5)*Math.PI/10)
  } else {

  }
}

function createParticle(x, y, n) {
  for (let i = 0; i < n; i++) {
    particles[particles.length] = new Particle(x, y)
  }
}

function drawRect(x, y) {
  rect(x*(rectSize-rectStroke*0.5), y*(rectSize-rectStroke*0.5), rectSize-rectStroke, rectSize-rectStroke, rectRound);
}

function drawMap() {
  background(0);
  rectMode(CENTER);
  for (let i = -2; i < 3; i++) {
    for (let j = -2; j < 3; j++) {
      fill(127);
      drawRect(i, j)
    }
  }
}

function spawnLaser(extra) {
  let attkrType = 0;
  let _dir = ["x", "y"][Math.floor(Math.random()*2)];
  let attkrArgs = {
    dir: _dir,
    value: ((_dir==="x") ? player.y : player.x) + extra,
    time: millis(),
    wait: laserTimer*0.1+0.5
  };
  attackers[attackers.length] = new Attacker(attkrType, attkrArgs);
  laserSpawnTime = millis();
}

function spawnAttaker() {
  if ((millis() - laserSpawnTime)*0.001 > laserTimer) {
    if (laserTimer > 0.7) {laserTimer -= 0.026;}

    spawnLaser(0)
    if (Math.random() < 0.4) {spawnLaser(Math.floor(Math.random()*2)*2-1)} 
    if (Math.random() < 0.4) {spawnLaser(Math.floor(Math.random()*2)*2-1)}
  }
}

let gameStartTime;
let gameFinishTime;

let mosuePosition = {px: null, py: null}

let particleVel = 2;
let particleGravity = 0.3;
let particleSize = 10;
let rectSize;
let rectStroke;
let rectRound;

let attakerAlpha = 200;

let laserSpawnTime;
let laserTimer; // max 2.0 min 0.7
let laserShootTime = 0.15;

let player;
let particles;
let attackers;

function setup() {
  const canvas = createCanvas(windowWidth-5, windowHeight-5);
	canvas.position(0, 0);
  frameRate(120);
  gameStart();
}

function draw() {
  translate(width*0.5, height*0.5);
  if (!player.live) {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(100);
    let score = Math.floor((gameFinishTime - gameStartTime)*0.001);
    text(score, 0, 0);
    return;
  }
  noStroke();
  shakeMap();
  drawMap();
  player.display();
  attackers.forEach(attkr => {
    attkr.collide();
    attkr.display();
  });
  particles.forEach(ptcl => {
    ptcl.move();
    ptcl.display();
  });

  spawnAttaker();
}

function keyPressed() {
  if (key === 'd' || key === 'D' || keyCode == RIGHT_ARROW) {
    if (player.x >= 2) return;
    player.x += 1;
  } else if (key === 'a' || key === 'A' || keyCode == LEFT_ARROW) {
    if (player.x <= -2) return;
    player.x -= 1;
  } else if (key === 's' || key === 'S' || keyCode == DOWN_ARROW) {
    if (player.y >= 2) return;
    player.y += 1;
  } else if (key === 'w' || key === 'W' || keyCode == UP_ARROW) {
    if (player.y <= -2) return;
    player.y -= 1;
  }
}

function mousePressed() {
  mosuePosition.px = mouseX;
  mosuePosition.py = mouseY;
}

function mouseReleased() {
  let dx = mouseX-mosuePosition.px;
  let dy = mouseY-mosuePosition.py;

  let move = (Math.abs(dx) > Math.abs(dy)) ? "x" : "y";

  if (move === "x" && dx > 0) {
    if (player.x >= 2) return;
    player.x += 1;
  } else if (move === "x" && dx < 0) {
    if (player.x <= -2) return;
    player.x -= 1;
  } else if (move === "y" && dy > 0) {
    if (player.y >= 2) return;
    player.y += 1;
  } else if (move === "y" && dy < 0) {
    if (player.y <= -2) return;
    player.y -= 1;
  }
}