import { GameDB } from './db.js';
import { Levels } from './levels.js';
import { Renderer } from './renderer.js';

GameDB.init();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("game-container");

const sweets = ["🍩", "🧁", "🍬", "🍭", "🍪", "🍫"]; // حلوى = 1 نقطة × السرعة
const foods = ["🍎", "🍓", "🍒", "🍉", "🍔", "🍕"];  // طعام = 2 نقطة × السرعة

const gridSize = 24;
let cols = 0, rows = 0;
let snake = [];
let walls = [];
let food = { x: 0, y: 0, icon: "🍩", basePoints: 1 };

let dx = 0, dy = -1, nextDx = 0, nextDy = -1;
let sessionScore = 0;
let speedLevel = 1; // من 1 إلى 15
let gameMode = 'box'; // 'box' (صندوق) أو 'free' (حر)
let isMazeActive = false;
let currentLevelId = 1;

let isPaused = false;
let isGameOver = false;
let gameLoop = null;
let tickCount = 0;

function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    cols = Math.floor(canvas.width / gridSize);
    rows = Math.floor(canvas.height / gridSize);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function applyThemes() {
    container.className = `bg-${GameDB.data.selectedBg}`;
    document.getElementById("controls-panel").className = `controls-panel pad-${GameDB.data.selectedPad}`;
    document.getElementById("db-points").textContent = GameDB.data.totalPoints;
    document.getElementById("db-coins").textContent = GameDB.data.coins;
}

function getIntervalMs() {
    // السرعة 1 = 220ms ، السرعة 15 = 52ms
    return Math.max(50, 232 - (speedLevel * 12));
}

function restartLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, getIntervalMs());
}

export function startGame() {
    applyThemes();
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2) + 3;
    snake = [
        { x: startX, y: startY },
        { x: startX, y: startY + 1 },
        { x: startX, y: startY + 2 }
    ];
    dx = 0; dy = -1; nextDx = 0; nextDy = -1;
    sessionScore = 0;
    isPaused = false;
    isGameOver = false;
    tickCount = 0;

    walls = [];
    const levelInfoEl = document.getElementById("level-indicator");
    if (isMazeActive) {
        const lvl = Levels.find(l => l.id === currentLevelId) || Levels;
        walls = lvl.getWalls(cols, rows);
        levelInfoEl.textContent = `${lvl.name} (الهدف: ${lvl.targetScore})`;
    } else {
        levelInfoEl.textContent = gameMode === 'box' ? "وضع الصندوق 📦" : "الوضع الحر 🌍";
    }

    updateUI();
    document.getElementById("overlay").style.display = "none";
    spawnFood();
    restartLoop();
}

function spawnFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * cols);
        food.y = Math.floor(Math.random() * rows);
        const onSnake = snake.some(p => p.x === food.x && p.y === food.y);
        const onWall = walls.some(w => w.x === food.x && w.y === food.y);
        valid = !onSnake && !onWall;
    }
    const isSweet = Math.random() > 0.5;
    if (isSweet) {
        food.icon = sweets[Math.floor(Math.random() * sweets.length)];
        food.basePoints = 1; // الحلوى = 1 نقطة
    } else {
        food.icon = foods[Math.floor(Math.random() * foods.length)];
        food.basePoints = 2; // الطعام = 2 نقطة
    }
}

function update() {
    if (isPaused || isGameOver) return;
    tickCount++;

    dx = nextDx;
    dy = nextDy;

    let nx = snake.x + dx;
    let ny = snake.y + dy;

    // التعامل مع حدود الشاشة حسب النظام (صندوق أم حر)
    if (gameMode === 'box') {
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
            return handleGameOver("اصطدمت بجدار الصندوق! 💥");
        }
    } else {
        if (nx < 0) nx = cols - 1;
        if (nx >= cols) nx = 0;
        if (ny < 0) ny = rows - 1;
        if (ny >= rows) ny = 0;
    }

    // الاصطدام بجدران المتاهة
    if (walls.some(w => w.x === nx && w.y === ny)) {
        return handleGameOver("اصطدمت بجدار المتاهة! 🧱");
    }

    // الاصطدام بالجسم
    if (snake.some(p => p.x === nx && p.y === ny)) {
        return handleGameOver("اصطدمت بجسمك! 🐍");
    }

    snake.unshift({ x: nx, y: ny });

    // الأكل واحتساب النقاط المضاعفة حسب السرعة
    if (nx === food.x && ny === food.y) {
        const earned = food.basePoints * speedLevel;
        sessionScore += earned;
        GameDB.addPoints(earned);
        updateUI();

        // التحقق من اجتياز المرحلة في نظام المتاهات
        if (isMazeActive) {
            const lvl = Levels.find(l => l.id === currentLevelId);
            if (lvl && sessionScore >= lvl.targetScore) {
                GameDB.unlockNextLevel(currentLevelId);
                isGameOver = true;
                showOverlay("مبروك! اجتزت المرحلة 🎉", `تم فتح المرحلة التالية! نقاطك: ${sessionScore}`, true);
                return;
            }
        }
        spawnFood();
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Renderer.drawGrid(ctx, canvas.width, canvas.height, gridSize);
    if (isMazeActive) Renderer.drawWalls(ctx, walls, gridSize);
    Renderer.drawFood(ctx, food, gridSize);
    Renderer.drawSnake(ctx, snake, dx, dy, gridSize, GameDB.data.selectedSnake, tickCount);
}

function handleGameOver(reason) {
    isGameOver = true;
    showOverlay("انتهت الجولة!", `${reason} | جمعت ${sessionScore} نقطة`, false);
}

function showOverlay(title, sub, isWin) {
    const ov = document.getElementById("overlay");
    document.getElementById("overlay-text").textContent = title;
    document.getElementById("overlay-sub").textContent = sub;
    const nextBtn = document.getElementById("next-lvl-btn");
    nextBtn.style.display = (isWin && currentLevelId < Levels.length) ? "inline-block" : "none";
    ov.style.display = "flex";
}

function updateUI() {
    document.getElementById("score").textContent = sessionScore;
    document.getElementById("speed-val").textContent = speedLevel;
    document.getElementById("db-points").textContent = GameDB.data.totalPoints;
    document.getElementById("db-coins").textContent = GameDB.data.coins;
}

// --- ربط أزرار التحكم والواجهة ---
window.setDirection = (ndx, ndy) => {
    if (isPaused || isGameOver) return;
    if (ndx !== 0 && dx === -ndx) return;
    if (ndy !== 0 && dy === -ndy) return;
    nextDx = ndx; nextDy = ndy;
};

window.changeSpeed = (delta) => {
    speedLevel = Math.min(15, Math.max(1, speedLevel + delta));
    updateUI();
    if (!isPaused && !isGameOver) restartLoop();
};

window.togglePause = () => {
    if (isGameOver) return;
    isPaused = !isPaused;
    if (isPaused) {
        showOverlay("اللعبة متوقفة ⏸", "اضغط (توقف) للمتابعة", false);
    } else {
        document.getElementById("overlay").style.display = "none";
    }
};

window.resetGame = () => startGame();

window.nextLevel = () => {
    if (currentLevelId < Levels.length) {
        currentLevelId++;
        startGame();
    }
};

// إدارة النوافذ (الإعدادات / المتجر)
window.openModal = (id) => {
    isPaused = true;
    renderShopAndModes();
    document.getElementById(id).style.display = "flex";
};

window.closeModal = (id) => {
    document.getElementById(id).style.display = "none";
    isPaused = false;
    applyThemes();
};

window.setMode = (mode, maze) => {
    gameMode = mode;
    isMazeActive = maze;
    closeModal('modes-modal');
    startGame();
};

window.selectMazeLevel = (lvlId, mode) => {
    if (lvlId > GameDB.data.unlockedLevels) return alert("هذه المرحلة مغلقة! اجتز المرحلة السابقة أولاً.");
    currentLevelId = lvlId;
    gameMode = mode;
    isMazeActive = true;
    closeModal('modes-modal');
    startGame();
};

window.convertCoins = () => {
    const gained = GameDB.convertPointsToCoins();
    if (gained > 0) {
        alert(`تم تحويل النقاط إلى ${gained} عملة ذهبية! 🪙`);
        updateUI();
    } else {
        alert("تحتاج إلى 5 نقاط على الأقل للحصول على عملة واحدة.");
    }
};

window.buyItem = (cat, id, price) => {
    const res = GameDB.buyOrSelectItem(cat, id, price);
    alert(res.msg);
    renderShopAndModes();
    applyThemes();
};

function renderShopAndModes() {
    // تحديث قائمة المراحل في نافذة الأنظمة
    const lvlList = document.getElementById("maze-levels-list");
    lvlList.innerHTML = Levels.map(l => {
        const locked = l.id > GameDB.data.unlockedLevels;
        return `
            <div class="level-row">
                <span>${locked ? '🔒' : '🔓'} ${l.name}</span>
                <div>
                    <button ${locked ? 'disabled' : ''} onclick="selectMazeLevel(${l.id}, 'box')">صندوق</button>
                    <button ${locked ? 'disabled' : ''} onclick="selectMazeLevel(${l.id}, 'free')">حر</button>
                </div>
            </div>
        `;
    }).join('');

    // تحديث حالة عناصر المتجر
    document.querySelectorAll("[data-shop-item]").forEach(btn => {
        const id = btn.getAttribute("data-shop-item");
        const cat = btn.getAttribute("data-cat");
        const price = btn.getAttribute("data-price");
        if (GameDB.data[cat] === id) {
            btn.textContent = "مُفعّل ✅";
            btn.style.background = "#27ae60";
        } else if (GameDB.data.ownedItems.includes(id)) {
            btn.textContent = "تفعيل";
            btn.style.background = "#2980b9";
        } else {
            btn.textContent = `شراء (${price} 🪙)`;
            btn.style.background = "#e67e22";
        }
    });
}

// --- دعم لوحة المفاتيح لأنظمة Windows و Linux ---
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            e.preventDefault();
            window.setDirection(0, -1);
            break;
        case "ArrowDown":
        case "s":
        case "S":
            e.preventDefault();
            window.setDirection(0, 1);
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            e.preventDefault();
            window.setDirection(-1, 0);
            break;
        case "ArrowRight":
        case "d":
        case "D":
            e.preventDefault();
            window.setDirection(1, 0);
            break;
        case " ":
            e.preventDefault();
            window.togglePause();
            break;
        case "+":
        case "=":
            window.changeSpeed(1);
            break;
        case "-":
            window.changeSpeed(-1);
            break;
    }
});

startGame();


startGame();

