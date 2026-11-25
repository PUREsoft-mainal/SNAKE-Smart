export const Levels = Array.from({ length: 60 }, (_, index) => {
    const id = index + 1;
    const targetScore = 25 + (id * 15); // يزداد الهدف تدريجياً مع كل مرحلة
    const patternType = id % 6;

    return {
        id,
        name: `المرحلة ${id}`,
        targetScore,
        getWalls: (cols, rows) => {
            const walls = [];
            const midX = Math.floor(cols / 2);
            const midY = Math.floor(rows / 2);
            // ترك منطقة آمنة في المنتصف لبداية الثعبان
            const isSafeZone = (x, y) => Math.abs(x - midX) <= 2 && Math.abs(y - midY) <= 4;

            if (patternType === 1) {
                // نمط 1: حواجز أفقية متناوبة
                const step = Math.max(4, 8 - Math.floor(id / 15));
                for (let y = 4; y < rows - 4; y += step) {
                    for (let x = 3; x < cols - 3; x++) {
                        if (Math.abs(x - midX) > 2 && !isSafeZone(x, y)) walls.push({ x, y });
                    }
                }
            } else if (patternType === 2) {
                // نمط 2: تقاطعات الصليب والزوايا
                for (let x = 3; x < cols - 3; x++) {
                    if (Math.abs(x - midX) > 2 && !isSafeZone(x, midY)) walls.push({ x, y: midY });
                }
                for (let y = 3; y < rows - 3; y++) {
                    if (Math.abs(y - midY) > 3 && !isSafeZone(midX, y)) walls.push({ x: midX, y });
                }
            } else if (patternType === 3) {
                // نمط 3: الغرف والممرات الضيقة
                for (let x = 3; x < cols - 3; x++) {
                    if (x % 5 !== 0) {
                        if (!isSafeZone(x, 5)) walls.push({ x, y: 5 });
                        if (!isSafeZone(x, rows - 6)) walls.push({ x, y: rows - 6 });
                    }
                }
            } else if (patternType === 4) {
                // نمط 4: المتاهة المتعرجة (Zig-Zag)
                for (let y = 4; y < rows - 4; y += 4) {
                    for (let x = 2; x < cols - 2; x++) {
                        const evenRow = ((y / 4) % 2 === 0);
                        if (evenRow && x < cols - 5 && !isSafeZone(x, y)) walls.push({ x, y });
                        if (!evenRow && x > 4 && !isSafeZone(x, y)) walls.push({ x, y });
                    }
                }
            } else if (patternType === 5) {
                // نمط 5: الأعمدة المتفرقة (حقل الألغام الحجري)
                const spacing = Math.max(4, 7 - Math.floor(id / 20));
                for (let x = 3; x < cols - 3; x += spacing) {
                    for (let y = 3; y < rows - 3; y += spacing) {
                        if (!isSafeZone(x, y)) walls.push({ x, y });
                    }
                }
            } else {
                // نمط 6: الصندوق الداخلي ذو البوابات
                for (let x = 4; x < cols - 4; x++) {
                    if (Math.abs(x - midX) > 2) {
                        walls.push({ x, y: 4 });
                        walls.push({ x, y: rows - 5 });
                    }
                }
                for (let y = 4; y < rows - 4; y++) {
                    if (Math.abs(y - midY) > 2) {
                        walls.push({ x: 4, y });
                        walls.push({ x: cols - 5, y });
                    }
                }
            }
            return walls;
        }
    };
});

