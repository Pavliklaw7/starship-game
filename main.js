const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    lives: 3,
    color: 'white',
    angle: 0,
    hit: false,
    hitTime: 0,
};

const bullets = [];
const rocks = [];
let gameOver = false;

function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.fillStyle = ship.hit ? 'red' : ship.color;
    ctx.beginPath();
    ctx.arc(0, 0, ship.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBullet(bullet) {
    ctx.fillStyle = 'red';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawRock(rock) {
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.moveTo(rock.x + rock.size * Math.cos(rock.angle), rock.y + rock.size * Math.sin(rock.angle));
    for (let i = 1; i < 7; i++) {
        ctx.lineTo(rock.x + rock.size * Math.cos(rock.angle + i * Math.PI / 3), rock.y + rock.size * Math.sin(rock.angle + i * Math.PI / 3));
    }
    ctx.closePath();
    ctx.fill();
}

function shootBullet() {
    const bulletSpeed = 10;
    bullets.push({
        x: ship.x,
        y: ship.y,
        width: 5,
        height: 5,
        speed: bulletSpeed,
        angle: ship.angle,
    });
}

function createRock() {
    const size = Math.random() * 30 + 20;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) {
        x = Math.random() * canvas.width;
        y = -size;
    } else if (edge === 1) {
        x = canvas.width + size;
        y = Math.random() * canvas.height;
    } else if (edge === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + size;
    } else {
        x = -size;
        y = Math.random() * canvas.height;
    }
    const speed = Math.random() * 2 + 1;
    const angle = Math.atan2(ship.y - y, ship.x - x);

    rocks.push({ x, y, size, speed, angle });
}

function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawShip();

    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed * Math.cos(bullet.angle);
        bullet.y += bullet.speed * Math.sin(bullet.angle);
        drawBullet(bullet);

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    rocks.forEach((rock, index) => {
        rock.x += rock.speed * Math.cos(rock.angle);
        rock.y += rock.speed * Math.sin(rock.angle);
        drawRock(rock);

        if (Math.hypot(rock.x - ship.x, rock.y - ship.y) < ship.radius + rock.size) {
            rocks.splice(index, 1);
            ship.hit = true;
            ship.hitTime = Date.now();
            ship.lives -= 1;
            if (ship.lives === 0) {
                gameOver = true;
                alert('Game Over');
            }
        }

        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < rock.x + rock.size && bullet.x + bullet.width > rock.x - rock.size &&
                bullet.y < rock.y + rock.size && bullet.y + bullet.height > rock.y - rock.size) {
                rocks.splice(index, 1);
                bullets.splice(bIndex, 1);
            }
        });
    });

    if (ship.hit && Date.now() - ship.hitTime > 1000) {
        ship.hit = false;
    }

    requestAnimationFrame(update);
}

function updateShipAngle(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    ship.angle = Math.atan2(mouseY - ship.y, mouseX - ship.x);
}

setInterval(createRock, 1000);
canvas.addEventListener('click', shootBullet);
canvas.addEventListener('mousemove', updateShipAngle);
update();
