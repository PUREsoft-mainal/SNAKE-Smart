export const Renderer = {
    drawGrid(ctx, width, height, gridSize) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
    },

    drawWalls(ctx, walls, gridSize) {
        walls.forEach(w => {
            const px = w.x * gridSize;
            const py = w.y * gridSize;
            ctx.fillStyle = "#7f8c8d";
            ctx.fillRect(px + 1, py + 1, gridSize - 2, gridSize - 2);
            ctx.strokeStyle = "#2c3e50";
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 1, py + 1, gridSize - 2, gridSize - 2);
        });
    },

    drawFood(ctx, food, gridSize) {
        ctx.font = `${gridSize - 2}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            food.icon,
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2 + 2
        );
    },

    drawSnake(ctx, snake, dx, dy, gridSize, styleType, tickCount) {
        if (snake.length === 0) return;

        if (styleType === 'line' || styleType === 'slither') {
            this.drawContinuousSnake(ctx, snake, dx, dy, gridSize, styleType === 'slither', tickCount);
        } else {
            this.drawRealisticSnake(ctx, snake, dx, dy, gridSize);
        }
    },

    // الشكل 1: الثعبان الدائري الواقعي
    drawRealisticSnake(ctx, snake, dx, dy, gridSize) {
        for (let i = snake.length - 1; i >= 0; i--) {
            const part = snake[i];
            const cx = part.x * gridSize + gridSize / 2;
            const cy = part.y * gridSize + gridSize / 2;
            const r = (gridSize / 2) * (1 - (i / (snake.length + 5)) * 0.45);

            const grad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, r);
            if (i === 0) {
                grad.addColorStop(0, "#a8e063"); grad.addColorStop(1, "#2b580c");
            } else if (i % 2 === 0) {
                grad.addColorStop(0, "#76b852"); grad.addColorStop(1, "#1e4620");
            } else {
                grad.addColorStop(0, "#f1c40f"); grad.addColorStop(1, "#2e7d32");
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            if (i === 0) this.drawHead(ctx, cx, cy, r, dx, dy);
        }
    },

    // الشكل 2 و 3: ثعبان خطي أو متلوّي كالثعبان الحقيقي
    drawContinuousSnake(ctx, snake, dx, dy, gridSize, isSlither, tickCount) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = snake.length - 1; i > 0; i--) {
            const curr = snake[i];
            const prev = snake[i - 1];

            // تجنب رسم خط عبر الشاشة عند الخروج من طرف والدخول من الآخر
            if (Math.abs(curr.x - prev.x) > 1 || Math.abs(curr.y - prev.y) > 1) continue;

            let waveX = 0, waveY = 0;
            if (isSlither) {
                const wave = Math.sin((i * 0.9) + (tickCount * 0.5)) * (gridSize * 0.22);
                waveX = (prev.y - curr.y) * wave;
                waveY = (prev.x - curr.x) * wave;
            }

            const x1 = curr.x * gridSize + gridSize / 2 + waveX;
            const y1 = curr.y * gridSize + gridSize / 2 + waveY;
            const x2 = prev.x * gridSize + gridSize / 2;
            const y2 = prev.y * gridSize + gridSize / 2;

            ctx.strokeStyle = isSlither ? "#e67e22" : "#00d2d3";
            ctx.lineWidth = Math.max(6, (gridSize * 0.75) * (1 - i / (snake.length + 4)));
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // رسم الرأس
        const head = snake;
        const hx = head.x * gridSize + gridSize / 2;
        const hy = head.y * gridSize + gridSize / 2;
        const hr = gridSize * 0.48;

        ctx.fillStyle = isSlither ? "#d35400" : "#01a3a4";
        ctx.beginPath();
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();

        this.drawHead(ctx, hx, hy, hr, dx, dy);
    },

    drawHead(ctx, cx, cy, r, dx, dy) {
        ctx.strokeStyle = "#ff2a2a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + dx * r, cy + dy * r);
        ctx.lineTo(cx + dx * (r + 7), cy + dy * (r + 7));
        ctx.stroke();

        const offset = r * 0.45;
        const forward = r * 0.3;
        let e1x = cx, e1y = cy, e2x = cx, e2y = cy;

        if (dx !== 0) {
            e1x = cx + dx * forward; e1y = cy - offset;
            e2x = cx + dx * forward; e2y = cy + offset;
        } else {
            e1x = cx - offset; e1y = cy + dy * forward;
            e2x = cx + offset; e2y = cy + dy * forward;
        }

        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(e1x, e1y, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, 3.2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath(); ctx.arc(e1x + dx, e1y + dy, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x + dx, e2y + dy, 1.6, 0, Math.PI * 2); ctx.fill();
    }
};

